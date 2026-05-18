package agents

import (
	"math"
	"sort"
	"strings"

	"github.com/connecta/connecta/backend/internal/domain"
	"github.com/connecta/connecta/backend/internal/plans"
)

type PlanOptimizer struct {
	plans []plans.Plan
}

func NewPlanOptimizer(mockPlans []plans.Plan) PlanOptimizer {
	return PlanOptimizer{plans: mockPlans}
}

func (o PlanOptimizer) Optimize(input domain.TripInput, estimate domain.UsageEstimate) domain.OptimizationResult {
	candidates := o.candidatesFor(input.Destination)
	if len(candidates) == 0 {
		candidates = o.plans
	}

	scored := make([]scoredPlan, 0, len(candidates))
	for _, plan := range candidates {
		score := scorePlan(input, estimate, plan)
		option := plans.ToDomain(plan)
		option.Tradeoff = tradeoffFor(estimate, plan)
		scored = append(scored, scoredPlan{plan: option, score: score})
	}

	sort.SliceStable(scored, func(i, j int) bool {
		return scored[i].score > scored[j].score
	})

	alternatives := make([]domain.PlanOption, 0, 3)
	for i := 1; i < len(scored) && len(alternatives) < 3; i++ {
		alternatives = append(alternatives, scored[i].plan)
	}

	return domain.OptimizationResult{
		Selected:     scored[0].plan,
		Alternatives: alternatives,
	}
}

type scoredPlan struct {
	plan  domain.PlanOption
	score float64
}

func (o PlanOptimizer) candidatesFor(destination string) []plans.Plan {
	normalized := normalizeDestination(destination)
	candidates := make([]plans.Plan, 0, len(o.plans))
	for _, plan := range o.plans {
		if plan.Destination == "GLOBAL" || plan.Destination == normalized || regionalMatch(normalized, plan.Destination) {
			candidates = append(candidates, plan)
		}
	}
	return candidates
}

func scorePlan(input domain.TripInput, estimate domain.UsageEstimate, plan plans.Plan) float64 {
	dataGap := plan.DataGB - estimate.RecommendedGB
	dataScore := 30 - math.Abs(dataGap)*1.4
	if dataGap < 0 {
		dataScore -= math.Abs(dataGap) * 8
	}

	priceScore := 35 - plan.PriceUSD
	if input.BudgetUSD != nil && plan.PriceUSD > *input.BudgetUSD {
		priceScore -= (plan.PriceUSD - *input.BudgetUSD) * 2
	}

	validityScore := 10.0
	if plan.ValidityDays < int(tripDays(input)) {
		validityScore -= 20
	}

	coverageScore := plan.CoverageScore * 20
	return dataScore + priceScore + validityScore + coverageScore
}

func tradeoffFor(estimate domain.UsageEstimate, plan plans.Plan) string {
	margin := plan.DataGB - estimate.RecommendedGB
	switch {
	case margin < 0:
		return "Cheaper, but below the recommended data allowance."
	case margin <= 3:
		return "Tight fit with little unused data."
	case margin <= 12:
		return "Best balance of price and safety margin."
	default:
		return "Safer option with extra data buffer."
	}
}

func normalizeDestination(destination string) string {
	return strings.ToUpper(strings.TrimSpace(destination))
}

func regionalMatch(destination string, region string) bool {
	if region != "EUROPE" {
		return false
	}
	switch destination {
	case "POLAND", "SPAIN", "FRANCE", "GERMANY", "ITALY", "PORTUGAL", "NETHERLANDS":
		return true
	default:
		return false
	}
}
