import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Update selected metadata or contents of an existing document without replacing fields the caller did not provide. Identify the item by documentId and include the current revision when available to detect stale edits. Supply at least one change among title, body, tags, or folderId; an omitted field is left as-is, while an empty tags array clears labels and an empty body intentionally clears content. The result reports the saved revision and the fields accepted by the service. If the revision check fails, reread the current document with documents-read and reconcile the requested edits before retrying; do not blindly resend a stale body. This is an edit operation. Use documents-create for a new item and documents-share to change access.",
  inputSchema: z.object({
    documentId: z.string().min(1).describe('Stable ID of the existing document to modify.'),
    expectedRevision: z.string().optional().describe('Revision last read by the caller; the service can reject the update if the document changed since then.'),
    title: z.string().min(1).max(240).optional().describe('Replacement title; omit to keep the saved title.'),
    body: z.string().optional().describe('Replacement full body in the selected content format; omit to preserve current text.'),
    format: z.enum(['markdown', 'plain_text', 'html']).optional().describe('Format of a supplied body; ignored when body is omitted.'),
    tags: z.array(z.string().min(1)).max(20).optional().describe('Replacement label set; omit to preserve labels, or pass an empty array to clear them.'),
    folderId: z.string().optional().describe('Move the document to this known folder ID; omit to leave its location unchanged.'),
    changeNote: z.string().max(1000).optional().describe('Short description of the edit to retain in revision history.'),
  }),
  async execute() {
    return serviceUnavailable("documents", "update");
  },
});
