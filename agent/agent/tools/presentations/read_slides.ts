import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Read text and structural metadata from selected slides in a presentation. Provide a stable presentation ID and either explicit slide numbers or a contiguous range; keep the selection focused on the content needed to answer the user. The response includes the resolved slide numbers, titles, text blocks in reading order, speaker notes only when requested, and any layout or truncation indicators available from the service. Slide numbers are one-based and refer to the current deck order. For lengthy decks, split reads into smaller ranges rather than relying on clipped output. This operation is read-only. Use presentations-search to discover a deck, presentations-update_slide to change existing content, and presentations-export when the user requests a rendered file.",
  inputSchema: z.object({
    presentationId: z.string().min(1).describe('Stable ID of the deck to inspect.'),
    slideNumbers: z.array(z.number().int().min(1)).max(50).optional().describe('Specific one-based slide numbers to read; use instead of a range for non-adjacent slides.'),
    startSlide: z.number().int().min(1).optional().describe('First one-based slide in a contiguous selection.'),
    endSlide: z.number().int().min(1).optional().describe('Last one-based slide in a contiguous selection; inclusive.'),
    includeNotes: z.boolean().optional().describe('Include speaker notes when true; defaults to false.'),
    includeLayout: z.boolean().optional().describe('Include layout labels and element positions when true.'),
    maxTextChars: z.number().int().min(1).max(30000).optional().describe('Upper bound on text returned across the selected slides.'),
  }),
  async execute() {
    return serviceUnavailable("presentations", "read_slides");
  },
});
