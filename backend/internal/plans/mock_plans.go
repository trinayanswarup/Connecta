package plans

import "github.com/connecta/connecta/backend/internal/domain"

type Plan struct {
	ID            string
	Provider      string
	Name          string
	Destination   string
	PriceUSD      float64
	DataGB        float64
	ValidityDays  int
	CoverageScore float64
}

func MockPlans() []Plan {
	return []Plan{
		{ID: "plan-1gb", Provider: "Connecta Local", Name: "Connecta 1 GB", Destination: "global", PriceUSD: 3.99, DataGB: 1, ValidityDays: 7, CoverageScore: 0.80},
		{ID: "plan-3gb", Provider: "Connecta Local", Name: "Connecta 3 GB", Destination: "global", PriceUSD: 6.99, DataGB: 3, ValidityDays: 30, CoverageScore: 0.85},
		{ID: "plan-5gb", Provider: "Connecta Local", Name: "Connecta 5 GB", Destination: "global", PriceUSD: 9.99, DataGB: 5, ValidityDays: 30, CoverageScore: 0.85},
		{ID: "plan-10gb", Provider: "Connecta Local", Name: "Connecta 10 GB", Destination: "global", PriceUSD: 15.99, DataGB: 10, ValidityDays: 30, CoverageScore: 0.90},
		{ID: "plan-20gb", Provider: "Connecta Local", Name: "Connecta 20 GB", Destination: "global", PriceUSD: 22.99, DataGB: 20, ValidityDays: 30, CoverageScore: 0.90},
		{ID: "plan-unlimited-10", Provider: "Connecta Local", Name: "Connecta Unlimited", Destination: "global", PriceUSD: 34.99, DataGB: 999, ValidityDays: 10, CoverageScore: 0.95},
		{ID: "plan-unlimited-15", Provider: "Connecta Local", Name: "Connecta Unlimited", Destination: "global", PriceUSD: 48.99, DataGB: 999, ValidityDays: 15, CoverageScore: 0.95},
		{ID: "plan-unlimited-20", Provider: "Connecta Local", Name: "Connecta Unlimited", Destination: "global", PriceUSD: 59.99, DataGB: 999, ValidityDays: 20, CoverageScore: 0.95},
		{ID: "plan-unlimited-25", Provider: "Connecta Local", Name: "Connecta Unlimited", Destination: "global", PriceUSD: 65.99, DataGB: 999, ValidityDays: 25, CoverageScore: 0.95},
		{ID: "plan-unlimited-30", Provider: "Connecta Local", Name: "Connecta Unlimited", Destination: "global", PriceUSD: 71.99, DataGB: 999, ValidityDays: 30, CoverageScore: 0.95},
	}
}

func ToDomain(plan Plan) domain.PlanOption {
	return domain.PlanOption{
		ID:            plan.ID,
		Provider:      plan.Provider,
		Name:          plan.Name,
		PriceUSD:      plan.PriceUSD,
		DataGB:        plan.DataGB,
		ValidityDays:  plan.ValidityDays,
		CoverageScore: plan.CoverageScore,
	}
}
