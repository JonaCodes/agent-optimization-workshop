import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Apply display formatting to a bounded cell range without changing its underlying values or formulas. Specify a workbook, tab, and A1-style range, then include the formatting properties that should change. Omitted properties are preserved; use explicit values to clear or replace existing styling only when the service supports that behavior. Common options include number format, text emphasis, fill color, horizontal alignment, and wrap mode. The response identifies the affected range, accepted properties, and new revision. Keep formatting requests limited to the cells that need a consistent presentation, and do not use this operation to edit content. If the current layout matters, inspect it first with spreadsheets-read_range. Use spreadsheets-write_range for cell values and spreadsheets-export when the user needs a rendered file.",
  inputSchema: z.object({
    spreadsheetId: z.string().min(1).describe('Stable ID of the workbook to format.'),
    sheet: z.string().min(1).describe('Tab name or stable sheet ID containing the target cells.'),
    range: z.string().min(1).describe('A1-style range to format, such as B2:F12.'),
    numberFormat: z.string().optional().describe('Spreadsheet format pattern for numeric, date, or currency display.'),
    textStyle: z.object({ bold: z.boolean().optional().describe('Set bold emphasis when provided.'), italic: z.boolean().optional().describe('Set italic emphasis when provided.'), color: z.string().optional().describe('Text color as a supported hex value.') }).optional().describe('Text properties to apply; omitted subproperties remain unchanged.'),
    fillColor: z.string().optional().describe('Cell background color as a supported hex value.'),
    horizontalAlignment: z.enum(['left', 'center', 'right']).optional().describe('Horizontal placement of cell contents.'),
    wrap: z.enum(['overflow', 'clip', 'wrap']).optional().describe('How long cell contents should fit or display within the selected range.'),
  }),
  async execute() {
    return serviceUnavailable("spreadsheets", "format_range");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("spreadsheets")
    ? { "spreadsheets-format_range": registeredTool }
    : null,
);
