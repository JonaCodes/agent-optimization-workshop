import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Search train and intercity rail departures between two stations or cities on a travel date. Use this for rail alternatives, including direct and connecting services where the provider supports them. Results show operator, departure and arrival station, local times, journey duration, transfers, seat class, and an available fare with currency. Station names are resolved by the provider, so include a city or station qualifier when a name is ambiguous. An optional time window filters by local departure time; ranking can favor the earliest, fastest, or lowest-priced result. Fare availability may be limited and ticket rules can vary by operator. This search does not purchase a ticket. If the route returns no options, try nearby stations or a less restrictive time window.",
  inputSchema: z.object({
    origin: z
      .string()
      .min(2)
      .describe(
        "Departure station or city; include a country or region if the name is ambiguous.",
      ),
    destination: z.string().min(2).describe("Arrival station or city."),
    travelDate: z
      .string()
      .describe("Local travel date in ISO YYYY-MM-DD format."),
    earliestDeparture: z
      .string()
      .optional()
      .describe("Optional earliest local departure time in HH:MM format."),
    latestDeparture: z
      .string()
      .optional()
      .describe("Optional latest local departure time in HH:MM format."),
    passengers: z
      .number()
      .int()
      .min(1)
      .max(12)
      .optional()
      .describe("Number of passengers for availability and fare estimates."),
    class: z
      .enum(["standard", "first", "sleeper"])
      .optional()
      .describe("Requested rail seating or sleeper class when offered."),
    directOnly: z
      .boolean()
      .optional()
      .describe("Whether to exclude itineraries with transfers."),
    sortBy: z
      .enum(["departure", "duration", "price"])
      .optional()
      .describe("Preference for ordering matching departures."),
  }),
  async execute() {
    return serviceUnavailable("travel service", "search rail");
  },
});
