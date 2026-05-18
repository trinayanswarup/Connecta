package agents

import (
	"context"

	"github.com/connecta/connecta/backend/internal/domain"
)

type RecommendationEnhancementRequest struct {
	TripInput                   domain.TripInput
	Estimate                    domain.UsageEstimate
	SelectedPlan                domain.PlanOption
	Alternatives                []domain.PlanOption
	DeterministicRecommendation string
	DeterministicGuide          domain.ConnectivityGuide
}

type RecommendationEnhancer interface {
	EnhanceTripRecommendation(ctx context.Context, request RecommendationEnhancementRequest) (domain.RecommendationEnhancement, error)
}
