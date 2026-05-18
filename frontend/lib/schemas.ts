import { z } from "zod";

export const usageLevelSchema = z.enum(["NONE", "LIGHT", "MODERATE", "HEAVY"]);

export const tripInputSchema = z.object({
  destination: z.string().min(2),
  startDate: z.string().date(),
  endDate: z.string().date(),
  travelerType: z.enum(["SOLO", "COUPLE", "FAMILY", "BUSINESS"]),
  budgetUsd: z.number().positive().optional(),
  usage: z.object({
    streaming: usageLevelSchema,
    videoCalls: usageLevelSchema,
    hotspot: usageLevelSchema,
    maps: usageLevelSchema,
    socialMedia: usageLevelSchema,
    work: usageLevelSchema
  })
});

export type TripInput = z.infer<typeof tripInputSchema>;
