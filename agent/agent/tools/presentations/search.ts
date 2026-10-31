import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Search connected presentations by a phrase, title terms, labels, or update window. Use a short query for title and indexed slide text; apply folder and tag filters only when the user needs a narrower collection. Archived decks are excluded unless explicitly requested. Each page returns stable presentation IDs, titles, locations, modification times, slide counts, and a short matching text excerpt where available. Pass nextCursor unchanged to continue a result page and omit it to start a new search. Search does not reveal full slide contents or modify a deck. Once the user identifies a presentation, call presentations-read_slides with the relevant slide numbers or a small range. Use presentations-export for a finished rendering and presentations-add_slide or presentations-update_slide only when the user requests changes.",
  inputSchema: z.object({
    query: z.string().min(1).describe('Words or a phrase to match in presentation titles and indexed slide text.'),
    folderId: z.string().optional().describe('Known folder ID used to restrict the search.'),
    tags: z.array(z.string().min(1)).max(12).optional().describe('Labels that must be present on matching presentations.'),
    updatedAfter: z.string().optional().describe('ISO 8601 date or timestamp lower bound for last update.'),
    includeArchived: z.boolean().optional().describe('Include archived presentations when true; otherwise omit them.'),
    limit: z.number().int().min(1).max(100).optional().describe('Maximum summaries in this page.'),
    cursor: z.string().optional().describe('Opaque nextCursor returned by a prior page; omit for the first page.'),
    includeExcerpt: z.boolean().optional().describe('Include a short matched slide-text excerpt in each summary when true.'),
  }),
  async execute() {
    return serviceUnavailable("presentations", "search");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("presentations")
    ? { "presentations-search": registeredTool }
    : null,
);
