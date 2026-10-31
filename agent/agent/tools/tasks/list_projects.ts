import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "List projects or task lists the connected account can access, with optional filters for name, owner, and archived state. Use this to find a destination before creating or moving a task, or to understand which work areas are available. Results include stable project IDs, names, descriptions, owner, status, and optionally task counts and member summaries. Project names are not guaranteed to be unique, so use the ID in subsequent task operations. The list is paginated and returns a continuation cursor for larger workspaces; follow it to review the full set. This operation is read-only and does not create, archive, or reorder projects. If an expected project is missing, broaden the filter or include archived projects before concluding that it is inaccessible.",
  inputSchema: z.object({
    nameContains: z
      .string()
      .optional()
      .describe("Case-insensitive substring to match against project names."),
    ownerId: z
      .string()
      .optional()
      .describe("Person identifier used to filter by project owner."),
    includeArchived: z
      .boolean()
      .optional()
      .describe("Whether archived projects should be included."),
    includeTaskCounts: z
      .boolean()
      .optional()
      .describe(
        "Whether project summaries should include open and total task counts.",
      ),
    includeMembers: z
      .boolean()
      .optional()
      .describe(
        "Whether to include a short list of project member identifiers.",
      ),
    sort: z
      .enum(["name", "recently_updated"])
      .optional()
      .describe("Ordering for projects; name is the default."),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum project summaries to return on this page."),
    cursor: z
      .string()
      .optional()
      .describe(
        "Opaque continuation token returned by a prior project listing.",
      ),
  }),
  async execute() {
    return serviceUnavailable("tasks", "list_projects");
  },
});
