package repositories

import (
	"context"
	"sync"

	"github.com/connecta/connecta/backend/internal/domain"
)

type TripRepository interface {
	SaveAnalysis(ctx context.Context, analysis domain.TripAnalysis) error
	ListTrips(ctx context.Context) ([]domain.TripAnalysis, error)
	GetAnalysis(ctx context.Context, id string) (domain.TripAnalysis, bool, error)
}

type InMemoryTripRepository struct {
	mu       sync.RWMutex
	records map[string]domain.TripAnalysis
	order    []string
}

func NewInMemoryTripRepository() *InMemoryTripRepository {
	return &InMemoryTripRepository{
		records: make(map[string]domain.TripAnalysis),
		order:   []string{},
	}
}

func (r *InMemoryTripRepository) SaveAnalysis(_ context.Context, analysis domain.TripAnalysis) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.records[analysis.TripID]; !exists {
		r.order = append(r.order, analysis.TripID)
	}
	r.records[analysis.TripID] = analysis
	return nil
}

func (r *InMemoryTripRepository) ListTrips(_ context.Context) ([]domain.TripAnalysis, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	results := make([]domain.TripAnalysis, 0, len(r.order))
	for i := len(r.order) - 1; i >= 0; i-- {
		results = append(results, r.records[r.order[i]])
	}
	return results, nil
}

func (r *InMemoryTripRepository) GetAnalysis(_ context.Context, id string) (domain.TripAnalysis, bool, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	analysis, ok := r.records[id]
	return analysis, ok, nil
}
