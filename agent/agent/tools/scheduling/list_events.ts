import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "List calendar events within a date range from selected connected calendars. Use this to review an agenda, locate an event, or gather context before rescheduling. Each result includes the event identifier, title, start and end times, timezone, calendar label, and attendance status when supplied by the provider. The time window is interpreted in the requested timezone; omit it only when the provider supports a bounded default view. Optional text and attendee filters narrow the results before pagination. Recurring events may appear as individual occurrences or as a series, depending on provider behavior, so check the returned event identifiers before modifying an item. Results are capped per page and continue with an opaque cursor. If an event is absent, widen the time window or include additional calendars.",
  inputSchema: z.object({
    calendarIds: z
      .array(z.string())
      .min(1)
      .max(20)
      .describe("Connected calendar identifiers to search."),
    from: z
      .string()
      .describe("Inclusive beginning of the event search window."),
    through: z.string().describe("Exclusive end of the event search window."),
    timezone: z
      .string()
      .optional()
      .describe("IANA timezone used to interpret and display the time window."),
    searchText: z
      .string()
      .optional()
      .describe(
        "Optional phrase matched against event titles or descriptions.",
      ),
    attendee: z
      .string()
      .optional()
      .describe("Optional attendee address or name used to filter events."),
    includeDeclined: z
      .boolean()
      .optional()
      .describe("Whether events marked declined should be included."),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(250)
      .optional()
      .describe("Maximum number of event occurrences to return in one page."),
    cursor: z
      .string()
      .optional()
      .describe(
        "Opaque continuation token returned by a previous event listing.",
      ),
  }),
  async execute() {
    return serviceUnavailable("scheduling service", "list events");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("scheduling")
    ? { "scheduling-list_events": registeredTool }
    : null,
);
