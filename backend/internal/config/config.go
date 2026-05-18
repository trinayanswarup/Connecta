package config

import "os"

type Config struct {
	Port        string
	Environment string
	DatabaseURL string
	RedisURL    string
	GroqAPIKey  string
	GroqModel   string
	SentryDSN   string
}

func Load() Config {
	return Config{
		Port:        getEnv("PORT", "8080"),
		Environment: getEnv("ENVIRONMENT", "development"),
		DatabaseURL: os.Getenv("DATABASE_URL"),
		RedisURL:    os.Getenv("REDIS_URL"),
		GroqAPIKey:  os.Getenv("GROQ_API_KEY"),
		GroqModel:   getEnv("GROQ_MODEL", "llama-3.1-70b-versatile"),
		SentryDSN:   os.Getenv("SENTRY_DSN"),
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
