import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Archive or restore a knowledge entry while retaining its stored content and stable ID. Identify the item by entry ID, choose the requested archive state, and include expectedRevision when available. An optional reason records why the user requested the lifecycle change. The response reports the resulting archived state and revision. Archived entries no longer appear in ordinary searches, but can be included explicitly with knowledge-search; restoring makes them available in normal search again. This operation changes discoverability, not the entry body or its links. If the ID is uncertain, search first and inspect candidates with knowledge-get_entry. Use knowledge-update_entry to correct content rather than archiving it, and use knowledge-link_entries for relationship changes.",
  inputSchema: z.object({
    entryId: z.string().min(1).describe('Stable ID of the knowledge entry to archive or restore.'),
    archived: z.boolean().describe('Set true to archive the entry or false to restore it.'),
    expectedRevision: z.string().optional().describe('Revision last retrieved; a stale lifecycle change may be rejected.'),
    reason: z.string().max(1000).optional().describe('Short reason supplied by the user for the archive state change.'),
    preserveLinks: z.boolean().optional().describe('Retain existing relationships when archiving, when supported.'),
    effectiveAt: z.string().optional().describe('Optional ISO 8601 timestamp for the state transition.'),
    notifyOwners: z.boolean().optional().describe('Notify the collection owner group when true, if supported.'),
  }),
  async execute() {
    return serviceUnavailable("knowledge", "archive_entry");
  },
});
