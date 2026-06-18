package domain

import "time"

type TravelerType string

const (
	TravelerSolo     TravelerType = "SOLO"
	TravelerCouple   TravelerType = "COUPLE"
	TravelerFamily   TravelerType = "FAMILY"
	TravelerBusiness TravelerType = "BUSINESS"
)

type UsageLevel string

const (
	UsageNone     UsageLevel = "NONE"
	UsageLight    UsageLevel = "LIGHT"
	UsageModerate UsageLevel = "MODERATE"
	UsageHeavy    UsageLevel = "HEAVY"
)

type TripInput struct {
	Destination  string
	StartDate    time.Time
	EndDate      time.Time
	TravelerType TravelerType
	BudgetUSD    *float64
	SessionID    *string
	Usage        UsageProfile
}

type UsageProfile struct {
	Streaming   UsageLevel
	VideoCalls  UsageLevel
	Hotspot     UsageLevel
	Maps        UsageLevel
	SocialMedia UsageLevel
	Work        UsageLevel
}

type UsageBreakdown struct {
	Maps        float64
	Streaming   float64
	SocialMedia float64
	VideoCalls  float64
	Hotspot     float64
	Work        float64
}

type UsageEstimate struct {
	EstimatedGB   float64
	RecommendedGB float64
	Confidence    float64
	Breakdown     UsageBreakdown
}

type PlanOption struct {
	ID            string
	Provider      string
	Name          string
	PriceUSD      float64
	DataGB        float64
	ValidityDays  int
	CoverageScore float64
	Tradeoff      string
}

type OptimizationResult struct {
	Selected     PlanOption
	Alternatives []PlanOption
}

type AgentStatus string

const (
	AgentStatusPending   AgentStatus = "PENDING"
	AgentStatusRunning   AgentStatus = "RUNNING"
	AgentStatusCompleted AgentStatus = "COMPLETED"
	AgentStatusFailed    AgentStatus = "FAILED"
	AgentStatusSkipped   AgentStatus = "SKIPPED"
)

type AgentStep struct {
	Name          string
	Status        AgentStatus
	DurationMS    int
	InputSummary  *string
	OutputSummary *string
	Retries       int
	Error         *string
}

type TripAnalysis struct {
	TripID            string
	AgentRunID        string
	SessionID         *string
	Destination       string
	StartDate         time.Time
	EndDate           time.Time
	TravelerType      TravelerType
	Estimate          UsageEstimate
	SelectedPlan      PlanOption
	Alternatives      []PlanOption
	Recommendation    string
	AgentSteps        []AgentStep
	ConnectivityGuide *ConnectivityGuide
	ConfirmedAt       *time.Time
	ConfirmedPlan     *ConfirmedPlan
}

// ConfirmedPlan is what was actually purchased for a trip, as opposed to
// SelectedPlan/Alternatives which are analyzeTrip's recommendations.
// SailGuard trips have no SelectedPlan at all (Connecta never analyzed
// them) — ConfirmedPlan is the only plan info that exists for those.
type ConfirmedPlan struct {
	Provider     string
	Name         string
	PriceUSD     float64
	DataLabel    string
	ValidityDays int
}

// ConfirmTripInput is the parsed form of GraphQL's ConfirmTripInput.
// Either TripID is set (confirming a trip analyzeTrip already created),
// or Destination/StartDate/EndDate are set (creating + confirming a new
// trip in one step, the path SailGuard uses).
type ConfirmTripInput struct {
	TripID       *string
	SessionID    *string
	Destination  *string
	StartDate    *time.Time
	EndDate      *time.Time
	TravelerType *TravelerType
	Plan         ConfirmedPlan
}

// UsageSnapshot is one real-device usage reading pushed up by SailGuard
// for a confirmed trip.
type UsageSnapshot struct {
	ID          string
	TripID      string
	DataUsedMB  float64
	BatteryPct  *int
	NetworkType *string
	CapturedAt  time.Time
}

type ConnectivityGuide struct {
	BeforeDeparture []string
	AirportSetup    []string
	OfflineStrategy []string
	BackupInternet  []string
	EmergencyAccess []string
}

type RecommendationEnhancement struct {
	Recommendation    string
	ConnectivityGuide ConnectivityGuide
}
