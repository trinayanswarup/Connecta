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
