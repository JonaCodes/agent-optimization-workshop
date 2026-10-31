import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "List note collections available in the connected workspace memory store. Use this to discover the right destination before saving a note or to scope a later search. Each result contains a collection identifier, display name, brief description, and note count when the provider exposes those fields. A name query can narrow the list, and archived collections can be included when reviewing older material. Results are ordered by the provider and returned in bounded pages using a continuation cursor. This operation does not create, rename, or reorganize collections. If a collection name is ambiguous, use its stable identifier for subsequent note operations. When no collection matches, search the broader list before assuming that a new collection is needed.",
  inputSchema: z.object({
    searchText: z
      .string()
      .optional()
      .describe(
        "Optional phrase matched against collection names and descriptions.",
      ),
    includeArchived: z
      .boolean()
      .optional()
      .describe("Whether to include archived or inactive collections."),
    includeNoteCounts: z
      .boolean()
      .optional()
      .describe(
        "Whether to request the provider’s approximate note count per collection.",
      ),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum collections returned in one page."),
    cursor: z
      .string()
      .optional()
      .describe("Opaque continuation token for a prior collection listing."),
    sortBy: z
      .enum(["name", "recently_updated", "note_count"])
      .optional()
      .describe("Preferred ordering when the provider supports sorting."),
  }),
  async execute() {
    return serviceUnavailable("memory service", "list collections");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("memory")
    ? { "memory-list_collections": registeredTool }
    : null,
);
