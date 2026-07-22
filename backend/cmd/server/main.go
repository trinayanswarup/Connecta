package main

import (
	"database/sql"
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
	var usageRepository repositories.UsageSnapshotRepository
	var dbConn *sql.DB
	if cfg.DatabaseURL != "" {
		var err error
		dbConn, err = db.NewPostgresDB(cfg.DatabaseURL)
		if err != nil {
			log.Printf("warn: postgres unavailable (%v), falling back to in-memory", err)
			dbConn = nil
		} else {
			log.Printf("connected to postgres")
		}
	} else {
		log.Printf("DATABASE_URL not set, using in-memory repository")
	}

	if dbConn != nil {
		tripRepository = repositories.NewPostgresTripRepository(dbConn, log)
		usageRepository = repositories.NewPostgresUsageSnapshotRepository(dbConn, log)
	} else {
		tripRepository = repositories.NewInMemoryTripRepository()
		usageRepository = repositories.NewInMemoryUsageSnapshotRepository()
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
		usageRepository,
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
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if r.Method == http.MethodGet {
			_, _ = w.Write([]byte(`{"status":"ok"}`))
		}
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
