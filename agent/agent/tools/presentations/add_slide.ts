import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Add one slide at a chosen position in an existing presentation. Supply a title and content blocks as text, optionally select a supported layout, and specify a one-based insertion point; omit the position to append at the end. Speaker notes are optional and should contain only material the user supplied or requested. The result identifies the new slide number and ID, applied layout, and new deck revision. Keep text blocks in intended reading order and avoid packing unrelated topics onto one slide. This operation changes the presentation. If placement depends on nearby content, inspect those slides first with presentations-read_slides. Use presentations-update_slide to revise an existing slide and presentations-reorder_slides to change sequence without altering slide content.",
  inputSchema: z.object({
    presentationId: z.string().min(1).describe('Stable ID of the existing presentation.'),
    title: z.string().min(1).max(240).describe('Slide heading written or approved by the user.'),
    blocks: z.array(z.object({ kind: z.enum(['text', 'bullet_list', 'quote']).describe('Semantic kind of this content block.'), text: z.string().describe('Text in display order; use newline separators for bullet items when kind is bullet_list.') })).min(1).max(20).describe('Ordered body blocks for the new slide.'),
    layout: z.enum(['title_body', 'two_column', 'section_header', 'blank']).optional().describe('Supported visual arrangement; omit to use a suitable default.'),
    insertAt: z.number().int().min(1).optional().describe('One-based position before which to insert; omit to append after the last slide.'),
    speakerNotes: z.string().max(5000).optional().describe('Optional presenter notes explicitly supplied or requested by the user.'),
    themeHint: z.string().optional().describe('Optional existing theme label to preserve or match when supported.'),
  }),
  async execute() {
    return serviceUnavailable("presentations", "add_slide");
  },
});
