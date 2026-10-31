import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Export a document or a requested revision into a supported interchange format. Use the stable document ID, choose a format that matches the user's destination, and optionally restrict the export to a named section. The response describes the generated artifact with its format, byte size, revision, and a short-lived retrieval reference when the service supports file delivery; it may also include page or section counts. The export does not modify the source document. Include comments only when they are part of the requested deliverable, and specify a locale only when formatting or language conventions matter. Large exports may be bounded by the service, so inspect the returned truncation or size metadata before presenting them as complete. Use documents-read for source inspection and documents-update for edits.",
  inputSchema: z.object({
    documentId: z.string().min(1).describe('Stable ID of the document to render.'),
    format: z.enum(['pdf', 'docx', 'html', 'markdown', 'plain_text']).describe('Requested output format; choose one supported by the target application.'),
    revision: z.string().optional().describe('Revision to render; omit to export the current revision.'),
    section: z.string().optional().describe('Optional heading to export as a focused extract rather than the complete document.'),
    includeComments: z.boolean().optional().describe('Include available review comments when true; defaults to false.'),
    locale: z.string().optional().describe('Locale hint for page layout, dates, and language-specific rendering.'),
    maxBytes: z.number().int().min(1024).max(50000000).optional().describe('Requested output ceiling in bytes; the response identifies any service-side truncation.'),
  }),
  async execute() {
    return serviceUnavailable("documents", "export");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("documents")
    ? { "documents-export": registeredTool }
    : null,
);
