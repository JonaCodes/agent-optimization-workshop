import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Create a calendar event on the selected calendar. A concise title and start and end values are required; use ISO 8601 timestamps with explicit offsets or date-only values for all-day events. The operation supports a location, description, invited attendees, recurrence, and an optional video meeting request. The response should return the new event and calendar identifiers, normalized times, conference details if created, and delivery status for invitations. Attendee addresses are passed as supplied and should not be inferred beyond the user's request. If the service rejects the time range or recurrence syntax, correct those fields before retrying. Event creation immediately changes the calendar and may send invitations, so use this operation only when the user asks to schedule the event; use search or draft planning for exploratory requests.",
  inputSchema: z.object({
    calendarId: z
      .string()
      .optional()
      .describe(
        "Destination calendar identifier; omit to use the default calendar.",
      ),
    title: z
      .string()
      .min(1)
      .describe("Short event title visible to calendar participants."),
    start: z
      .string()
      .describe(
        "Event start as an ISO 8601 timestamp or date for an all-day event.",
      ),
    end: z
      .string()
      .describe(
        "Event end as an ISO 8601 timestamp or exclusive date for an all-day event.",
      ),
    location: z
      .string()
      .optional()
      .describe("Physical address, room, or location text for the event."),
    description: z
      .string()
      .optional()
      .describe("Additional event notes or agenda text."),
    attendees: z
      .array(z.string())
      .optional()
      .describe(
        "Invitee email addresses; the provider sends invitations after creation.",
      ),
    recurrence: z
      .object({
        frequency: z
          .enum(["daily", "weekly", "monthly", "yearly"])
          .describe("Repeat cadence."),
        interval: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Number of cadence units between occurrences."),
        count: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Maximum number of occurrences."),
        until: z
          .string()
          .optional()
          .describe("End date or timestamp for the recurrence."),
      })
      .optional()
      .describe(
        "Optional recurrence rule; provide count or until when the series should stop.",
      ),
    conference: z
      .boolean()
      .optional()
      .describe("Whether to request a provider-hosted video meeting link."),
  }),
  async execute() {
    return serviceUnavailable("calendar", "create_event");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("calendar")
    ? { "calendar-create_event": registeredTool }
    : null,
);
