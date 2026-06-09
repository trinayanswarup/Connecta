package main

import (
	"fmt"
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/connecta/connecta/backend/agents"
	"github.com/connecta/connecta/backend/graph"
	"github.com/connecta/connecta/backend/graph/generated"
	"github.com/connecta/connecta/backend/internal/config"
	"github.com/connecta/connecta/backend/internal/db"
	"github.com/connecta/connecta/backend/internal/groq"
	"github.com/connecta/connecta/backend/internal/logger"
	"github.com/connecta/connecta/backend/internal/plans"
	"github.com/connecta/connecta/backend/repositories"
	"github.com/connecta/connecta/backend/services"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load() // loads .env if present, silently ignores if missing
	cfg := config.Load()
	log := logger.New(cfg.Environment)

	var tripRepository repositories.TripRepository
	if cfg.DatabaseURL != "" {
		dbConn, err := db.NewPostgresDB(cfg.DatabaseURL)
		if err != nil {
			log.Printf("warn: postgres unavailable (%v), falling back to in-memory", err)
			tripRepository = repositories.NewInMemoryTripRepository()
		} else {
			log.Printf("connected to postgres")
			tripRepository = repositories.NewPostgresTripRepository(dbConn, log)
		}
	} else {
		log.Printf("DATABASE_URL not set, using in-memory repository")
		tripRepository = repositories.NewInMemoryTripRepository()
	}

	var enhancer agents.RecommendationEnhancer
	if cfg.GroqAPIKey != "" {
		groqClient := groq.NewClient(cfg.GroqAPIKey, cfg.GroqModel)
		enhancer = groqClient
	}
	tripService := services.NewTripService(
		agents.NewUsageEstimator(),
		agents.NewPlanOptimizer(plans.MockPlans()),
		tripRepository,
		enhancer,
	)
	graphqlServer := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{
		Resolvers: graph.NewResolver(tripService),
	}))

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	mux.Handle("/graphql", withCORS(graphqlServer))

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("connecta api listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
