import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Update selected content or presentation metadata on one existing slide. Identify the deck and one-based slide number, then supply only the properties that should change. Omitted title, body blocks, notes, and layout remain untouched; explicit empty notes can clear notes when supported. Include expectedRevision when available so the service can detect concurrent edits. The result reports the slide ID, saved revision, and accepted fields. If the revision is stale, reread that slide and reconcile the user's requested change before retrying. This operation changes a deck; do not replace content merely to improve style unless the user asked for editing. Use presentations-read_slides to inspect, presentations-add_slide to add content, and presentations-reorder_slides to move a slide.",
  inputSchema: z.object({
    presentationId: z.string().min(1).describe('Stable ID of the presentation to edit.'),
    slideNumber: z.number().int().min(1).describe('One-based position of the existing slide in the current order.'),
    expectedRevision: z.string().optional().describe('Revision last read by the caller; stale changes may be rejected.'),
    title: z.string().min(1).max(240).optional().describe('Replacement heading; omit to preserve the current title.'),
    blocks: z.array(z.object({ kind: z.enum(['text', 'bullet_list', 'quote']).describe('Semantic kind for this block.'), text: z.string().describe('Replacement block text in reading order.') })).max(20).optional().describe('Replacement ordered body blocks; omit to keep current body content.'),
    layout: z.enum(['title_body', 'two_column', 'section_header', 'blank']).optional().describe('Replacement supported layout.'),
    speakerNotes: z.string().max(5000).optional().describe('Replacement presenter notes; omit to preserve existing notes.'),
    changeNote: z.string().max(500).optional().describe('Short edit note recorded with the new revision.'),
  }),
  async execute() {
    return serviceUnavailable("presentations", "update_slide");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("presentations")
    ? { "presentations-update_slide": registeredTool }
    : null,
);
