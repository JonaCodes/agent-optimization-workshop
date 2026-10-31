import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Create a calendar event with a title, time range, and optional attendees or location. Use this when the requested meeting details are settled and the target calendar is known. Start and end should be timezone-aware timestamps or local times accompanied by an IANA timezone; the provider’s response identifies the created event and normalized time range. Attendee invitations may be sent by the calendar provider as part of event creation, so include only intended invitees. Recurrence is expressed as a provider-compatible rule and may be rejected if unsupported. A successful response should contain the event identifier and status; if the provider reports a conflict, check availability and retry with a revised time rather than duplicating the same event.",
  inputSchema: z.object({
    calendarId: z
      .string()
      .min(1)
      .describe("Connected destination calendar identifier."),
    title: z.string().min(1).describe("Short title shown on the calendar."),
    start: z.string().describe("Start date and time as an ISO 8601 timestamp."),
    end: z.string().describe("End date and time as an ISO 8601 timestamp."),
    timezone: z
      .string()
      .optional()
      .describe(
        "IANA timezone for local times when timestamps omit an offset.",
      ),
    attendees: z
      .array(z.string())
      .max(50)
      .optional()
      .describe("Optional attendee addresses to invite."),
    location: z
      .string()
      .optional()
      .describe("Optional meeting location or connection details."),
    description: z
      .string()
      .max(4000)
      .optional()
      .describe("Optional concise agenda or event description."),
    recurrence: z
      .string()
      .optional()
      .describe(
        "Optional recurrence rule in the calendar provider’s supported syntax.",
      ),
  }),
  async execute() {
    return serviceUnavailable("scheduling service", "create event");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("scheduling")
    ? { "scheduling-create_event": registeredTool }
    : null,
);
