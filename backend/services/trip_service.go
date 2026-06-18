package services

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/connecta/connecta/backend/agents"
	"github.com/connecta/connecta/backend/internal/domain"
	"github.com/connecta/connecta/backend/repositories"
	"github.com/google/uuid"
)

type TripService struct {
	estimator agents.UsageEstimator
	optimizer agents.PlanOptimizer
	enhancer  agents.RecommendationEnhancer
	trips     repositories.TripRepository
	usage     repositories.UsageSnapshotRepository
}

func NewTripService(estimator agents.UsageEstimator, optimizer agents.PlanOptimizer, trips repositories.TripRepository, usage repositories.UsageSnapshotRepository, enhancers ...agents.RecommendationEnhancer) *TripService {
	var enhancer agents.RecommendationEnhancer
	if len(enhancers) > 0 {
		enhancer = enhancers[0]
	}
	return &TripService{
		estimator: estimator,
		optimizer: optimizer,
		enhancer:  enhancer,
		trips:     trips,
		usage:     usage,
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

	deterministicRecommendation, recommendationStep := timedStep("Recommendation summary", func() (string, string, error) {
		text := recommendationText(input, estimate, optimization.Selected)
		return text, "Deterministic recommendation created", nil
	}, "Selected plan, estimated usage, and safety margin")
	steps = append(steps, recommendationStep)
	if recommendationStep.Error != nil {
		return domain.TripAnalysis{}, errors.New(*recommendationStep.Error)
	}

	recommendation := deterministicRecommendation
	connectivityGuide := deterministicConnectivityGuide()
	if enhancement, aiStep := s.enhanceRecommendation(ctx, input, estimate, optimization, deterministicRecommendation, connectivityGuide); aiStep.Name != "" {
		steps = append(steps, aiStep)
		if aiStep.Status == domain.AgentStatusCompleted {
			recommendation = enhancement.Recommendation
			connectivityGuide = enhancement.ConnectivityGuide
		}
	}

	analysis := domain.TripAnalysis{
		TripID:            uuid.New().String(),
		AgentRunID:        uuid.New().String(),
		SessionID:         input.SessionID,
		Destination:       strings.TrimSpace(input.Destination),
		StartDate:         input.StartDate,
		EndDate:           input.EndDate,
		TravelerType:      input.TravelerType,
		Estimate:          estimate,
		SelectedPlan:      optimization.Selected,
		Alternatives:      optimization.Alternatives,
		Recommendation:    recommendation,
		AgentSteps:        steps,
		ConnectivityGuide: &connectivityGuide,
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
		log.Printf("warn: save analysis failed (non-fatal): %v", err)
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
		// continue — return the recommendation anyway
	}

	return analysis, nil
}

func (s *TripService) ListTrips(ctx context.Context) ([]domain.TripAnalysis, error) {
	return s.trips.ListTrips(ctx)
}

func (s *TripService) GetAnalysis(ctx context.Context, id string) (domain.TripAnalysis, bool, error) {
	return s.trips.GetAnalysis(ctx, id)
}

func (s *TripService) GetBySession(ctx context.Context, sessionID string) ([]domain.TripAnalysis, error) {
	return s.trips.GetBySession(ctx, sessionID)
}

// ConfirmTrip marks a trip as actually purchased.
//
// If input.TripID is set, it confirms a trip analyzeTrip already created
// (the web checkout path) — destination/dates/recommendation are left
// untouched, only ConfirmedAt/ConfirmedPlan change.
//
// If input.TripID is empty, there is no existing Connecta trip to attach
// to (the SailGuard path, since SailGuard never calls analyzeTrip) — a
// new trip is created and confirmed in the same step. Destination,
// StartDate, and EndDate are required in that case.
func (s *TripService) ConfirmTrip(ctx context.Context, input domain.ConfirmTripInput) (domain.TripAnalysis, error) {
	now := time.Now().UTC()
	plan := input.Plan

	if input.TripID != nil && strings.TrimSpace(*input.TripID) != "" {
		analysis, ok, err := s.trips.GetAnalysis(ctx, *input.TripID)
		if err != nil {
			return domain.TripAnalysis{}, fmt.Errorf("looking up trip %s: %w", *input.TripID, err)
		}
		if !ok {
			return domain.TripAnalysis{}, fmt.Errorf("trip %s not found", *input.TripID)
		}

		analysis.ConfirmedAt = &now
		analysis.ConfirmedPlan = &plan

		if err := s.trips.SaveAnalysis(ctx, analysis); err != nil {
			return domain.TripAnalysis{}, fmt.Errorf("saving confirmed trip: %w", err)
		}
		return analysis, nil
	}

	if input.Destination == nil || strings.TrimSpace(*input.Destination) == "" {
		return domain.TripAnalysis{}, errors.New("destination is required when tripId is not provided")
	}

	// startDate/endDate are nice to have but not always available — e.g.
	// the web's "choose your own plan" shortcut skips analyzeTrip entirely
	// and never collects them. Default to a one-week placeholder rather
	// than blocking the confirmation; SailGuard always supplies real
	// dates from its own wizard, so this fallback only affects that one
	// web edge case.
	startDate := now
	if input.StartDate != nil {
		startDate = *input.StartDate
	}
	endDate := now.AddDate(0, 0, 7)
	if input.EndDate != nil {
		endDate = *input.EndDate
	}

	travelerType := domain.TravelerSolo
	if input.TravelerType != nil {
		travelerType = *input.TravelerType
	}

	analysis := domain.TripAnalysis{
		TripID:        uuid.New().String(),
		SessionID:     input.SessionID,
		Destination:   strings.TrimSpace(*input.Destination),
		StartDate:     startDate,
		EndDate:       endDate,
		TravelerType:  travelerType,
		ConfirmedAt:   &now,
		ConfirmedPlan: &plan,
	}

	if err := s.trips.SaveAnalysis(ctx, analysis); err != nil {
		return domain.TripAnalysis{}, fmt.Errorf("saving confirmed trip: %w", err)
	}
	return analysis, nil
}

func (s *TripService) SubmitUsageSnapshot(ctx context.Context, snapshot domain.UsageSnapshot) (domain.UsageSnapshot, error) {
	if strings.TrimSpace(snapshot.TripID) == "" {
		return domain.UsageSnapshot{}, errors.New("tripId is required")
	}
	return s.usage.Save(ctx, snapshot)
}

func (s *TripService) GetUsageByTrip(ctx context.Context, tripID string) ([]domain.UsageSnapshot, error) {
	return s.usage.ListByTrip(ctx, tripID)
}

func (s *TripService) enhanceRecommendation(ctx context.Context, input domain.TripInput, estimate domain.UsageEstimate, optimization domain.OptimizationResult, deterministicRecommendation string, deterministicGuide domain.ConnectivityGuide) (domain.RecommendationEnhancement, domain.AgentStep) {
	start := time.Now()
	step := domain.AgentStep{
		Name:         "AI guide generation",
		Status:       domain.AgentStatusSkipped,
		DurationMS:   durationMS(start),
		InputSummary: stringPtr("Deterministic recommendation and connectivity context"),
		Retries:      0,
	}

	if s.enhancer == nil {
		step.OutputSummary = stringPtr("Groq enhancer not configured; deterministic recommendation and guide used")
		return domain.RecommendationEnhancement{}, step
	}

	enhancement, err := s.enhancer.EnhanceTripRecommendation(ctx, agents.RecommendationEnhancementRequest{
		TripInput:                   input,
		Estimate:                    estimate,
		SelectedPlan:                optimization.Selected,
		Alternatives:                optimization.Alternatives,
		DeterministicRecommendation: deterministicRecommendation,
		DeterministicGuide:          deterministicGuide,
	})
	step.DurationMS = durationMS(start)
	if err != nil {
		message := err.Error()
		step.Status = domain.AgentStatusFailed
		step.OutputSummary = stringPtr("Fallback used: deterministic recommendation and guide retained")
		step.Error = &message
		return domain.RecommendationEnhancement{}, step
	}

	step.Status = domain.AgentStatusCompleted
	step.OutputSummary = stringPtr("AI recommendation reasoning and connectivity guide generated")
	return enhancement, step
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

	if plan.DataGB >= estimate.RecommendedGB {
		return fmt.Sprintf(
			"%s comfortably covers your trip to %s: it offers %.0f GB against a recommended %.0f GB.%s",
			plan.Name,
			input.Destination,
			plan.DataGB,
			estimate.RecommendedGB,
			budgetNote,
		)
	}

	return fmt.Sprintf(
		"%s is the closest match for your trip to %s: it offers %.0f GB, just under your recommended %.0f GB, keeping cost reasonable.%s",
		plan.Name,
		input.Destination,
		plan.DataGB,
		estimate.RecommendedGB,
		budgetNote,
	)
}

func deterministicConnectivityGuide() domain.ConnectivityGuide {
	return domain.ConnectivityGuide{
		BeforeDeparture: []string{"Install the eSIM app before leaving and keep your primary SIM active for account verification."},
		AirportSetup:    []string{"Turn on the travel data plan after landing and run a quick connectivity check."},
		OfflineStrategy: []string{"Save maps, hotel details, and tickets offline before departure."},
		BackupInternet:  []string{"Keep airport Wi-Fi and hotel Wi-Fi as fallback options."},
		EmergencyAccess: []string{"Keep roaming disabled until needed, then enable it only for emergency access."},
	}
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
