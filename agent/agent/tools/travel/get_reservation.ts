import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Retrieve itinerary and status details for a reservation already visible to the connected travel account. Use this to answer questions about dates, segments, confirmation status, or provider reference. A lookup may use the provider’s reservation identifier or a search window and destination when an identifier is unavailable. The response returns only the matching reservation summary, segment times, booking status, and change or cancellation terms exposed by the provider. It does not modify the reservation or guarantee that the displayed terms remain current. Avoid guessing an identifier; if several reservations match, narrow the date or destination and select the exact result before discussing it. If no booking is found, confirm that the right travel account is connected and that the search window covers the trip.",
  inputSchema: z.object({
    reservationId: z
      .string()
      .optional()
      .describe("Exact booking reference or provider reservation identifier."),
    travelFrom: z
      .string()
      .optional()
      .describe(
        "Start date of the optional date window used to locate a reservation.",
      ),
    travelThrough: z
      .string()
      .optional()
      .describe(
        "End date of the optional date window used to locate a reservation.",
      ),
    destination: z
      .string()
      .optional()
      .describe(
        "Optional arrival city or destination phrase used to narrow a booking search.",
      ),
    mode: z
      .enum(["flight", "rail", "stay", "any"])
      .optional()
      .describe("Reservation type to retrieve."),
    includeTerms: z
      .boolean()
      .optional()
      .describe(
        "Whether to include available change, cancellation, and fare terms.",
      ),
  }),
  async execute() {
    return serviceUnavailable("travel service", "get reservation");
  },
});
