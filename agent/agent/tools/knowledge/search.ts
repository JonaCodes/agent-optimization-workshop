import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Search the connected knowledge collection for entries that match a phrase, topic, source label, or freshness window. Query terms match entry titles and indexed body text; use type or tag filters to narrow results only when the request calls for them. Archived entries are excluded by default. A result page contains stable entry IDs, titles, entry types, source labels, update timestamps, and compact excerpts when available. Use limit and cursor for bounded pagination, passing nextCursor unchanged to continue. Search does not return the full entry body or change stored knowledge. Use knowledge-get_entry to inspect a selected entry, knowledge-add_entry to record new material, and knowledge-link_entries when the user requests an explicit relationship between known entries.",
  inputSchema: z.object({
    query: z.string().min(1).describe('Words or a phrase to match in entry titles and indexed text.'),
    types: z.array(z.enum(['definition', 'process', 'decision', 'reference', 'faq'])).max(5).optional().describe('Limit results to one or more knowledge entry types.'),
    tags: z.array(z.string().min(1)).max(12).optional().describe('Require entries to carry all supplied topic tags.'),
    sourceLabel: z.string().optional().describe('Restrict matches to a known source or collection label.'),
    updatedAfter: z.string().optional().describe('ISO 8601 date or timestamp lower bound for entry updates.'),
    includeArchived: z.boolean().optional().describe('Include archived entries when true; otherwise exclude them.'),
    limit: z.number().int().min(1).max(100).optional().describe('Maximum entries in the current result page.'),
    cursor: z.string().optional().describe('Opaque nextCursor returned by a prior page; omit for the first page.'),
  }),
  async execute() {
    return serviceUnavailable("knowledge", "search");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("knowledge")
    ? { "knowledge-search": registeredTool }
    : null,
);
