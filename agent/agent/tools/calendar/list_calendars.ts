import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "List calendars the connected account can view, optionally filtering by a name fragment, ownership, or whether each calendar is selected for display. Each result includes its stable ID, display name, description, owner, access role, time zone, and color metadata. Use the returned calendar ID for event searches and writes instead of relying on a display name that may not be unique. The list is paginated for accounts with many shared calendars; pass the returned cursor to continue. A calendar may be visible but not writable, which is reflected in the access role. This operation does not change subscriptions, display preferences, or calendar contents. If an expected calendar is absent, broaden the name filter or inspect the account's available shared resources before treating it as unavailable.",
  inputSchema: z.object({
    nameContains: z
      .string()
      .optional()
      .describe(
        "Optional case-insensitive substring to match against calendar names.",
      ),
    ownedOnly: z
      .boolean()
      .optional()
      .describe(
        "Whether to limit results to calendars owned by the connected account.",
      ),
    selectedOnly: z
      .boolean()
      .optional()
      .describe(
        "Whether to return only calendars currently selected for display.",
      ),
    includeDescription: z
      .boolean()
      .optional()
      .describe("Whether to include descriptive text for each calendar."),
    includeAccessRole: z
      .boolean()
      .optional()
      .describe(
        "Whether to report the account access level for each calendar.",
      ),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum calendars to return on this page."),
    cursor: z
      .string()
      .optional()
      .describe("Opaque continuation token from a previous calendar listing."),
  }),
  async execute() {
    return serviceUnavailable("calendar", "list_calendars");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("calendar")
    ? { "calendar-list_calendars": registeredTool }
    : null,
);
