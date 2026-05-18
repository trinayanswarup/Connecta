import { tripInputSchema, type TripInput } from "./schemas";

export function validateTripInput(input: unknown): TripInput {
  return tripInputSchema.parse(input);
}
