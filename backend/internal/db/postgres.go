package db

import (
	"database/sql"
	"fmt"
	"strings"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func NewPostgresDB(databaseURL string) (*sql.DB, error) {
	if databaseURL == "" {
		return nil, nil
	}
	connStr := databaseURL
	if !strings.Contains(connStr, "default_query_exec_mode") {
		if strings.Contains(connStr, "?") {
			connStr += "&default_query_exec_mode=simple_protocol"
		} else if strings.Contains(connStr, "host=") {
			connStr += " default_query_exec_mode=simple_protocol"
		} else {
			connStr += "?default_query_exec_mode=simple_protocol"
		}
	}
	db, err := sql.Open("pgx", connStr)
	if err != nil {
		return nil, fmt.Errorf("opening postgres: %w", err)
	}
	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("pinging postgres: %w", err)
	}
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	return db, nil
}
