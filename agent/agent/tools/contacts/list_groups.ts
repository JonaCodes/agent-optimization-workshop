import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "List address-book groups or labels available to the connected account. Use this to identify a valid group before adding a contact to it or to review the organization of the address book. Results include stable group IDs, display names, descriptions when available, group type, and optionally a member count. A name filter matches group names and can be combined with type or ownership filters. The service returns a bounded page with a continuation token for larger directories; follow the token to see remaining groups. Group summaries do not contain the people in each group; use contacts-get_group_members when membership details are needed. Listing is read-only and does not change contact membership, rename a group, or create a new label.",
  inputSchema: z.object({
    nameContains: z
      .string()
      .optional()
      .describe("Case-insensitive text used to match group display names."),
    type: z
      .enum(["personal", "directory", "shared"])
      .optional()
      .describe("Limit results to a particular group source or scope."),
    ownedOnly: z
      .boolean()
      .optional()
      .describe(
        "Whether to return only groups owned by the connected account.",
      ),
    includeMemberCounts: z
      .boolean()
      .optional()
      .describe(
        "Whether each group summary should include its current member count.",
      ),
    sort: z
      .enum(["name", "recently_used"])
      .optional()
      .describe("Ordering for groups; name is the default."),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum group summaries to return on this page."),
    cursor: z
      .string()
      .optional()
      .describe(
        "Opaque continuation token returned by a previous group listing.",
      ),
  }),
  async execute() {
    return serviceUnavailable("contacts", "list_groups");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("contacts")
    ? { "contacts-list_groups": registeredTool }
    : null,
);
