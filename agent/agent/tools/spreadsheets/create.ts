import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Create a new spreadsheet with a title and one or more named tabs. Optionally seed the first tab with a rectangular matrix of user-provided values and select a locale for default date, number, and formula conventions. The result contains the new workbook ID, title, tab IDs and names, revision, and the created dimensions. If seedRows is omitted, tabs begin empty; when provided, each row should have a consistent number of cells. A tab title must be unique within the new workbook, so choose distinct names before calling. This operation creates a new workbook and does not replace a matching title. Use spreadsheets-search first when the user may be referring to an existing sheet, spreadsheets-write_range to populate more cells, and spreadsheets-format_range to style them.",
  inputSchema: z.object({
    title: z.string().min(1).max(240).describe('Workbook title, preserving the user’s requested wording.'),
    tabs: z.array(z.object({ name: z.string().min(1).max(100).describe('Distinct tab name within this workbook.'), color: z.string().optional().describe('Optional hex color hint for the tab label.') })).min(1).max(20).describe('Tabs to create; include at least one and use unique names.'),
    seedRows: z.array(z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))).max(500).optional().describe('Optional initial row-major values for the first tab.'),
    locale: z.string().optional().describe('BCP 47 locale used for default date and number conventions.'),
    timeZone: z.string().optional().describe('IANA timezone hint for date display and timestamp interpretation.'),
    labels: z.array(z.string().min(1)).max(20).optional().describe('Optional labels to apply to the new workbook.'),
    folderId: z.string().optional().describe('Known destination folder ID; omit for the workspace default.'),
  }),
  async execute() {
    return serviceUnavailable("spreadsheets", "create");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("spreadsheets")
    ? { "spreadsheets-create": registeredTool }
    : null,
);
