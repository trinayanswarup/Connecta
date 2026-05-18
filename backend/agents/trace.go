package agents

import "time"

type StepStatus string

const (
	StepPending   StepStatus = "pending"
	StepRunning   StepStatus = "running"
	StepCompleted StepStatus = "completed"
	StepFailed    StepStatus = "failed"
	StepSkipped   StepStatus = "skipped"
)

type StepTrace struct {
	Name          string
	Status        StepStatus
	StartedAt     time.Time
	Duration      time.Duration
	InputSummary  string
	OutputSummary string
	Retries       int
	Error         error
}
