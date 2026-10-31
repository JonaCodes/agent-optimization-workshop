import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Render a spreadsheet into a portable file format for delivery or inspection. Choose whether the export covers the full workbook or one known tab, and select a format such as PDF, CSV, XLSX, or HTML. PDF exports can include a page orientation and gridline preference; CSV and HTML preserve a single tab selection when provided. The response reports the exported scope, format, file size, and a retrieval reference when supported, along with any truncation or conversion warnings. Exports are read-only and do not alter workbook values or styling. For large workbooks, exporting one tab can avoid size limits. Use spreadsheets-read_range for a small data question, spreadsheets-format_range for presentation changes, and spreadsheets-write_range only when the user asks to alter cells.",
  inputSchema: z.object({
    spreadsheetId: z.string().min(1).describe('Stable ID of the workbook to render.'),
    format: z.enum(['xlsx', 'csv', 'pdf', 'html']).describe('Portable output format requested by the user.'),
    sheet: z.string().optional().describe('Known tab name or ID to export alone; omit for the whole workbook when supported.'),
    orientation: z.enum(['portrait', 'landscape']).optional().describe('Page orientation for PDF output.'),
    includeGridlines: z.boolean().optional().describe('Show gridlines in a PDF or HTML rendering when true.'),
    locale: z.string().optional().describe('Locale hint for displayed dates and numbers in rendered output.'),
    maxBytes: z.number().int().min(1024).max(50000000).optional().describe('Requested size ceiling; response metadata reports if service limits truncate the result.'),
    includeHidden: z.boolean().optional().describe('Include hidden tabs in full-workbook exports when supported.'),
  }),
  async execute() {
    return serviceUnavailable("spreadsheets", "export");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("spreadsheets")
    ? { "spreadsheets-export": registeredTool }
    : null,
);
