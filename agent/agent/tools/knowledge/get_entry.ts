import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Retrieve the current or requested revision of one knowledge entry by stable ID. The response includes its title, type, body, tags, source label, revision, and linked entry IDs where available. Use includeLinks or includeHistory when the user asks about relationships or previous revisions; otherwise keep the response focused on the current record. If the entry ID is unknown, use knowledge-search rather than constructing one. This operation is read-only. Use knowledge-update_entry to revise a known entry, knowledge-link_entries to add a relationship, and knowledge-search to discover related material. If a selected revision is unavailable, retry with the current entry only when that answers the user's request, and state which version was read.",
  inputSchema: z.object({
    entryId: z.string().min(1).describe('Stable ID of the knowledge entry to retrieve.'),
    revision: z.string().optional().describe('Specific revision ID; omit to read the current revision.'),
    includeLinks: z.boolean().optional().describe('Include linked entry IDs and relationship labels when true.'),
    includeHistory: z.boolean().optional().describe('Include a compact list of prior revision IDs when true.'),
    includeSource: z.boolean().optional().describe('Include the saved source label and citation metadata when available.'),
    maxBodyChars: z.number().int().min(1).max(30000).optional().describe('Maximum body characters to return; metadata indicates if text was clipped.'),
    locale: z.string().optional().describe('Optional locale for localized metadata labels.'),
  }),
  async execute() {
    return serviceUnavailable("knowledge", "get_entry");
  },
});
