import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Export an existing presentation as a portable rendered or editable file. Select a supported format and optionally choose a slide interval, notes inclusion, or page dimensions when the target format uses them. The response reports the rendered slide count, format, file size, source revision, and a retrieval reference when the service supports file delivery. It may include warnings if fonts, media, or unsupported layout features were omitted. Export does not modify the source deck. Review truncation and warning metadata before describing the export as complete. For text inspection, use presentations-read_slides; for content changes, use presentations-update_slide or presentations-add_slide. Keep a user-requested page interval narrow if only a portion of the presentation is needed.",
  inputSchema: z.object({
    presentationId: z.string().min(1).describe('Stable ID of the presentation to render.'),
    format: z.enum(['pdf', 'pptx', 'images', 'html']).describe('Requested output format.'),
    startSlide: z.number().int().min(1).optional().describe('First one-based slide to export; omit to start with the first slide.'),
    endSlide: z.number().int().min(1).optional().describe('Last one-based slide to export, inclusive; omit for the deck end.'),
    includeNotes: z.boolean().optional().describe('Include speaker notes when the format supports them.'),
    pageSize: z.enum(['standard', 'widescreen', 'letter']).optional().describe('Page dimensions for formats with page layout.'),
    locale: z.string().optional().describe('Locale hint for date, text shaping, and export labels.'),
    maxBytes: z.number().int().min(1024).max(50000000).optional().describe('Requested file size ceiling; response metadata reports service truncation.'),
  }),
  async execute() {
    return serviceUnavailable("presentations", "export");
  },
});
