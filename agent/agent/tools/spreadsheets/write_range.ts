import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Write a rectangular matrix of cell values to a specified tab and A1-style range. Supply rows in row-major order and use null cells only when the chosen write mode explicitly permits clearing. The service validates that the matrix fits the target range and returns the resolved range, number of written cells, and resulting revision. Use raw values for dates, booleans, and numbers; choose formula input only when the user supplied or requested formulas. An optional expected revision supports conflict detection, and a mismatch should lead to rereading the target cells before deciding what to write. This operation changes workbook content. Keep the range narrow and preserve surrounding values. Use spreadsheets-read_range to inspect current cells first; use spreadsheets-format_range for display styling rather than embedding formatting in cell values.",
  inputSchema: z.object({
    spreadsheetId: z.string().min(1).describe('Stable ID of the workbook to modify.'),
    sheet: z.string().min(1).describe('Tab name or stable sheet ID containing the destination cells.'),
    range: z.string().min(1).describe('Target A1-style range whose dimensions should match the supplied matrix.'),
    values: z.array(z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))).min(1).max(500).describe('Row-major matrix of values; null requests an empty cell only when supported by the selected mode.'),
    inputMode: z.enum(['raw', 'user_entered', 'formulas']).describe('Interpret values literally, as spreadsheet-entered content, or as formulas.'),
    expectedRevision: z.string().optional().describe('Revision last inspected; the service may reject writes after concurrent edits.'),
    insertMode: z.enum(['overwrite', 'append_rows']).optional().describe('Overwrite the target range or append the matrix after the current used rows.'),
    changeNote: z.string().max(500).optional().describe('Short edit note to include with the resulting revision.'),
  }),
  async execute() {
    return serviceUnavailable("spreadsheets", "write_range");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("spreadsheets")
    ? { "spreadsheets-write_range": registeredTool }
    : null,
);
