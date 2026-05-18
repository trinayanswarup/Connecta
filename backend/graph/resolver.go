package graph

import "github.com/connecta/connecta/backend/services"

type Resolver struct {
	TripService *services.TripService
}

func NewResolver(trips *services.TripService) *Resolver {
	return &Resolver{TripService: trips}
}
