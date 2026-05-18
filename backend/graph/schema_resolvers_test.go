package graph

import (
	"context"
	"testing"

	"github.com/connecta/connecta/backend/agents"
	"github.com/connecta/connecta/backend/graph/models"
	"github.com/connecta/connecta/backend/internal/plans"
	"github.com/connecta/connecta/backend/repositories"
	"github.com/connecta/connecta/backend/services"
)

func TestAnalyzeTripResolverReturnsRecommendationFlow(t *testing.T) {
	resolver := NewResolver(services.NewTripService(
		agents.NewUsageEstimator(),
		agents.NewPlanOptimizer(plans.MockPlans()),
		repositories.NewInMemoryTripRepository(),
	))

	analysis, err := resolver.Mutation().AnalyzeTrip(context.Background(), models.TripInput{
		Destination:  "Japan",
		StartDate:    "2026-06-10",
		EndDate:      "2026-06-17",
		TravelerType: models.TravelerTypeSolo,
		Usage: &models.UsageInput{
			Streaming:   models.UsageLevelLight,
			VideoCalls:  models.UsageLevelLight,
			Hotspot:     models.UsageLevelNone,
			Maps:        models.UsageLevelModerate,
			SocialMedia: models.UsageLevelModerate,
			Work:        models.UsageLevelLight,
		},
	})
	if err != nil {
		t.Fatalf("AnalyzeTrip returned error: %v", err)
	}
	if analysis.TripID == "" || analysis.AgentRunID == "" {
		t.Fatalf("expected trip and agent run ids, got %#v", analysis)
	}
	if analysis.SelectedPlan == nil || analysis.SelectedPlan.ID == "" {
		t.Fatalf("expected selected plan, got %#v", analysis.SelectedPlan)
	}
	if len(analysis.AgentSteps) == 0 {
		t.Fatal("expected trace steps")
	}

	trip, err := resolver.Query().Trip(context.Background(), analysis.TripID)
	if err != nil {
		t.Fatalf("Trip returned error: %v", err)
	}
	if trip == nil || trip.Destination != "Japan" {
		t.Fatalf("expected stored trip metadata, got %#v", trip)
	}

	agentRun, err := resolver.Query().AgentRun(context.Background(), analysis.AgentRunID)
	if err != nil {
		t.Fatalf("AgentRun returned error: %v", err)
	}
	if agentRun == nil || len(agentRun.Steps) != len(analysis.AgentSteps) {
		t.Fatalf("expected stored agent run trace, got %#v", agentRun)
	}
}
