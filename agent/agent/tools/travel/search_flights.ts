import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Search available flight itineraries between two places for a specified departure date or date range. Use this when the user is exploring air travel options and has provided enough route and timing detail to search. The result contains itinerary segments, local departure and arrival times, duration, stops, airline, fare conditions when supplied, and a quoted price with currency and retrieval time. A round trip can be requested with a return date, while one-way searches omit it. Nearby airports and flexible dates broaden results; specify these deliberately because they can change the route substantially. Results are ranked by the requested preference and limited to a bounded page. Search data can change quickly and is not a booking confirmation. If no matches appear, widen the date range or allow additional stops.",
  inputSchema: z.object({
    origin: z
      .string()
      .min(2)
      .describe(
        "City, airport code, or place name for the departure location.",
      ),
    destination: z
      .string()
      .min(2)
      .describe("City, airport code, or place name for the arrival location."),
    departureDate: z
      .string()
      .describe("Local departure date in ISO YYYY-MM-DD format."),
    returnDate: z
      .string()
      .optional()
      .describe("Optional local return date for a round-trip search."),
    passengers: z
      .object({
        adults: z
          .number()
          .int()
          .min(1)
          .max(9)
          .describe("Number of adult travelers."),
        children: z
          .number()
          .int()
          .min(0)
          .max(8)
          .optional()
          .describe("Number of child travelers, if any."),
        infants: z
          .number()
          .int()
          .min(0)
          .max(8)
          .optional()
          .describe("Number of infant travelers, if any."),
      })
      .optional()
      .describe("Traveler counts used to price available itineraries."),
    cabin: z
      .enum(["economy", "premium_economy", "business", "first"])
      .optional()
      .describe("Requested cabin class."),
    flexibilityDays: z
      .number()
      .int()
      .min(0)
      .max(7)
      .optional()
      .describe(
        "Days on either side of the requested departure date to include.",
      ),
    maxStops: z
      .number()
      .int()
      .min(0)
      .max(4)
      .optional()
      .describe("Maximum number of connections allowed in each direction."),
    sortBy: z
      .enum(["price", "duration", "departure_time"])
      .optional()
      .describe("Preference for ordering matching itineraries."),
  }),
  async execute() {
    return serviceUnavailable("travel service", "search flights");
  },
});
