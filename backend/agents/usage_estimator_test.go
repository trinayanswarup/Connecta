package agents

import (
	"testing"
	"time"

	"github.com/connecta/connecta/backend/internal/domain"
)

func TestUsageEstimator(t *testing.T) {
	e := NewUsageEstimator()
	base := time.Date(2026, 8, 1, 0, 0, 0, 0, time.UTC)

	allOf := func(level domain.UsageLevel) domain.UsageProfile {
		return domain.UsageProfile{
			Maps:        level,
			Streaming:   level,
			SocialMedia: level,
			VideoCalls:  level,
			Hotspot:     level,
			Work:        level,
		}
	}

	cases := []struct {
		name           string
		days           int
		travelerType   domain.TravelerType
		usage          domain.UsageProfile
		minEstimated   float64
		maxEstimated   float64
		minRecommended float64
		maxRecommended float64
	}{
		{
			name:           "7 days MODERATE SOLO",
			days:           7,
			travelerType:   domain.TravelerSolo,
			usage:          allOf(domain.UsageModerate),
			minEstimated:   15,
			maxEstimated:   20,
			minRecommended: 18,
			maxRecommended: 25,
		},
		{
			name:         "2 days LIGHT SOLO",
			days:         2,
			travelerType: domain.TravelerSolo,
			usage:        allOf(domain.UsageLight),
			maxEstimated: 5,
		},
		{
			name:         "30 days HEAVY SOLO",
			days:         30,
			travelerType: domain.TravelerSolo,
			usage:        allOf(domain.UsageHeavy),
			minEstimated: 50,
		},
		{
			name:         "1 day NONE",
			days:         1,
			travelerType: domain.TravelerSolo,
			usage:        allOf(domain.UsageNone),
			maxEstimated: 0,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			// tripDays = int(diff.Hours()/24) + 1, so for N days pass N-1 day gap
			endDate := base.AddDate(0, 0, tc.days-1)
			input := domain.TripInput{
				Destination:  "Test",
				StartDate:    base,
				EndDate:      endDate,
				TravelerType: tc.travelerType,
				Usage:        tc.usage,
			}

			est := e.Estimate(input)

			if tc.minEstimated > 0 && est.EstimatedGB < tc.minEstimated {
				t.Errorf("EstimatedGB %.1f < min %.1f", est.EstimatedGB, tc.minEstimated)
			}
			if tc.maxEstimated > 0 && est.EstimatedGB > tc.maxEstimated {
				t.Errorf("EstimatedGB %.1f > max %.1f", est.EstimatedGB, tc.maxEstimated)
			}
			// For the NONE case: both min and max are 0, so check exact zero
			if tc.minEstimated == 0 && tc.maxEstimated == 0 && est.EstimatedGB != 0 {
				t.Errorf("EstimatedGB = %.1f, want 0", est.EstimatedGB)
			}
			if tc.minRecommended > 0 && est.RecommendedGB < tc.minRecommended {
				t.Errorf("RecommendedGB %.1f < min %.1f", est.RecommendedGB, tc.minRecommended)
			}
			if tc.maxRecommended > 0 && est.RecommendedGB > tc.maxRecommended {
				t.Errorf("RecommendedGB %.1f > max %.1f", est.RecommendedGB, tc.maxRecommended)
			}
		})
	}
}
