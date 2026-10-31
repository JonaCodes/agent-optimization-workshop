import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Check the latest operational status for a specific flight on a travel date. Use this for departure, arrival, gate, terminal, or delay updates after a flight has been identified. The response includes the flight number, route, scheduled and estimated local times, current status, and the provider’s last-updated timestamp when available. Flight number alone can refer to multiple dates or routes, so provide the date and optionally the departure airport to disambiguate. Status feeds may lag during operational disruptions; the returned timestamp should accompany time-sensitive summaries. This lookup does not change a booking or contact the airline. If the flight cannot be matched, verify the number and date from the reservation and retry with the origin airport.",
  inputSchema: z.object({
    flightNumber: z
      .string()
      .min(2)
      .describe(
        "Airline code and flight number, such as the identifier shown on a booking.",
      ),
    departureDate: z
      .string()
      .describe("Local departure date in ISO YYYY-MM-DD format."),
    originAirport: z
      .string()
      .optional()
      .describe("Optional departure airport code to disambiguate the flight."),
    destinationAirport: z
      .string()
      .optional()
      .describe("Optional arrival airport code for route confirmation."),
    includeGate: z
      .boolean()
      .optional()
      .describe("Whether to include available terminal and gate information."),
    includeHistory: z
      .boolean()
      .optional()
      .describe(
        "Whether to include recent status changes from the provider feed.",
      ),
  }),
  async execute() {
    return serviceUnavailable("travel service", "track flight");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("travel")
    ? { "travel-track_flight": registeredTool }
    : null,
);
