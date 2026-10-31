import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Retrieve the full details for one calendar event using its event identifier and, when needed by the provider, its calendar identifier. The response includes title, description, start and end timestamps, time zone, location, organizer, attendee addresses and response states, recurrence information, conferencing details, and current visibility. Optional sections let callers omit lengthy attendee lists or private notes when they are not needed. For a recurring series, use the occurrence identifier returned by search when asking about one date; a series identifier may otherwise return the recurrence definition. If the event is missing or inaccessible, perform a fresh search on the relevant calendar and interval. This read operation does not RSVP, edit event details, or expose attachment contents.",
  inputSchema: z.object({
    eventId: z
      .string()
      .describe(
        "Stable identifier for the event or recurring occurrence to retrieve.",
      ),
    calendarId: z
      .string()
      .optional()
      .describe(
        "Calendar containing the event; include it when event IDs are only calendar-scoped.",
      ),
    timeZone: z
      .string()
      .optional()
      .describe("IANA time zone for local-time fields in the response."),
    includeAttendees: z
      .boolean()
      .optional()
      .describe(
        "Whether to include the complete attendee list and each response state.",
      ),
    includeDescription: z
      .boolean()
      .optional()
      .describe("Whether to return the event description text."),
    includeConference: z
      .boolean()
      .optional()
      .describe(
        "Whether to include the provider meeting link and conference metadata.",
      ),
    includeRecurrence: z
      .boolean()
      .optional()
      .describe(
        "Whether to include recurrence rules and exception references.",
      ),
  }),
  async execute() {
    return serviceUnavailable("calendar", "get_event");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("calendar")
    ? { "calendar-get_event": registeredTool }
    : null,
);
