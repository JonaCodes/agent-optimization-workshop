import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Revise selected fields of an existing knowledge entry while preserving any field not included in the request. Identify the entry by stable ID and supply expectedRevision when available. Omitted title, type, body, tags, source label, or citations remain unchanged; an empty tag or citation array clears that collection where supported. The service returns the resulting revision and accepted fields. If an update is rejected because the entry changed, reread the current version with knowledge-get_entry and apply only the user's intended correction. This operation changes stored knowledge. Use knowledge-add_entry for a distinct new record, and use knowledge-link_entries to adjust relationships without rewriting the body. Keep revisions traceable by using a concise change note based on the user's request.",
  inputSchema: z.object({
    entryId: z.string().min(1).describe('Stable ID of the existing knowledge entry to edit.'),
    expectedRevision: z.string().optional().describe('Revision last read by the caller; concurrent changes may cause rejection.'),
    title: z.string().min(1).max(240).optional().describe('Replacement title; omit to keep the current title.'),
    type: z.enum(['definition', 'process', 'decision', 'reference', 'faq']).optional().describe('Replacement entry type.'),
    body: z.string().min(1).optional().describe('Replacement full body; omit to preserve current content.'),
    tags: z.array(z.string().min(1)).max(20).optional().describe('Replacement tag list; an empty array clears tags.'),
    sourceLabel: z.string().optional().describe('Replacement source label.'),
    citations: z.array(z.object({ label: z.string().min(1).describe('Readable reference label.'), uri: z.string().optional().describe('Optional stable source URI.') })).max(20).optional().describe('Replacement citations; omit to keep existing references.'),
    changeNote: z.string().max(500).optional().describe('Short description of the correction for revision history.'),
  }),
  async execute() {
    return serviceUnavailable("knowledge", "update_entry");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("knowledge")
    ? { "knowledge-update_entry": registeredTool }
    : null,
);
