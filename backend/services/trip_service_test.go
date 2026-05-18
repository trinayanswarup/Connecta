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
		failingEnhancer{},
	)

	analysis, err := service.AnalyzeTrip(context.Background(), testTripInput())
	if err != nil {
		t.Fatalf("AnalyzeTrip returned error: %v", err)
	}

	if !strings.Contains(analysis.Recommendation, "is the best fit") {
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

func findStep(steps []domain.AgentStep, name string) (domain.AgentStep, bool) {
	for _, step := range steps {
		if step.Name == name {
			return step, true
		}
	}
	return domain.AgentStep{}, false
}
