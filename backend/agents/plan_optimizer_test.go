package agents

import (
	"testing"
	"time"

	"github.com/connecta/connecta/backend/internal/domain"
	"github.com/connecta/connecta/backend/internal/plans"
)

func TestOptimizeSelectsOneGBPlanForLowUsage(t *testing.T) {
	result := testOptimizerResultWithGB(1.5)
	assertPlanID(t, result.Selected, "plan-1gb")
	assertPlanPrice(t, result.Selected, 3.99)
}

func TestOptimizeSelectsThreeGBPlan(t *testing.T) {
	result := testOptimizerResultWithGB(4.0)
	assertPlanID(t, result.Selected, "plan-3gb")
	assertPlanPrice(t, result.Selected, 9.99)
}

func TestOptimizeSelectsFiveGBPlan(t *testing.T) {
	result := testOptimizerResultWithGB(8.0)
	assertPlanID(t, result.Selected, "plan-5gb")
	assertPlanPrice(t, result.Selected, 13.99)
}

func TestOptimizeSelectsTenGBPlan(t *testing.T) {
	result := testOptimizerResultWithGB(15.0)
	assertPlanID(t, result.Selected, "plan-10gb")
	assertPlanPrice(t, result.Selected, 24.99)
}

func TestOptimizeSelectsUnlimitedPlanByTripDuration(t *testing.T) {
	tests := []struct {
		days          int
		expectedID    string
		expectedPrice float64
	}{
		{10, "plan-unlimited-10", 34.99},
		{15, "plan-unlimited-15", 48.99},
		{20, "plan-unlimited-20", 59.99},
		{25, "plan-unlimited-25", 65.99},
		{30, "plan-unlimited-30", 71.99},
	}

	for _, tc := range tests {
		t.Run(tc.expectedID, func(t *testing.T) {
			result := testOptimizerResultWithGBAndDays(25.0, tc.days)
			assertPlanID(t, result.Selected, tc.expectedID)
			assertPlanPrice(t, result.Selected, tc.expectedPrice)
		})
	}
}

func TestOptimizeProvidesAlternatives(t *testing.T) {
	result := testOptimizerResultWithGB(8.0)
	if len(result.Alternatives) == 0 {
		t.Fatal("expected at least one alternative plan")
	}
	for _, alt := range result.Alternatives {
		if alt.ID == result.Selected.ID {
			t.Fatalf("alternative should differ from selected plan %s", result.Selected.ID)
		}
	}
}

func testOptimizerResultWithGB(recommendedGB float64) domain.OptimizationResult {
	return testOptimizerResultWithGBAndDays(recommendedGB, 8)
}

func testOptimizerResultWithGBAndDays(recommendedGB float64, days int) domain.OptimizationResult {
	optimizer := NewPlanOptimizer(plans.MockPlans())
	start := time.Date(2026, 6, 10, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(0, 0, days-1)
	return optimizer.Optimize(domain.TripInput{
		Destination:  "Japan",
		StartDate:    start,
		EndDate:      end,
		TravelerType: domain.TravelerSolo,
		Usage:        domain.UsageProfile{},
	}, domain.UsageEstimate{RecommendedGB: recommendedGB})
}

func assertPlanID(t *testing.T, plan domain.PlanOption, expectedID string) {
	t.Helper()
	if plan.ID != expectedID {
		t.Fatalf("expected plan ID %q, got %q", expectedID, plan.ID)
	}
}

func assertPlanPrice(t *testing.T, plan domain.PlanOption, price float64) {
	t.Helper()
	if plan.PriceUSD != price {
		t.Fatalf("expected price %.2f, got %.2f for %s", price, plan.PriceUSD, plan.Name)
	}
}
