import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Update selected fields on an existing calendar event identified by its event and calendar identifiers. Use this after confirming the intended event, especially when more than one event has a similar title. Only supplied optional fields are changed; omitted fields retain their existing values. Time changes should include both start and end to avoid creating an invalid interval, and attendee changes may cause the calendar provider to resend invitations. The response should show the event identifier, updated fields, and resulting time range. Some providers apply edits to one recurring occurrence or the entire series depending on the scope option. If the event is no longer available or the provider reports a version conflict, retrieve the latest event and reapply only the requested changes.",
  inputSchema: z.object({
    calendarId: z
      .string()
      .min(1)
      .describe("Calendar identifier containing the event."),
    eventId: z
      .string()
      .min(1)
      .describe(
        "Stable event identifier returned by a calendar listing or creation.",
      ),
    title: z
      .string()
      .min(1)
      .optional()
      .describe("Replacement title; omit to keep the existing title."),
    start: z
      .string()
      .optional()
      .describe(
        "Replacement start timestamp; provide together with end for a time change.",
      ),
    end: z
      .string()
      .optional()
      .describe(
        "Replacement end timestamp; provide together with start for a time change.",
      ),
    timezone: z
      .string()
      .optional()
      .describe("IANA timezone for replacement local times when needed."),
    attendees: z
      .array(z.string())
      .max(50)
      .optional()
      .describe(
        "Replacement attendee list; omitted means no attendee changes.",
      ),
    location: z
      .string()
      .optional()
      .describe("Replacement location or meeting connection details."),
    scope: z
      .enum(["this_occurrence", "entire_series"])
      .optional()
      .describe(
        "Whether an edit affects one recurring occurrence or its series.",
      ),
  }),
  async execute() {
    return serviceUnavailable("scheduling service", "update event");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("scheduling")
    ? { "scheduling-update_event": registeredTool }
    : null,
);
