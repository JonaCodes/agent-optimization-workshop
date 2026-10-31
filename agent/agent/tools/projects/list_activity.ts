import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Read a chronological page of recorded activity for one project. Use a stable project ID and optionally restrict the event types or time interval to answer a focused question. The response includes event identifiers, timestamps, event categories, brief summaries, and actor group labels when available. It does not return personal contact details or full contents of linked resources. Use limit and cursor for bounded pagination; pass nextCursor unchanged to continue, and stop when no cursor is returned. Activity is read-only. Use projects-get for the current project state and the document, spreadsheet, or presentation tools for linked resource content. If an event summary is ambiguous, inspect the relevant resource by its stable ID rather than inferring details from the event label.",
  inputSchema: z.object({
    projectId: z.string().min(1).describe('Stable ID of the project whose activity should be listed.'),
    eventTypes: z.array(z.enum(['created', 'updated', 'status_changed', 'resource_linked', 'commented'])).max(5).optional().describe('Restrict results to these event categories.'),
    after: z.string().optional().describe('ISO 8601 timestamp lower bound; include events at or after this time.'),
    before: z.string().optional().describe('ISO 8601 timestamp upper bound; include events before this time.'),
    limit: z.number().int().min(1).max(100).optional().describe('Maximum events in the current page.'),
    cursor: z.string().optional().describe('Opaque nextCursor from a previous page; omit to start at the newest matching event.'),
    includeResourceIds: z.boolean().optional().describe('Include stable IDs of linked resources when available.'),
  }),
  async execute() {
    return serviceUnavailable("projects", "list_activity");
  },
});
