import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Read a bounded rectangular range from one spreadsheet tab. Identify the workbook and either its tab name or stable sheet ID, then provide an A1-style range such as A1:D20. Choose a value mode to receive calculated values, formulas, or both; formatted mode includes display strings where available. The response reports the resolved range, row and column dimensions, cell values, and whether service limits clipped the requested area. Keep reads focused because very large ranges may be truncated. When a result is clipped, request a smaller adjacent range rather than assuming missing cells are blank. This operation is read-only. Use spreadsheets-search to find a workbook and spreadsheets-write_range when the user asks to change cell contents.",
  inputSchema: z.object({
    spreadsheetId: z.string().min(1).describe('Stable ID of the workbook to inspect.'),
    sheet: z.string().min(1).describe('Tab name or stable sheet ID within the workbook.'),
    range: z.string().min(1).describe('A1-style cell range such as A1:D20; keep the area as small as the question allows.'),
    valueMode: z.enum(['values', 'formulas', 'values_and_formulas']).optional().describe('Cell representation to return; defaults to calculated values.'),
    includeFormatted: z.boolean().optional().describe('Include user-visible formatted strings alongside raw values when true.'),
    maxCells: z.number().int().min(1).max(50000).optional().describe('Maximum cells to return; the service reports if the requested range exceeds this bound.'),
    includeHeaders: z.boolean().optional().describe('Mark the first row of the selected range as headers when true.'),
  }),
  async execute() {
    return serviceUnavailable("spreadsheets", "read_range");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("spreadsheets")
    ? { "spreadsheets-read_range": registeredTool }
    : null,
);
