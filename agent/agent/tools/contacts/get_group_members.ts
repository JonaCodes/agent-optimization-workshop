import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "List people who belong to a specific address-book group. The group ID should come from contacts-list_groups or another current group reference. Each page returns contact IDs, display names, primary email addresses when available, and the membership role or source. Optional filters can exclude archived contacts or focus on a membership role. Memberships are paginated because groups can contain many people; use the next cursor to continue and avoid treating the first page as a complete list. This endpoint does not return every contact field or modify group membership. Use contacts-get_person for detailed information about a listed member. If the group cannot be found or the account has no access, verify the group ID and access level before attempting another request.",
  inputSchema: z.object({
    groupId: z
      .string()
      .describe(
        "Stable identifier of the address-book group whose members should be listed.",
      ),
    role: z
      .enum(["member", "manager", "owner"])
      .optional()
      .describe("Optional membership role filter."),
    includeArchived: z
      .boolean()
      .optional()
      .describe(
        "Whether archived contacts should be included in the membership results.",
      ),
    includePrimaryEmail: z
      .boolean()
      .optional()
      .describe(
        "Whether each member summary should include its primary email address.",
      ),
    sort: z
      .enum(["name", "added_recently"])
      .optional()
      .describe("Ordering for group members; name is the default."),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum member summaries to return on this page."),
    cursor: z
      .string()
      .optional()
      .describe(
        "Opaque continuation token returned by a previous membership listing.",
      ),
  }),
  async execute() {
    return serviceUnavailable("contacts", "get_group_members");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("contacts")
    ? { "contacts-get_group_members": registeredTool }
    : null,
);
