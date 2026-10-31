import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Update selected fields on an existing event while preserving fields that are not supplied. Identify the event by its stable ID and use a fresh search if the reference is uncertain. Supported changes include title, start and end, location, description, attendee list, and visibility. Include explicit offsets in timestamps when local time matters. Supplying attendees replaces the existing attendee collection rather than appending to it, so retrieve the event first when additions or removals need to be calculated. The response should show the resulting event summary and whether invitations or updates were sent. Recurrence edits may affect one occurrence or an entire series depending on the scope value. This operation changes shared calendar data; invoke it only for a requested modification and check the returned result before making a second update.",
  inputSchema: z.object({
    eventId: z.string().describe("Stable identifier of the event to modify."),
    scope: z
      .enum(["occurrence", "series"])
      .optional()
      .describe(
        "Whether to edit one recurring occurrence or the entire series.",
      ),
    title: z
      .string()
      .optional()
      .describe("Replacement event title; omitted values remain unchanged."),
    start: z
      .string()
      .optional()
      .describe(
        "Replacement start timestamp or all-day date in ISO 8601 form.",
      ),
    end: z
      .string()
      .optional()
      .describe(
        "Replacement end timestamp or exclusive all-day date in ISO 8601 form.",
      ),
    location: z
      .string()
      .optional()
      .describe("Replacement room, address, or location text."),
    description: z
      .string()
      .optional()
      .describe(
        "Replacement event description; use an empty string to clear it.",
      ),
    attendees: z
      .array(z.string())
      .optional()
      .describe(
        "Complete replacement attendee list; omitted means keep the current list.",
      ),
    visibility: z
      .enum(["default", "public", "private"])
      .optional()
      .describe("Replacement visibility setting for the event."),
  }),
  async execute() {
    return serviceUnavailable("calendar", "update_event");
  },
});
