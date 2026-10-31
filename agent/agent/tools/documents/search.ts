import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Search the connected document collection for material matching a phrase or a set of filters. Use a concise query for full-text matching and add folder, tag, owner group, or update-window constraints only when they help narrow the request. Archived material is excluded by default; set includeArchived when the user asks for historical or removed documents. The result is a relevance-ordered page of document summaries with stable document IDs, titles, locations, update timestamps, and short excerpts when available. Use limit to control page size and pass the returned nextCursor unchanged to continue; an absent cursor means the first page. Search does not open, change, or share documents. Call documents-read with a chosen ID when the user needs source text or a particular section.",
  inputSchema: z.object({
    query: z.string().min(1).describe('Words or a phrase to match in document titles and body text; use specific terms rather than a complete instruction.'),
    folderId: z.string().optional().describe('Restrict results to this known folder identifier; omit it to search all accessible folders.'),
    tags: z.array(z.string().min(1)).max(12).optional().describe('Require documents carrying these labels; each supplied label is applied as a filter.'),
    updatedAfter: z.string().optional().describe('Include documents updated on or after this ISO 8601 date or timestamp.'),
    includeArchived: z.boolean().optional().describe('Include archived documents when true; the default search scope omits them.'),
    limit: z.number().int().min(1).max(100).optional().describe('Maximum number of summaries to return in this page; defaults to a modest page.'),
    cursor: z.string().optional().describe('Opaque nextCursor from a prior response; omit it to begin at the first result page.'),
    excerptChars: z.number().int().min(0).max(800).optional().describe('Maximum excerpt length per match; use zero to request summaries without body excerpts.'),
  }),
  async execute() {
    return serviceUnavailable("documents", "search");
  },
});
