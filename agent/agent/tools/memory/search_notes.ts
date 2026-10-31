import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Find previously saved workspace notes using a natural-language phrase or exact text. Use this when earlier project decisions, reusable procedures, or recorded technical context may answer a question. Search can be scoped to a collection, filtered by tags or update date, and run as semantic or literal matching when the provider supports both. Results contain note identifiers, titles, concise excerpts, matching metadata, and source references where available; request the full note only when the excerpt is insufficient. Relevance ranking is approximate, so do not treat the first result as authoritative when multiple notes conflict. Results are paginated with an opaque cursor and bounded page size. If the search is too broad, add a distinctive term or collection filter and start a fresh page.",
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .describe("Words or question describing the workspace note to find."),
    collectionId: z
      .string()
      .optional()
      .describe("Optional collection identifier used to restrict the search."),
    tags: z
      .array(z.string())
      .max(12)
      .optional()
      .describe("Optional tags that matching notes must carry."),
    matchMode: z
      .enum(["semantic", "literal"])
      .optional()
      .describe("Whether to search by meaning or exact text when supported."),
    updatedSince: z
      .string()
      .optional()
      .describe("Optional ISO date or timestamp lower bound for note updates."),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum matching notes returned in one page."),
    cursor: z
      .string()
      .optional()
      .describe(
        "Opaque continuation token returned by the preceding search page.",
      ),
    includeExcerpt: z
      .boolean()
      .optional()
      .describe("Whether to return a short matching passage with each result."),
  }),
  async execute() {
    return serviceUnavailable("memory service", "search notes");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("memory")
    ? { "memory-search_notes": registeredTool }
    : null,
);
