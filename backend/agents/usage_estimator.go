package agents

import (
	"math"

	"github.com/connecta/connecta/backend/internal/domain"
)

type UsageEstimator struct{}

func NewUsageEstimator() UsageEstimator {
	return UsageEstimator{}
}

func (e UsageEstimator) Estimate(input domain.TripInput) domain.UsageEstimate {
	days := tripDays(input)
	travelerMultiplier := travelerMultiplier(input.TravelerType)
	businessMultiplier := 1.0
	if input.TravelerType == domain.TravelerBusiness {
		businessMultiplier = 1.25
	}

	breakdown := domain.UsageBreakdown{
		Maps:        round1(dailyGB(input.Usage.Maps, 0.10, 0.25, 0.45) * days * travelerMultiplier),
		Streaming:   round1(dailyGB(input.Usage.Streaming, 0.20, 0.90, 2.20) * days * travelerMultiplier),
		SocialMedia: round1(dailyGB(input.Usage.SocialMedia, 0.20, 0.70, 1.50) * days * travelerMultiplier),
		VideoCalls:  round1(dailyGB(input.Usage.VideoCalls, 0.25, 1.10, 2.50) * days * travelerMultiplier * businessMultiplier),
		Hotspot:     round1(dailyGB(input.Usage.Hotspot, 0.20, 1.00, 2.70) * days * travelerMultiplier),
		Work:        round1(dailyGB(input.Usage.Work, 0.25, 0.80, 1.80) * days * travelerMultiplier * businessMultiplier),
	}

	estimated := round1(
		breakdown.Maps +
			breakdown.Streaming +
			breakdown.SocialMedia +
			breakdown.VideoCalls +
			breakdown.Hotspot +
			breakdown.Work,
	)
	recommended := roundUpGB(estimated * safetyMargin(input.TravelerType, days))

	return domain.UsageEstimate{
		EstimatedGB:   estimated,
		RecommendedGB: recommended,
		Confidence:    confidence(input, days),
		Breakdown:     breakdown,
	}
}

func tripDays(input domain.TripInput) float64 {
	days := int(input.EndDate.Sub(input.StartDate).Hours()/24) + 1
	if days < 1 {
		return 1
	}
	return float64(days)
}

func dailyGB(level domain.UsageLevel, light float64, moderate float64, heavy float64) float64 {
	switch level {
	case domain.UsageNone:
		return 0
	case domain.UsageLight:
		return light
	case domain.UsageModerate:
		return moderate
	case domain.UsageHeavy:
		return heavy
	default:
		return moderate
	}
}

func travelerMultiplier(travelerType domain.TravelerType) float64 {
	switch travelerType {
	case domain.TravelerCouple:
		return 1.55
	case domain.TravelerFamily:
		return 2.35
	case domain.TravelerBusiness:
		return 1.15
	default:
		return 1.0
	}
}

func safetyMargin(travelerType domain.TravelerType, days float64) float64 {
	margin := 1.18
	if days >= 10 {
		margin += 0.07
	}
	if travelerType == domain.TravelerBusiness || travelerType == domain.TravelerFamily {
		margin += 0.05
	}
	return margin
}

func confidence(input domain.TripInput, days float64) float64 {
	score := 0.86
	if days > 14 {
		score -= 0.05
	}
	if input.Usage.Hotspot == domain.UsageHeavy || input.Usage.VideoCalls == domain.UsageHeavy {
		score -= 0.04
	}
	if score < 0.72 {
		return 0.72
	}
	return round2(score)
}

func round1(value float64) float64 {
	return math.Round(value*10) / 10
}

func round2(value float64) float64 {
	return math.Round(value*100) / 100
}

func roundUpGB(value float64) float64 {
	return math.Ceil(value)
}
