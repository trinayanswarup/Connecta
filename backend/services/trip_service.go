package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/connecta/connecta/backend/agents"
	"github.com/connecta/connecta/backend/internal/domain"
	"github.com/connecta/connecta/backend/repositories"
)

type TripService struct {
	estimator agents.UsageEstimator
	optimizer agents.PlanOptimizer
	trips     repositories.TripRepository
}

func NewTripService(estimator agents.UsageEstimator, optimizer agents.PlanOptimizer, trips repositories.TripRepository) *TripService {
	return &TripService{
		estimator: estimator,
		optimizer: optimizer,
		trips:     trips,
	}
}

func (s *TripService) AnalyzeTrip(ctx context.Context, input domain.TripInput) (domain.TripAnalysis, error) {
	if err := validateTripInput(input); err != nil {
		return domain.TripAnalysis{}, err
	}

	steps := make([]domain.AgentStep, 0, 4)

	estimate, estimationStep := timedStep("Usage estimation", func() (domain.UsageEstimate, string, error) {
		estimate := s.estimator.Estimate(input)
		return estimate, fmt.Sprintf("%.1f GB estimated, %.0f GB recommended", estimate.EstimatedGB, estimate.RecommendedGB), nil
	}, "Deterministic usage profile and trip duration")
	steps = append(steps, estimationStep)
	if estimationStep.Error != nil {
		return domain.TripAnalysis{}, errors.New(*estimationStep.Error)
	}

	optimization, optimizationStep := timedStep("Plan optimization", func() (domain.OptimizationResult, string, error) {
		result := s.optimizer.Optimize(input, estimate)
		return result, fmt.Sprintf("%s selected at $%.2f", result.Selected.Name, result.Selected.PriceUSD), nil
	}, fmt.Sprintf("%.0f GB recommendation and budget constraints", estimate.RecommendedGB))
	steps = append(steps, optimizationStep)
	if optimizationStep.Error != nil {
		return domain.TripAnalysis{}, errors.New(*optimizationStep.Error)
	}

	recommendation, recommendationStep := timedStep("Recommendation summary", func() (string, string, error) {
		text := recommendationText(input, estimate, optimization.Selected)
		return text, "Deterministic recommendation created", nil
	}, "Selected plan, estimated usage, and safety margin")
	steps = append(steps, recommendationStep)
	if recommendationStep.Error != nil {
		return domain.TripAnalysis{}, errors.New(*recommendationStep.Error)
	}

	analysis := domain.TripAnalysis{
		TripID:         newID("trip"),
		AgentRunID:     newID("run"),
		Destination:    strings.TrimSpace(input.Destination),
		StartDate:      input.StartDate,
		EndDate:        input.EndDate,
		TravelerType:   input.TravelerType,
		Estimate:       estimate,
		SelectedPlan:   optimization.Selected,
		Alternatives:   optimization.Alternatives,
		Recommendation: recommendation,
		AgentSteps:     steps,
		ConnectivityGuide: &domain.ConnectivityGuide{
			BeforeDeparture: []string{"Install the eSIM app before leaving and keep your primary SIM active for account verification."},
			AirportSetup:    []string{"Turn on the travel data plan after landing and run a quick connectivity check."},
			OfflineStrategy: []string{"Save maps, hotel details, and tickets offline before departure."},
			BackupInternet:  []string{"Keep airport Wi-Fi and hotel Wi-Fi as fallback options."},
			EmergencyAccess: []string{"Keep roaming disabled until needed, then enable it only for emergency access."},
		},
	}

	saveStepStart := time.Now()
	steps = append(steps, domain.AgentStep{
		Name:          "Save trip",
		Status:        domain.AgentStatusCompleted,
		DurationMS:    durationMS(saveStepStart),
		InputSummary:  stringPtr("Trip analysis result"),
		OutputSummary: stringPtr("Trip saved to in-memory Phase 2 repository"),
		Retries:       0,
	})
	analysis.AgentSteps = steps
	if err := s.trips.SaveAnalysis(ctx, analysis); err != nil {
		errorMessage := err.Error()
		steps[len(steps)-1] = domain.AgentStep{
			Name:          "Save trip",
			Status:        domain.AgentStatusFailed,
			DurationMS:    durationMS(saveStepStart),
			InputSummary:  stringPtr("Trip analysis result"),
			OutputSummary: nil,
			Retries:       0,
			Error:         &errorMessage,
		}
		analysis.AgentSteps = steps
		return analysis, err
	}

	return analysis, nil
}

func (s *TripService) ListTrips(ctx context.Context) ([]domain.TripAnalysis, error) {
	return s.trips.ListTrips(ctx)
}

func (s *TripService) GetAnalysis(ctx context.Context, id string) (domain.TripAnalysis, bool, error) {
	return s.trips.GetAnalysis(ctx, id)
}

func validateTripInput(input domain.TripInput) error {
	if strings.TrimSpace(input.Destination) == "" {
		return errors.New("destination is required")
	}
	if input.StartDate.IsZero() || input.EndDate.IsZero() {
		return errors.New("trip dates are required")
	}
	if input.EndDate.Before(input.StartDate) {
		return errors.New("end date must be on or after start date")
	}
	if input.EndDate.Sub(input.StartDate).Hours()/24 > 60 {
		return errors.New("trip length must be 60 days or less")
	}
	return nil
}

func timedStep[T any](name string, fn func() (T, string, error), inputSummary string) (T, domain.AgentStep) {
	start := time.Now()
	result, outputSummary, err := fn()
	step := domain.AgentStep{
		Name:         name,
		Status:       domain.AgentStatusCompleted,
		DurationMS:   durationMS(start),
		InputSummary: stringPtr(inputSummary),
		Retries:      0,
	}
	if outputSummary != "" {
		step.OutputSummary = stringPtr(outputSummary)
	}
	if err != nil {
		message := err.Error()
		step.Status = domain.AgentStatusFailed
		step.Error = &message
	}
	return result, step
}

func recommendationText(input domain.TripInput, estimate domain.UsageEstimate, plan domain.PlanOption) string {
	budgetNote := ""
	if input.BudgetUSD != nil && plan.PriceUSD > *input.BudgetUSD {
		budgetNote = fmt.Sprintf(" It is above your $%.0f budget, but it avoids under-buying data.", *input.BudgetUSD)
	}

	return fmt.Sprintf(
		"%s is the best fit for this trip: it covers the %.0f GB recommended allowance with %.0f GB available for %s.%s",
		plan.Name,
		estimate.RecommendedGB,
		plan.DataGB,
		strings.Title(strings.ToLower(string(input.TravelerType))),
		budgetNote,
	)
}

func durationMS(start time.Time) int {
	elapsed := time.Since(start).Milliseconds()
	if elapsed < 1 {
		return 1
	}
	return int(elapsed)
}

func stringPtr(value string) *string {
	return &value
}

func newID(prefix string) string {
	var bytes [6]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return fmt.Sprintf("%s-%d", prefix, time.Now().UnixNano())
	}
	return prefix + "-" + hex.EncodeToString(bytes[:])
}
