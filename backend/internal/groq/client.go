package groq

type Client struct {
	apiKey string
	model  string
}

func NewClient(apiKey string, model string) Client {
	return Client{
		apiKey: apiKey,
		model:  model,
	}
}
