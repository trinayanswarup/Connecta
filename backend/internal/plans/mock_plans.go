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
		{ID: "global-5", Provider: "Connecta Global", Name: "Global 5GB", Destination: "GLOBAL", PriceUSD: 12, DataGB: 5, ValidityDays: 7, CoverageScore: 0.82},
		{ID: "global-10", Provider: "Connecta Global", Name: "Global 10GB", Destination: "GLOBAL", PriceUSD: 19, DataGB: 10, ValidityDays: 15, CoverageScore: 0.86},
		{ID: "global-20", Provider: "Connecta Global", Name: "Global 20GB", Destination: "GLOBAL", PriceUSD: 31, DataGB: 20, ValidityDays: 30, CoverageScore: 0.88},
		{ID: "global-50", Provider: "Connecta Global", Name: "Global 50GB", Destination: "GLOBAL", PriceUSD: 59, DataGB: 50, ValidityDays: 30, CoverageScore: 0.90},
		{ID: "eu-10", Provider: "RoamLite", Name: "Europe 10GB", Destination: "EUROPE", PriceUSD: 14, DataGB: 10, ValidityDays: 15, CoverageScore: 0.91},
		{ID: "eu-25", Provider: "RoamLite", Name: "Europe 25GB", Destination: "EUROPE", PriceUSD: 27, DataGB: 25, ValidityDays: 30, CoverageScore: 0.92},
		{ID: "jp-15", Provider: "MetroSignal", Name: "Japan 15GB", Destination: "JAPAN", PriceUSD: 21, DataGB: 15, ValidityDays: 15, CoverageScore: 0.94},
		{ID: "us-20", Provider: "MetroSignal", Name: "United States 20GB", Destination: "UNITED STATES", PriceUSD: 29, DataGB: 20, ValidityDays: 30, CoverageScore: 0.93},
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
