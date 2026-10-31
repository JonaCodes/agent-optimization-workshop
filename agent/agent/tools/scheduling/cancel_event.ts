import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Cancel an existing calendar event or a selected occurrence in a recurring series. Use this only when the exact event identifier and cancellation scope are known. The provider may notify attendees and return a cancellation status with the affected event reference. A cancellation reason is optional and appears in the event update when supported. Recurring events require an explicit scope because canceling one occurrence differs from canceling the whole series. This operation removes or marks the event canceled; it does not automatically create a replacement event. If the provider cannot find the identifier, list events again for the original time window and confirm the matching event before retrying.",
  inputSchema: z.object({
    calendarId: z
      .string()
      .min(1)
      .describe("Calendar identifier containing the event."),
    eventId: z.string().min(1).describe("Stable event identifier to cancel."),
    scope: z
      .enum(["this_occurrence", "entire_series"])
      .optional()
      .describe("Cancellation scope for recurring events."),
    reason: z
      .string()
      .max(1000)
      .optional()
      .describe("Optional short reason included in the cancellation update."),
    notifyAttendees: z
      .boolean()
      .optional()
      .describe(
        "Whether the calendar provider should send cancellation notices.",
      ),
  }),
  async execute() {
    return serviceUnavailable("scheduling service", "cancel event");
  },
});
