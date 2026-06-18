package services

import (
	"context"
	"errors"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/connecta/connecta/backend/agents"
	"github.com/connecta/connecta/backend/internal/domain"
	"github.com/connecta/connecta/backend/internal/plans"
	"github.com/connecta/connecta/backend/repositories"
)

func TestAnalyzeTripFallsBackWhenEnhancerFails(t *testing.T) {
	service := NewTripService(
		agents.NewUsageEstimator(),
		agents.NewPlanOptimizer(plans.MockPlans()),
		repositories.NewInMemoryTripRepository(),
		repositories.NewInMemoryUsageSnapshotRepository(),
		failingEnhancer{},
	)

	analysis, err := service.AnalyzeTrip(context.Background(), testTripInput())
	if err != nil {
		t.Fatalf("AnalyzeTrip returned error: %v", err)
	}

	if !strings.Contains(analysis.Recommendation, "comfortably covers") &&
		!strings.Contains(analysis.Recommendation, "is the closest match") {
		t.Fatalf("expected deterministic recommendation fallback, got %q", analysis.Recommendation)
	}
	if analysis.ConnectivityGuide == nil {
		t.Fatal("expected deterministic connectivity guide fallback")
	}
	if !reflect.DeepEqual(*analysis.ConnectivityGuide, deterministicConnectivityGuide()) {
		t.Fatalf("expected deterministic guide fallback, got %#v", analysis.ConnectivityGuide)
	}

	step, ok := findStep(analysis.AgentSteps, "AI guide generation")
	if !ok {
		t.Fatal("expected AI guide generation trace step")
	}
	if step.Status != domain.AgentStatusFailed {
		t.Fatalf("expected failed AI trace step, got %s", step.Status)
	}
	if step.DurationMS < 1 {
		t.Fatalf("expected AI trace latency, got %d", step.DurationMS)
	}
	if step.OutputSummary == nil || !strings.Contains(*step.OutputSummary, "Fallback used") {
		t.Fatalf("expected fallback trace summary, got %#v", step.OutputSummary)
	}
	if step.Error == nil || !strings.Contains(*step.Error, "forced enhancer failure") {
		t.Fatalf("expected enhancer error in trace, got %#v", step.Error)
	}
}

func TestAnalyzeTripSkipsAIEnhancementWhenEnhancerIsMissing(t *testing.T) {
	service := NewTripService(
		agents.NewUsageEstimator(),
		agents.NewPlanOptimizer(plans.MockPlans()),
		repositories.NewInMemoryTripRepository(),
		repositories.NewInMemoryUsageSnapshotRepository(),
	)

	analysis, err := service.AnalyzeTrip(context.Background(), testTripInput())
	if err != nil {
		t.Fatalf("AnalyzeTrip returned error: %v", err)
	}

	step, ok := findStep(analysis.AgentSteps, "AI guide generation")
	if !ok {
		t.Fatal("expected AI guide generation trace step")
	}
	if step.Status != domain.AgentStatusSkipped {
		t.Fatalf("expected skipped AI trace step, got %s", step.Status)
	}
	if step.OutputSummary == nil || !strings.Contains(*step.OutputSummary, "not configured") {
		t.Fatalf("expected not configured trace summary, got %#v", step.OutputSummary)
	}
	if !reflect.DeepEqual(*analysis.ConnectivityGuide, deterministicConnectivityGuide()) {
		t.Fatalf("expected deterministic guide fallback, got %#v", analysis.ConnectivityGuide)
	}
}

type failingEnhancer struct{}

func (failingEnhancer) EnhanceTripRecommendation(context.Context, agents.RecommendationEnhancementRequest) (domain.RecommendationEnhancement, error) {
	return domain.RecommendationEnhancement{}, errors.New("forced enhancer failure")
}

func testTripInput() domain.TripInput {
	return domain.TripInput{
		Destination:  "Japan",
		StartDate:    mustParseDate("2026-06-10"),
		EndDate:      mustParseDate("2026-06-17"),
		TravelerType: domain.TravelerSolo,
		Usage: domain.UsageProfile{
			Streaming:   domain.UsageLight,
			VideoCalls:  domain.UsageLight,
			Hotspot:     domain.UsageNone,
			Maps:        domain.UsageModerate,
			SocialMedia: domain.UsageModerate,
			Work:        domain.UsageLight,
		},
	}
}

func mustParseDate(value string) time.Time {
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		panic(err)
	}
	return parsed
}

func TestAnalyzeTripBasicIntegration(t *testing.T) {
	service := NewTripService(
		agents.NewUsageEstimator(),
		agents.NewPlanOptimizer(plans.MockPlans()),
		repositories.NewInMemoryTripRepository(),
		repositories.NewInMemoryUsageSnapshotRepository(),
	)

	input := domain.TripInput{
		Destination:  "Japan",
		StartDate:    mustParseDate("2026-08-01"),
		EndDate:      mustParseDate("2026-08-07"),
		TravelerType: domain.TravelerSolo,
		Usage: domain.UsageProfile{
			Maps:        domain.UsageModerate,
			Streaming:   domain.UsageModerate,
			SocialMedia: domain.UsageModerate,
			VideoCalls:  domain.UsageModerate,
			Hotspot:     domain.UsageModerate,
			Work:        domain.UsageModerate,
		},
	}

	analysis, err := service.AnalyzeTrip(context.Background(), input)
	if err != nil {
		t.Fatalf("AnalyzeTrip returned error: %v", err)
	}
	if analysis.SelectedPlan.ID == "" {
		t.Error("selectedPlan should not be empty")
	}
	if analysis.Estimate.EstimatedGB <= 0 {
		t.Errorf("estimatedGb should be > 0, got %.1f", analysis.Estimate.EstimatedGB)
	}
	if len(analysis.AgentSteps) < 2 {
		t.Errorf("expected at least 2 agent steps, got %d", len(analysis.AgentSteps))
	}
	for _, step := range analysis.AgentSteps {
		if step.Status != domain.AgentStatusCompleted && step.Status != domain.AgentStatusSkipped {
			t.Errorf("step %q has unexpected status %q", step.Name, step.Status)
		}
	}
}

func findStep(steps []domain.AgentStep, name string) (domain.AgentStep, bool) {
	for _, step := range steps {
		if step.Name == name {
			return step, true
		}
	}
	return domain.AgentStep{}, false
}

func TestConfirmTripConfirmsAnExistingTrip(t *testing.T) {
	service := NewTripService(
		agents.NewUsageEstimator(),
		agents.NewPlanOptimizer(plans.MockPlans()),
		repositories.NewInMemoryTripRepository(),
		repositories.NewInMemoryUsageSnapshotRepository(),
	)

	analysis, err := service.AnalyzeTrip(context.Background(), testTripInput())
	if err != nil {
		t.Fatalf("AnalyzeTrip returned error: %v", err)
	}

	tripID := analysis.TripID
	confirmed, err := service.ConfirmTrip(context.Background(), domain.ConfirmTripInput{
		TripID: &tripID,
		Plan: domain.ConfirmedPlan{
			Provider:     "Connecta",
			Name:         "Japan 10GB",
			PriceUSD:     15.99,
			DataLabel:    "10 GB",
			ValidityDays: 30,
		},
	})
	if err != nil {
		t.Fatalf("ConfirmTrip returned error: %v", err)
	}

	if confirmed.TripID != tripID {
		t.Errorf("expected confirmed trip id %q, got %q", tripID, confirmed.TripID)
	}
	if confirmed.ConfirmedAt == nil {
		t.Fatal("expected ConfirmedAt to be set")
	}
	if confirmed.ConfirmedPlan == nil || confirmed.ConfirmedPlan.Name != "Japan 10GB" {
		t.Fatalf("expected confirmed plan to be saved, got %#v", confirmed.ConfirmedPlan)
	}
	// destination/dates/recommendation from the original analysis must be untouched
	if confirmed.Destination != analysis.Destination {
		t.Errorf("destination changed on confirm: got %q, want %q", confirmed.Destination, analysis.Destination)
	}
	if confirmed.Recommendation != analysis.Recommendation {
		t.Error("recommendation should be untouched by ConfirmTrip")
	}

	stored, ok, err := service.GetAnalysis(context.Background(), tripID)
	if err != nil || !ok {
		t.Fatalf("expected trip to be retrievable after confirm, ok=%v err=%v", ok, err)
	}
	if stored.ConfirmedAt == nil {
		t.Error("confirmation should persist through SaveAnalysis")
	}
}

func TestConfirmTripCreatesNewTripWhenNoTripIDGiven(t *testing.T) {
	tripRepo := repositories.NewInMemoryTripRepository()
	service := NewTripService(
		agents.NewUsageEstimator(),
		agents.NewPlanOptimizer(plans.MockPlans()),
		tripRepo,
		repositories.NewInMemoryUsageSnapshotRepository(),
	)

	destination := "Thailand"
	startDate := mustParseDate("2026-09-01")
	endDate := mustParseDate("2026-09-10")
	sessionID := "sailguard-link-code-123"

	confirmed, err := service.ConfirmTrip(context.Background(), domain.ConfirmTripInput{
		SessionID:   &sessionID,
		Destination: &destination,
		StartDate:   &startDate,
		EndDate:     &endDate,
		Plan: domain.ConfirmedPlan{
			Provider:     "Saily",
			Name:         "Thailand 5GB",
			PriceUSD:     12.50,
			DataLabel:    "5 GB",
			ValidityDays: 15,
		},
	})
	if err != nil {
		t.Fatalf("ConfirmTrip returned error: %v", err)
	}

	if confirmed.TripID == "" {
		t.Fatal("expected a newly generated trip id")
	}
	if confirmed.Destination != destination {
		t.Errorf("expected destination %q, got %q", destination, confirmed.Destination)
	}
	if confirmed.TravelerType != domain.TravelerSolo {
		t.Errorf("expected default travelerType SOLO, got %q", confirmed.TravelerType)
	}
	if confirmed.ConfirmedAt == nil || confirmed.ConfirmedPlan == nil {
		t.Fatal("expected confirmedAt and confirmedPlan to be set")
	}

	bySession, err := tripRepo.GetBySession(context.Background(), sessionID)
	if err != nil {
		t.Fatalf("GetBySession returned error: %v", err)
	}
	if len(bySession) != 1 || bySession[0].TripID != confirmed.TripID {
		t.Fatalf("expected the new trip to be findable by session id, got %#v", bySession)
	}
}

func TestConfirmTripDefaultsDatesWhenNotProvided(t *testing.T) {
	service := NewTripService(
		agents.NewUsageEstimator(),
		agents.NewPlanOptimizer(plans.MockPlans()),
		repositories.NewInMemoryTripRepository(),
		repositories.NewInMemoryUsageSnapshotRepository(),
	)

	destination := "Mexico"
	confirmed, err := service.ConfirmTrip(context.Background(), domain.ConfirmTripInput{
		Destination: &destination,
		Plan: domain.ConfirmedPlan{Provider: "Connecta", Name: "X", PriceUSD: 5, DataLabel: "1 GB", ValidityDays: 7},
	})
	if err != nil {
		t.Fatalf("expected no error when dates are omitted, got %v", err)
	}
	if confirmed.StartDate.IsZero() || confirmed.EndDate.IsZero() {
		t.Fatal("expected default dates to be set")
	}
	if !confirmed.EndDate.After(confirmed.StartDate) {
		t.Errorf("expected endDate after startDate, got start=%v end=%v", confirmed.StartDate, confirmed.EndDate)
	}
}

func TestConfirmTripRequiresDestinationWhenNoTripID(t *testing.T) {
	service := NewTripService(
		agents.NewUsageEstimator(),
		agents.NewPlanOptimizer(plans.MockPlans()),
		repositories.NewInMemoryTripRepository(),
		repositories.NewInMemoryUsageSnapshotRepository(),
	)

	_, err := service.ConfirmTrip(context.Background(), domain.ConfirmTripInput{
		Plan: domain.ConfirmedPlan{Provider: "Saily", Name: "X", PriceUSD: 1, DataLabel: "1 GB", ValidityDays: 7},
	})
	if err == nil {
		t.Fatal("expected an error when neither tripId nor destination/dates are provided")
	}
}

func TestSubmitUsageSnapshotRequiresTripID(t *testing.T) {
	service := NewTripService(
		agents.NewUsageEstimator(),
		agents.NewPlanOptimizer(plans.MockPlans()),
		repositories.NewInMemoryTripRepository(),
		repositories.NewInMemoryUsageSnapshotRepository(),
	)

	_, err := service.SubmitUsageSnapshot(context.Background(), domain.UsageSnapshot{DataUsedMB: 42})
	if err == nil {
		t.Fatal("expected an error when tripId is missing")
	}

	saved, err := service.SubmitUsageSnapshot(context.Background(), domain.UsageSnapshot{TripID: "trip-1", DataUsedMB: 42})
	if err != nil {
		t.Fatalf("SubmitUsageSnapshot returned error: %v", err)
	}
	if saved.ID == "" {
		t.Error("expected a generated snapshot id")
	}

	usage, err := service.GetUsageByTrip(context.Background(), "trip-1")
	if err != nil || len(usage) != 1 {
		t.Fatalf("expected 1 snapshot for trip-1, got %d (err=%v)", len(usage), err)
	}
}
