import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Create or remove an explicit relationship between two known knowledge entries. Provide source and target IDs, a concise relationship label, and the requested action. Use this operation only when the user asks to connect, relate, or unlink records; do not infer a relationship merely because entries appeared in the same search. The response confirms both IDs, the relationship label, and whether a link was created or removed. Self-links and duplicate links may be rejected by the service; if validation fails, inspect the records with knowledge-get_entry and correct the IDs or label before retrying. Link changes do not edit either entry's title or body. Use knowledge-add_entry for new material and knowledge-update_entry to revise stored content.",
  inputSchema: z.object({
    sourceEntryId: z.string().min(1).describe('Stable ID of the entry from which the relationship is expressed.'),
    targetEntryId: z.string().min(1).describe('Stable ID of the related entry.'),
    relationship: z.enum(['supports', 'defines', 'supersedes', 'related_to', 'derived_from']).describe('Meaning of the relationship as stated or approved by the user.'),
    action: z.enum(['create', 'remove']).describe('Whether to add the relationship or remove the matching link.'),
    bidirectional: z.boolean().optional().describe('Create or remove a reciprocal relationship when true, if supported.'),
    expectedSourceRevision: z.string().optional().describe('Source entry revision last inspected, for conflict checks.'),
    expectedTargetRevision: z.string().optional().describe('Target entry revision last inspected, for conflict checks.'),
    note: z.string().max(500).optional().describe('Optional short explanation supplied for the relationship change.'),
  }),
  async execute() {
    return serviceUnavailable("knowledge", "link_entries");
  },
});
