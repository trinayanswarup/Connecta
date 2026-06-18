package repositories

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/connecta/connecta/backend/internal/domain"
	"github.com/google/uuid"
)

type UsageSnapshotRepository interface {
	Save(ctx context.Context, snapshot domain.UsageSnapshot) (domain.UsageSnapshot, error)
	ListByTrip(ctx context.Context, tripID string) ([]domain.UsageSnapshot, error)
}

// InMemoryUsageSnapshotRepository — used when DATABASE_URL is not set.
// Mirrors InMemoryTripRepository's fallback behavior in trip_repository.go.

type InMemoryUsageSnapshotRepository struct {
	mu       sync.RWMutex
	byTripID map[string][]domain.UsageSnapshot
}

func NewInMemoryUsageSnapshotRepository() *InMemoryUsageSnapshotRepository {
	return &InMemoryUsageSnapshotRepository{
		byTripID: make(map[string][]domain.UsageSnapshot),
	}
}

func (r *InMemoryUsageSnapshotRepository) Save(_ context.Context, snapshot domain.UsageSnapshot) (domain.UsageSnapshot, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if snapshot.ID == "" {
		snapshot.ID = uuid.New().String()
	}
	if snapshot.CapturedAt.IsZero() {
		snapshot.CapturedAt = time.Now().UTC()
	}
	r.byTripID[snapshot.TripID] = append(r.byTripID[snapshot.TripID], snapshot)
	return snapshot, nil
}

func (r *InMemoryUsageSnapshotRepository) ListByTrip(_ context.Context, tripID string) ([]domain.UsageSnapshot, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	snapshots := r.byTripID[tripID]
	results := make([]domain.UsageSnapshot, len(snapshots))
	copy(results, snapshots)
	return results, nil
}

// PostgresUsageSnapshotRepository — persists to the usage_snapshots table
// added by the SailGuard integration migration in supabase/schema.sql.

type PostgresUsageSnapshotRepository struct {
	db  *sql.DB
	log *log.Logger
}

func NewPostgresUsageSnapshotRepository(db *sql.DB, l *log.Logger) *PostgresUsageSnapshotRepository {
	return &PostgresUsageSnapshotRepository{db: db, log: l}
}

func (r *PostgresUsageSnapshotRepository) Save(ctx context.Context, snapshot domain.UsageSnapshot) (domain.UsageSnapshot, error) {
	if snapshot.ID == "" {
		snapshot.ID = uuid.New().String()
	}
	if snapshot.CapturedAt.IsZero() {
		snapshot.CapturedAt = time.Now().UTC()
	}

	_, err := r.db.ExecContext(ctx, `
		INSERT INTO usage_snapshots (id, trip_id, data_used_mb, battery_pct, network_type, captured_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`,
		snapshot.ID,
		snapshot.TripID,
		snapshot.DataUsedMB,
		snapshot.BatteryPct,
		snapshot.NetworkType,
		snapshot.CapturedAt,
	)
	if err != nil {
		return domain.UsageSnapshot{}, fmt.Errorf("inserting usage snapshot: %w", err)
	}
	return snapshot, nil
}

func (r *PostgresUsageSnapshotRepository) ListByTrip(ctx context.Context, tripID string) ([]domain.UsageSnapshot, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, trip_id, data_used_mb, battery_pct, network_type, captured_at
		FROM usage_snapshots WHERE trip_id = $1 ORDER BY captured_at ASC
	`, tripID)
	if err != nil {
		return nil, fmt.Errorf("listing usage snapshots for trip %s: %w", tripID, err)
	}
	defer rows.Close()

	var results []domain.UsageSnapshot
	for rows.Next() {
		var s domain.UsageSnapshot
		if err := rows.Scan(&s.ID, &s.TripID, &s.DataUsedMB, &s.BatteryPct, &s.NetworkType, &s.CapturedAt); err != nil {
			r.log.Printf("warn: scanning usage snapshot row: %v", err)
			continue
		}
		results = append(results, s)
	}
	return results, rows.Err()
}
