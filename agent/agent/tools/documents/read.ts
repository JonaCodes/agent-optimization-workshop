import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Read text from one document identified by its stable document ID. Choose a revision when the user asks about a historical version; otherwise the service resolves the current revision. A section heading can narrow the response to a known part of the document, while offset and maxChars let you inspect long material in bounded chunks. The result contains the resolved document ID, title, revision metadata, requested section when found, returned text, and a continuation offset when more text remains. Keep the returned offset for the next call and do not assume a missing continuation means the text was empty. This operation is read-only. Use documents-search to discover IDs and documents-export when the user asks for a downloadable rendering or alternate file format.",
  inputSchema: z.object({
    documentId: z.string().min(1).describe('Stable ID of a document already identified by the user or documents-search.'),
    revision: z.string().optional().describe('Specific revision identifier to inspect; omit for the current saved revision.'),
    section: z.string().optional().describe('Heading or section label to locate; omit to read from the beginning of the document.'),
    offset: z.number().int().min(0).optional().describe('Character offset within the selected text for continuing a previous bounded read.'),
    maxChars: z.number().int().min(1).max(20000).optional().describe('Upper bound on returned text characters; use a smaller window for targeted inspection.'),
    includeMetadata: z.boolean().optional().describe('Include revision, location, and modification metadata with the text; defaults to true.'),
    matchCase: z.boolean().optional().describe('Treat the section label as case-sensitive when true; otherwise section lookup may ignore case.'),
  }),
  async execute() {
    return serviceUnavailable("documents", "read");
  },
});
