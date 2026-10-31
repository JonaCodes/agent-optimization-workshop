import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Find spreadsheets by title, text, location, labels, or modification time. A concise query matches names and indexed cell content; add a folder or label only when the user needs a narrower result set. Archived sheets stay out of results unless explicitly included. Each page returns stable spreadsheet IDs, titles, locations, update metadata, and a compact summary such as sheet count or matched text preview. Use the nextCursor exactly as returned to continue and keep limit within the allowed range; omit cursor for the first page. Search never reads an entire grid or changes cell values. Once an ID is selected, use spreadsheets-read_range to inspect specific cells, or spreadsheets-export for a file representation. Prefer narrow cell ranges over exporting a large workbook when only a few values are needed.",
  inputSchema: z.object({
    query: z.string().min(1).describe('Words or a phrase to match in spreadsheet titles and indexed cell content.'),
    folderId: z.string().optional().describe('Restrict lookup to this known folder ID; omit for all accessible folders.'),
    labels: z.array(z.string().min(1)).max(12).optional().describe('Require all supplied labels to match the spreadsheet.'),
    updatedAfter: z.string().optional().describe('ISO 8601 date or timestamp lower bound for last modification.'),
    includeArchived: z.boolean().optional().describe('Include archived spreadsheets when true; otherwise archived items are excluded.'),
    limit: z.number().int().min(1).max(100).optional().describe('Maximum summaries in this page; defaults to a service-sized page.'),
    cursor: z.string().optional().describe('Opaque nextCursor from an earlier page; omit to start at the beginning.'),
    includeCellPreview: z.boolean().optional().describe('Include a short matching-cell preview in summaries when true.'),
  }),
  async execute() {
    return serviceUnavailable("spreadsheets", "search");
  },
});
