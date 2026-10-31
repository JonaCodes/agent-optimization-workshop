import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Find calendar events by words in their title or description, organizer or attendee, calendar, and a time interval. Use this to identify an event before retrieving details or making a change. Results include event and calendar identifiers, title, start and end values with time zones, organizer, response status, and a short location summary. The interval uses an inclusive start and exclusive end; specify a time zone when the user's dates are local or ambiguous. Search can include recurring instances, with each occurrence represented separately when requested. Results are bounded by page size and may include a continuation token; follow it to complete the interval before concluding no event matches. Search is read-only and does not alter attendees or event state.",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe("Words to match in event titles, descriptions, or locations."),
    calendarId: z
      .string()
      .optional()
      .describe(
        "Calendar identifier to search; omit to search available calendars.",
      ),
    from: z
      .string()
      .optional()
      .describe(
        "Inclusive start of the search interval, as an ISO 8601 date or timestamp.",
      ),
    through: z
      .string()
      .optional()
      .describe(
        "Exclusive end of the search interval, as an ISO 8601 date or timestamp.",
      ),
    timeZone: z
      .string()
      .optional()
      .describe(
        "IANA time zone used to interpret date-only bounds and display local times.",
      ),
    attendee: z
      .string()
      .optional()
      .describe(
        "Email address or display name that should appear on matching events.",
      ),
    includeRecurringInstances: z
      .boolean()
      .optional()
      .describe(
        "Whether to expand recurring series into individual occurrences.",
      ),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum event summaries to return on this page."),
    cursor: z
      .string()
      .optional()
      .describe("Opaque continuation token from a prior event search."),
  }),
  async execute() {
    return serviceUnavailable("calendar", "search_events");
  },
});
