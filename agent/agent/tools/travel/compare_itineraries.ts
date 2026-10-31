import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Compare a short list of candidate travel itineraries using consistent criteria such as total duration, layovers, arrival time, and price. Use this after specific flight or rail options have been found and the user wants a structured trade-off summary. Pass provider itinerary identifiers when available; otherwise provide the relevant segment details as supplied by the search result. The response normalizes durations and currencies only when the provider offers a clear conversion basis, and keeps original quoted values visible. It can rank according to one selected priority but should still surface material trade-offs, such as a lower fare requiring an overnight connection. The comparison is based on the supplied snapshot and does not refresh availability. If an itinerary lacks a field, that criterion is marked unavailable rather than inferred.",
  inputSchema: z.object({
    itineraries: z
      .array(
        z.object({
          reference: z
            .string()
            .describe(
              "Provider itinerary identifier or concise label for this candidate.",
            ),
          mode: z
            .enum(["flight", "rail", "mixed"])
            .describe(
              "Primary transportation mode represented by the itinerary.",
            ),
          durationMinutes: z
            .number()
            .int()
            .nonnegative()
            .optional()
            .describe("Total scheduled journey duration in minutes, if known."),
          price: z
            .number()
            .nonnegative()
            .optional()
            .describe("Quoted total price for the itinerary, if known."),
          currency: z
            .string()
            .length(3)
            .optional()
            .describe("ISO currency code for the quoted price."),
          stops: z
            .number()
            .int()
            .nonnegative()
            .optional()
            .describe("Number of connections or transfers."),
          arrivalTime: z
            .string()
            .optional()
            .describe(
              "Local arrival date and time in ISO 8601 format, if known.",
            ),
        }),
      )
      .min(2)
      .max(12)
      .describe(
        "Candidate itineraries to compare; include only details available from the source results.",
      ),
    priority: z
      .enum([
        "lowest_price",
        "shortest_duration",
        "fewest_stops",
        "earliest_arrival",
      ])
      .optional()
      .describe("Primary criterion used to order the comparison."),
    targetCurrency: z
      .string()
      .length(3)
      .optional()
      .describe(
        "Currency to request for normalized prices when conversion is available.",
      ),
    factors: z
      .array(
        z.enum([
          "price",
          "duration",
          "stops",
          "arrival_time",
          "fare_flexibility",
        ]),
      )
      .max(5)
      .optional()
      .describe(
        "Additional comparison criteria to surface alongside the primary priority.",
      ),
    includeTradeoffs: z
      .boolean()
      .optional()
      .describe(
        "Whether to include a concise explanation of notable compromises among options.",
      ),
  }),
  async execute() {
    return serviceUnavailable("travel service", "compare itineraries");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("travel")
    ? { "travel-compare_itineraries": registeredTool }
    : null,
);
