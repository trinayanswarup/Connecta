package agents

import (
	"math"
	"sort"
	"strconv"
	"strings"

	"github.com/connecta/connecta/backend/internal/domain"
	"github.com/connecta/connecta/backend/internal/plans"
)

type PlanOptimizer struct {
	plans []plans.Plan
}

type generatedPlanTemplate struct {
	dataGB       float64
	validityDays int
	priceUSD     float64
}

var (
	brazilPlanTemplates = []generatedPlanTemplate{
		{dataGB: 1, validityDays: 7, priceUSD: 3.99},
		{dataGB: 3, validityDays: 30, priceUSD: 9.99},
		{dataGB: 5, validityDays: 30, priceUSD: 13.99},
		{dataGB: 10, validityDays: 30, priceUSD: 24.99},
		{dataGB: 20, validityDays: 30, priceUSD: 39.99},
		{dataGB: 50, validityDays: 30, priceUSD: 59.00},
	}
	europeCountryPlanTemplates = []generatedPlanTemplate{
		{dataGB: 1, validityDays: 7, priceUSD: 3.99},
		{dataGB: 3, validityDays: 30, priceUSD: 6.99},
		{dataGB: 5, validityDays: 30, priceUSD: 9.99},
		{dataGB: 10, validityDays: 30, priceUSD: 15.99},
		{dataGB: 20, validityDays: 30, priceUSD: 22.99},
		{dataGB: 50, validityDays: 30, priceUSD: 48.99},
	}
	europeRegionalPlanTemplates = []generatedPlanTemplate{
		{dataGB: 1, validityDays: 7, priceUSD: 4.99},
		{dataGB: 3, validityDays: 30, priceUSD: 12.49},
		{dataGB: 5, validityDays: 30, priceUSD: 19.49},
		{dataGB: 10, validityDays: 30, priceUSD: 35.99},
		{dataGB: 50, validityDays: 90, priceUSD: 95.99},
	}
	regionalPlanTemplates = []generatedPlanTemplate{
		{dataGB: 1, validityDays: 7, priceUSD: 4.99},
		{dataGB: 3, validityDays: 30, priceUSD: 12.49},
		{dataGB: 5, validityDays: 30, priceUSD: 19.49},
		{dataGB: 10, validityDays: 30, priceUSD: 35.99},
		{dataGB: 20, validityDays: 30, priceUSD: 59.99},
		{dataGB: 50, validityDays: 90, priceUSD: 95.99},
	}
	globalPlanTemplates = []generatedPlanTemplate{
		{dataGB: 1, validityDays: 7, priceUSD: 5.99},
		{dataGB: 3, validityDays: 30, priceUSD: 14.99},
		{dataGB: 5, validityDays: 30, priceUSD: 22.99},
		{dataGB: 10, validityDays: 30, priceUSD: 39.99},
		{dataGB: 20, validityDays: 30, priceUSD: 69.99},
		{dataGB: 50, validityDays: 30, priceUSD: 87.32},
	}
)

func NewPlanOptimizer(mockPlans []plans.Plan) PlanOptimizer {
	return PlanOptimizer{plans: mockPlans}
}

func (o PlanOptimizer) Optimize(input domain.TripInput, estimate domain.UsageEstimate) domain.OptimizationResult {
	candidates := o.candidatesFor(input.Destination)

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

	switch {
	case normalized == "GLOBAL":
		return generatedPlans("Global", "GLOBAL", "Connecta Global", 0.90, globalPlanTemplates)
	case isRegionalDestination(normalized):
		return generatedPlans(displayDestination(normalized), normalized, "Connecta Regional", 0.91, regionalTemplatesFor(normalized))
	default:
		return generatedPlans(displayDestination(normalized), normalized, "Connecta Local", 0.94, countryTemplatesFor(normalized))
	}
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

func generatedPlans(label string, destinationCode string, provider string, coverageScore float64, templates []generatedPlanTemplate) []plans.Plan {
	if strings.TrimSpace(label) == "" {
		label = "Travel"
	}

	generated := make([]plans.Plan, 0, len(templates))
	for _, template := range templates {
		dataLabel := int(template.dataGB)
		generated = append(generated, plans.Plan{
			ID:            planID(destinationCode, dataLabel),
			Provider:      provider,
			Name:          label + " " + formatGB(dataLabel),
			Destination:   destinationCode,
			PriceUSD:      template.priceUSD,
			DataGB:        template.dataGB,
			ValidityDays:  template.validityDays,
			CoverageScore: coverageScore,
		})
	}

	return generated
}

func isRegionalDestination(destination string) bool {
	switch destination {
	case "AFRICA", "ASIA", "EUROPE", "NORTH AMERICA", "SOUTH AMERICA", "OCEANIA", "MIDDLE EAST", "CARIBBEAN":
		return true
	default:
		return false
	}
}

func regionalTemplatesFor(destination string) []generatedPlanTemplate {
	if destination == "EUROPE" {
		return europeRegionalPlanTemplates
	}

	return regionalPlanTemplates
}

func countryTemplatesFor(destination string) []generatedPlanTemplate {
	if europeanCountry(destination) {
		return europeCountryPlanTemplates
	}

	return brazilPlanTemplates
}

func europeanCountry(destination string) bool {
	switch destination {
	case "ALBANIA", "ANDORRA", "AUSTRIA", "BELARUS", "BELGIUM", "BOSNIA AND HERZEGOVINA", "BULGARIA", "CROATIA", "CYPRUS", "CZECH REPUBLIC", "DENMARK", "ESTONIA", "FINLAND", "FRANCE", "GERMANY", "GREECE", "HUNGARY", "ICELAND", "IRELAND", "ITALY", "KOSOVO", "LATVIA", "LIECHTENSTEIN", "LITHUANIA", "LUXEMBOURG", "MALTA", "MOLDOVA", "MONACO", "MONTENEGRO", "NETHERLANDS", "NORTH MACEDONIA", "NORWAY", "POLAND", "PORTUGAL", "ROMANIA", "RUSSIA", "SAN MARINO", "SERBIA", "SLOVAKIA", "SLOVENIA", "SPAIN", "SWEDEN", "SWITZERLAND", "UKRAINE", "UNITED KINGDOM", "VATICAN CITY":
		return true
	default:
		return false
	}
}

func displayDestination(destination string) string {
	return strings.Join(strings.Fields(strings.Title(strings.ToLower(destination))), " ")
}

func planID(destinationCode string, dataGB int) string {
	slug := strings.ToLower(destinationCode)
	slug = strings.ReplaceAll(slug, " ", "-")
	return slug + "-" + formatGB(dataGB)
}

func formatGB(dataGB int) string {
	return strconv.Itoa(dataGB) + "GB"
}
