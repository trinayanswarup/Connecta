package repositories

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"strings"
	"sync"
	"time"

	"github.com/connecta/connecta/backend/internal/domain"
)

type TripRepository interface {
	SaveAnalysis(ctx context.Context, analysis domain.TripAnalysis) error
	ListTrips(ctx context.Context) ([]domain.TripAnalysis, error)
	GetAnalysis(ctx context.Context, id string) (domain.TripAnalysis, bool, error)
	GetBySession(ctx context.Context, sessionID string) ([]domain.TripAnalysis, error)
}

// InMemoryTripRepository — used when DATABASE_URL is not set.

type InMemoryTripRepository struct {
	mu      sync.RWMutex
	records map[string]domain.TripAnalysis
	order   []string
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

func (r *InMemoryTripRepository) GetBySession(_ context.Context, sessionID string) ([]domain.TripAnalysis, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var results []domain.TripAnalysis
	for i := len(r.order) - 1; i >= 0; i-- {
		analysis := r.records[r.order[i]]
		if analysis.SessionID != nil && *analysis.SessionID == sessionID {
			results = append(results, analysis)
		}
	}
	return results, nil
}

// PostgresTripRepository — persists to Supabase Postgres.

type PostgresTripRepository struct {
	db  *sql.DB
	log *log.Logger
}

func NewPostgresTripRepository(db *sql.DB, l *log.Logger) *PostgresTripRepository {
	return &PostgresTripRepository{db: db, log: l}
}

type storedRecommendation struct {
	Text         string              `json:"text"`
	SelectedPlan domain.PlanOption   `json:"selected_plan"`
	Alternatives []domain.PlanOption `json:"alternatives"`
}

func agentStatusToDB(s domain.AgentStatus) string {
	return strings.ToLower(string(s))
}

func (r *PostgresTripRepository) SaveAnalysis(ctx context.Context, analysis domain.TripAnalysis) error {
	breakdown := analysis.Estimate.Breakdown
	if math.IsNaN(breakdown.Maps) || math.IsInf(breakdown.Maps, 0) {
		breakdown.Maps = 0
	}
	if math.IsNaN(breakdown.Streaming) || math.IsInf(breakdown.Streaming, 0) {
		breakdown.Streaming = 0
	}
	if math.IsNaN(breakdown.SocialMedia) || math.IsInf(breakdown.SocialMedia, 0) {
		breakdown.SocialMedia = 0
	}
	if math.IsNaN(breakdown.VideoCalls) || math.IsInf(breakdown.VideoCalls, 0) {
		breakdown.VideoCalls = 0
	}
	if math.IsNaN(breakdown.Hotspot) || math.IsInf(breakdown.Hotspot, 0) {
		breakdown.Hotspot = 0
	}
	if math.IsNaN(breakdown.Work) || math.IsInf(breakdown.Work, 0) {
		breakdown.Work = 0
	}
	usageJSON, err := json.Marshal(breakdown)
	if err != nil {
		return fmt.Errorf("marshaling usage profile: %w", err)
	}

	rec := storedRecommendation{
		Text:         analysis.Recommendation,
		SelectedPlan: analysis.SelectedPlan,
		Alternatives: analysis.Alternatives,
	}
	recJSON, err := json.Marshal(rec)
	if err != nil {
		return fmt.Errorf("marshaling recommendation: %w", err)
	}

	var guideVal interface{}
	if analysis.ConnectivityGuide != nil {
		guideVal = analysis.ConnectivityGuide
	} else {
		guideVal = struct{}{}
	}
	guideJSON, err := json.Marshal(guideVal)
	if err != nil {
		return fmt.Errorf("marshaling connectivity guide: %w", err)
	}

	var confirmedAtVal interface{}
	if analysis.ConfirmedAt != nil {
		confirmedAtVal = *analysis.ConfirmedAt
	}

	var confirmedPlanVal interface{}
	if analysis.ConfirmedPlan != nil {
		confirmedPlanJSON, err := json.Marshal(analysis.ConfirmedPlan)
		if err != nil {
			return fmt.Errorf("marshaling confirmed plan: %w", err)
		}
		confirmedPlanVal = string(confirmedPlanJSON)
	}

	now := time.Now().UTC()

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO trips (
			id, user_id, destination, start_date, end_date, traveler_type,
			usage_profile, estimated_gb, recommended_gb,
			recommendation, connectivity_guide, confirmed_at, confirmed_plan,
			created_at, updated_at
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
		ON CONFLICT (id) DO UPDATE SET
			estimated_gb       = EXCLUDED.estimated_gb,
			recommended_gb     = EXCLUDED.recommended_gb,
			recommendation     = EXCLUDED.recommendation,
			connectivity_guide = EXCLUDED.connectivity_guide,
			confirmed_at       = EXCLUDED.confirmed_at,
			confirmed_plan     = EXCLUDED.confirmed_plan,
			updated_at         = EXCLUDED.updated_at
	`,
		analysis.TripID,
		analysis.SessionID,
		analysis.Destination,
		analysis.StartDate.Format("2006-01-02"),
		analysis.EndDate.Format("2006-01-02"),
		string(analysis.TravelerType),
		string(usageJSON),
		analysis.Estimate.EstimatedGB,
		analysis.Estimate.RecommendedGB,
		string(recJSON),
		string(guideJSON),
		confirmedAtVal,
		confirmedPlanVal,
		now,
		now,
	)
	if err != nil {
		return fmt.Errorf("inserting trip: %w", err)
	}

	if analysis.AgentRunID == "" {
		return nil
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO agent_runs (id, trip_id, status, started_at, completed_at)
		VALUES ($1, $2, 'completed', $3, $4)
		ON CONFLICT (id) DO NOTHING
	`, analysis.AgentRunID, analysis.TripID, now, now)
	if err != nil {
		r.log.Printf("warn: inserting agent_run %s: %v", analysis.AgentRunID, err)
		return nil
	}

	for _, step := range analysis.AgentSteps {
		inSummary := ""
		if step.InputSummary != nil {
			inSummary = *step.InputSummary
		}
		outSummary := ""
		if step.OutputSummary != nil {
			outSummary = *step.OutputSummary
		}
		_, serr := r.db.ExecContext(ctx, `
			INSERT INTO agent_steps (agent_run_id, step_name, status, duration_ms, input_summary, output_summary)
			VALUES ($1, $2, $3, $4, $5, $6)
		`, analysis.AgentRunID, step.Name, agentStatusToDB(step.Status), step.DurationMS, inSummary, outSummary)
		if serr != nil {
			r.log.Printf("warn: inserting agent_step %s: %v", step.Name, serr)
		}
	}

	return nil
}

const tripSelectColumns = `
	id, destination, start_date, end_date, traveler_type,
	usage_profile, estimated_gb, recommended_gb, recommendation, connectivity_guide,
	confirmed_at, confirmed_plan
`

// scanTripRow scans one trips row into a domain.TripAnalysis. scan is
// either a *sql.Row's Scan or a *sql.Rows' Scan — both have the same
// signature, so GetAnalysis, ListTrips, and GetBySession all share this.
func scanTripRow(scan func(dest ...interface{}) error) (domain.TripAnalysis, error) {
	var (
		tripID        string
		destination   string
		startDate     time.Time
		endDate       time.Time
		travelerType  string
		usageJSON     []byte
		estimatedGB   float64
		recommendedGB float64
		recJSON       []byte
		guideJSON     []byte
		confirmedAt   sql.NullTime
		confirmedJSON []byte
	)

	if err := scan(
		&tripID, &destination, &startDate, &endDate, &travelerType,
		&usageJSON, &estimatedGB, &recommendedGB, &recJSON, &guideJSON,
		&confirmedAt, &confirmedJSON,
	); err != nil {
		return domain.TripAnalysis{}, err
	}

	var rec storedRecommendation
	_ = json.Unmarshal(recJSON, &rec)

	var guide *domain.ConnectivityGuide
	if len(guideJSON) > 0 && string(guideJSON) != "null" {
		g := domain.ConnectivityGuide{}
		if json.Unmarshal(guideJSON, &g) == nil {
			guide = &g
		}
	}

	var confirmedPlan *domain.ConfirmedPlan
	if len(confirmedJSON) > 0 && string(confirmedJSON) != "null" {
		p := domain.ConfirmedPlan{}
		if json.Unmarshal(confirmedJSON, &p) == nil {
			confirmedPlan = &p
		}
	}

	var confirmedAtPtr *time.Time
	if confirmedAt.Valid {
		t := confirmedAt.Time
		confirmedAtPtr = &t
	}

	return domain.TripAnalysis{
		TripID:            tripID,
		Destination:       destination,
		StartDate:         startDate,
		EndDate:           endDate,
		TravelerType:      domain.TravelerType(travelerType),
		Estimate:          domain.UsageEstimate{EstimatedGB: estimatedGB, RecommendedGB: recommendedGB},
		SelectedPlan:      rec.SelectedPlan,
		Alternatives:      rec.Alternatives,
		Recommendation:    rec.Text,
		ConnectivityGuide: guide,
		ConfirmedAt:       confirmedAtPtr,
		ConfirmedPlan:     confirmedPlan,
	}, nil
}

func (r *PostgresTripRepository) GetAnalysis(ctx context.Context, id string) (domain.TripAnalysis, bool, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+tripSelectColumns+` FROM trips WHERE id = $1`, id)

	analysis, err := scanTripRow(row.Scan)
	if err == sql.ErrNoRows {
		return domain.TripAnalysis{}, false, nil
	}
	if err != nil {
		return domain.TripAnalysis{}, false, fmt.Errorf("querying trip %s: %w", id, err)
	}
	return analysis, true, nil
}

func (r *PostgresTripRepository) ListTrips(ctx context.Context) ([]domain.TripAnalysis, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT `+tripSelectColumns+` FROM trips ORDER BY created_at DESC LIMIT 20`)
	if err != nil {
		return nil, fmt.Errorf("listing trips: %w", err)
	}
	defer rows.Close()

	var results []domain.TripAnalysis
	for rows.Next() {
		analysis, err := scanTripRow(rows.Scan)
		if err != nil {
			r.log.Printf("warn: scanning trip row: %v", err)
			continue
		}
		results = append(results, analysis)
	}
	return results, rows.Err()
}

func (r *PostgresTripRepository) GetBySession(ctx context.Context, sessionID string) ([]domain.TripAnalysis, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT `+tripSelectColumns+` FROM trips WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`, sessionID)
	if err != nil {
		return nil, fmt.Errorf("listing trips for session: %w", err)
	}
	defer rows.Close()

	var results []domain.TripAnalysis
	for rows.Next() {
		analysis, err := scanTripRow(rows.Scan)
		if err != nil {
			r.log.Printf("warn: scanning trip row: %v", err)
			continue
		}
		results = append(results, analysis)
	}
	return results, rows.Err()
}
