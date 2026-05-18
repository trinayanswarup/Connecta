package groq

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/connecta/connecta/backend/agents"
	"github.com/connecta/connecta/backend/internal/domain"
)

type Client struct {
	apiKey     string
	model      string
	endpoint   string
	httpClient *http.Client
}

func NewClient(apiKey string, model string) Client {
	if model == "" {
		model = "llama-3.1-70b-versatile"
	}
	return Client{
		apiKey:   strings.TrimSpace(apiKey),
		model:    model,
		endpoint: "https://api.groq.com/openai/v1/chat/completions",
		httpClient: &http.Client{
			Timeout: 12 * time.Second,
		},
	}
}

func (c Client) EnhanceTripRecommendation(ctx context.Context, request agents.RecommendationEnhancementRequest) (domain.RecommendationEnhancement, error) {
	if c.apiKey == "" {
		return domain.RecommendationEnhancement{}, errors.New("GROQ_API_KEY is not configured")
	}

	payload := chatCompletionRequest{
		Model: c.model,
		Messages: []chatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt(request)},
		},
		Temperature: 0.2,
		ResponseFormat: map[string]string{
			"type": "json_object",
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return domain.RecommendationEnhancement{}, err
	}

	httpRequest, err := http.NewRequestWithContext(ctx, http.MethodPost, c.endpoint, bytes.NewReader(body))
	if err != nil {
		return domain.RecommendationEnhancement{}, err
	}
	httpRequest.Header.Set("Authorization", "Bearer "+c.apiKey)
	httpRequest.Header.Set("Content-Type", "application/json")

	response, err := c.httpClient.Do(httpRequest)
	if err != nil {
		return domain.RecommendationEnhancement{}, err
	}
	defer response.Body.Close()

	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return domain.RecommendationEnhancement{}, fmt.Errorf("Groq request failed with status %d", response.StatusCode)
	}

	var completion chatCompletionResponse
	if err := json.NewDecoder(response.Body).Decode(&completion); err != nil {
		return domain.RecommendationEnhancement{}, err
	}
	if len(completion.Choices) == 0 {
		return domain.RecommendationEnhancement{}, errors.New("Groq response did not include choices")
	}

	return parseEnhancement(completion.Choices[0].Message.Content)
}

type chatCompletionRequest struct {
	Model          string            `json:"model"`
	Messages       []chatMessage     `json:"messages"`
	Temperature    float64           `json:"temperature"`
	ResponseFormat map[string]string `json:"response_format"`
}

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatCompletionResponse struct {
	Choices []struct {
		Message chatMessage `json:"message"`
	} `json:"choices"`
}

type enhancementResponse struct {
	Recommendation    string `json:"recommendation"`
	ConnectivityGuide struct {
		BeforeDeparture []string `json:"beforeDeparture"`
		AirportSetup    []string `json:"airportSetup"`
		OfflineStrategy []string `json:"offlineStrategy"`
		BackupInternet  []string `json:"backupInternet"`
		EmergencyAccess []string `json:"emergencyAccess"`
	} `json:"connectivityGuide"`
}

const systemPrompt = `You enhance a deterministic travel connectivity recommendation.
Return only valid JSON with keys recommendation and connectivityGuide.
Do not change the selected plan, price, data allowance, estimate, or safety target.
The recommendation should explain why the deterministic selected plan is a good fit.
Each connectivityGuide section must contain one to three concise practical steps.`

func userPrompt(request agents.RecommendationEnhancementRequest) string {
	payload := map[string]any{
		"trip": map[string]any{
			"destination":  request.TripInput.Destination,
			"startDate":    request.TripInput.StartDate.Format("2006-01-02"),
			"endDate":      request.TripInput.EndDate.Format("2006-01-02"),
			"travelerType": string(request.TripInput.TravelerType),
		},
		"usage": map[string]any{
			"estimatedGb":   request.Estimate.EstimatedGB,
			"recommendedGb": request.Estimate.RecommendedGB,
			"confidence":    request.Estimate.Confidence,
			"breakdown":     request.Estimate.Breakdown,
		},
		"selectedPlan":                request.SelectedPlan,
		"alternatives":                request.Alternatives,
		"deterministicRecommendation": request.DeterministicRecommendation,
		"deterministicGuide":          request.DeterministicGuide,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return request.DeterministicRecommendation
	}
	return string(data)
}

func parseEnhancement(content string) (domain.RecommendationEnhancement, error) {
	var parsed enhancementResponse
	if err := json.Unmarshal([]byte(strings.TrimSpace(content)), &parsed); err != nil {
		return domain.RecommendationEnhancement{}, fmt.Errorf("invalid Groq JSON response: %w", err)
	}

	enhancement := domain.RecommendationEnhancement{
		Recommendation: strings.TrimSpace(parsed.Recommendation),
		ConnectivityGuide: domain.ConnectivityGuide{
			BeforeDeparture: trimItems(parsed.ConnectivityGuide.BeforeDeparture),
			AirportSetup:    trimItems(parsed.ConnectivityGuide.AirportSetup),
			OfflineStrategy: trimItems(parsed.ConnectivityGuide.OfflineStrategy),
			BackupInternet:  trimItems(parsed.ConnectivityGuide.BackupInternet),
			EmergencyAccess: trimItems(parsed.ConnectivityGuide.EmergencyAccess),
		},
	}
	if err := validateEnhancement(enhancement); err != nil {
		return domain.RecommendationEnhancement{}, err
	}
	return enhancement, nil
}

func validateEnhancement(enhancement domain.RecommendationEnhancement) error {
	if enhancement.Recommendation == "" {
		return errors.New("Groq response missing recommendation")
	}
	if len(enhancement.ConnectivityGuide.BeforeDeparture) == 0 ||
		len(enhancement.ConnectivityGuide.AirportSetup) == 0 ||
		len(enhancement.ConnectivityGuide.OfflineStrategy) == 0 ||
		len(enhancement.ConnectivityGuide.BackupInternet) == 0 ||
		len(enhancement.ConnectivityGuide.EmergencyAccess) == 0 {
		return errors.New("Groq response missing connectivity guide sections")
	}
	return nil
}

func trimItems(items []string) []string {
	trimmed := make([]string, 0, len(items))
	for _, item := range items {
		value := strings.TrimSpace(item)
		if value != "" {
			trimmed = append(trimmed, value)
		}
	}
	return trimmed
}
