package agents

import (
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
	byID := make(map[string]domain.PlanOption, len(o.plans))
	for _, p := range o.plans {
		opt := plans.ToDomain(p)
		opt.Tradeoff = tradeoffForPlan(p.ID)
		byID[p.ID] = opt
	}

	days := int(tripDays(input))
	selectedID := selectPlanID(estimate.RecommendedGB, days)
	selected, ok := byID[selectedID]
	if !ok {
		for _, p := range o.plans {
			selected = plans.ToDomain(p)
			selected.Tradeoff = tradeoffForPlan(p.ID)
			break
		}
	}

	altIDs := planAlternatives[selectedID]
	alternatives := make([]domain.PlanOption, 0, len(altIDs))
	for _, id := range altIDs {
		if alt, exists := byID[id]; exists {
			alternatives = append(alternatives, alt)
		}
	}

	return domain.OptimizationResult{
		Selected:     selected,
		Alternatives: alternatives,
	}
}

func selectPlanID(recommendedGB float64, days int) string {
	if recommendedGB < 3 {
		return "plan-1gb"
	}
	if recommendedGB < 5 {
		return "plan-3gb"
	}
	if recommendedGB < 10 {
		return "plan-5gb"
	}
	if recommendedGB < 20 {
		return "plan-10gb"
	}
	switch {
	case days < 13:
		return "plan-unlimited-10"
	case days < 18:
		return "plan-unlimited-15"
	case days < 23:
		return "plan-unlimited-20"
	case days < 28:
		return "plan-unlimited-25"
	default:
		return "plan-unlimited-30"
	}
}

var planAlternatives = map[string][]string{
	"plan-1gb":          {"plan-3gb", "plan-5gb", "plan-10gb"},
	"plan-3gb":          {"plan-1gb", "plan-5gb", "plan-10gb"},
	"plan-5gb":          {"plan-3gb", "plan-10gb", "plan-20gb"},
	"plan-10gb":         {"plan-5gb", "plan-20gb", "plan-unlimited-10"},
	"plan-20gb":         {"plan-10gb", "plan-unlimited-10", "plan-unlimited-15"},
	"plan-unlimited-10": {"plan-20gb", "plan-unlimited-15", "plan-unlimited-20"},
	"plan-unlimited-15": {"plan-20gb", "plan-unlimited-10", "plan-unlimited-20"},
	"plan-unlimited-20": {"plan-10gb", "plan-unlimited-15", "plan-unlimited-25"},
	"plan-unlimited-25": {"plan-unlimited-20", "plan-unlimited-30", "plan-20gb"},
	"plan-unlimited-30": {"plan-unlimited-25", "plan-unlimited-20", "plan-20gb"},
}

func tradeoffForPlan(planID string) string {
	switch planID {
	case "plan-1gb":
		return "Lightweight plan for short trips with minimal data needs."
	case "plan-3gb":
		return "Balanced plan for casual browsing and occasional maps use."
	case "plan-5gb":
		return "Comfortable allowance for social media, maps, and light streaming."
	case "plan-10gb":
		return "Plenty of data for most traveller types across 30 days."
	case "plan-20gb":
		return "High data plan for heavy streamers or remote workers."
	default:
		return "No data caps — stream, call, and work freely throughout your trip."
	}
}
