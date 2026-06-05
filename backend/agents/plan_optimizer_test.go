package agents

import (
	"strings"
	"testing"
	"time"

	"github.com/connecta/connecta/backend/internal/domain"
	"github.com/connecta/connecta/backend/internal/plans"
)

func TestOptimizeUsesCountryPlansForCountryDestination(t *testing.T) {
	result := testOptimizerResult("Italy")

	assertPlanScope(t, result.Selected, "Italy ", "Connecta Local")
	for _, alternative := range result.Alternatives {
		assertPlanScope(t, alternative, "Italy ", "Connecta Local")
	}
}

func TestOptimizeUsesRegionalPlansForRegionDestination(t *testing.T) {
	result := testOptimizerResult("Europe")

	assertPlanScope(t, result.Selected, "Europe ", "Connecta Regional")
	for _, alternative := range result.Alternatives {
		assertPlanScope(t, alternative, "Europe ", "Connecta Regional")
	}
}

func TestOptimizeUsesGlobalPlansForGlobalDestination(t *testing.T) {
	result := testOptimizerResult("Global")

	assertPlanScope(t, result.Selected, "Global ", "Connecta Global")
	for _, alternative := range result.Alternatives {
		assertPlanScope(t, alternative, "Global ", "Connecta Global")
	}
}

func testOptimizerResult(destination string) domain.OptimizationResult {
	optimizer := NewPlanOptimizer(plans.MockPlans())

	return optimizer.Optimize(domain.TripInput{
		Destination:  destination,
		StartDate:    time.Date(2026, 6, 10, 0, 0, 0, 0, time.UTC),
		EndDate:      time.Date(2026, 6, 17, 0, 0, 0, 0, time.UTC),
		TravelerType: domain.TravelerSolo,
		Usage:        domain.UsageProfile{},
	}, domain.UsageEstimate{RecommendedGB: 8})
}

func assertPlanScope(t *testing.T, plan domain.PlanOption, namePrefix string, provider string) {
	t.Helper()

	if !strings.HasPrefix(plan.Name, namePrefix) {
		t.Fatalf("expected plan name to start with %q, got %q", namePrefix, plan.Name)
	}
	if plan.Provider != provider {
		t.Fatalf("expected provider %q, got %q", provider, plan.Provider)
	}
}
