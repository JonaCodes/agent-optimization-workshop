import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Find projects in the connected workspace using text and optional status, owner-group, label, or date filters. Query terms match project names and indexed descriptions; add filters only when the user specifies a boundary or needs fewer results. Archived projects are omitted by default. Each result page contains stable project IDs, names, current status, labels, and last-updated metadata. Use limit to control page size and pass nextCursor unchanged to continue; omit cursor to restart. Search is read-only and does not create or update projects. Use projects-get to inspect the full record and projects-list_activity for a focused timeline. If the user requests a new project, use projects-create after collecting a meaningful name and any required scope; if they request a state change, use projects-set_status.",
  inputSchema: z.object({
    query: z.string().min(1).describe('Project name or descriptive phrase to match.'),
    statuses: z.array(z.enum(['planned', 'active', 'paused', 'completed', 'archived'])).max(5).optional().describe('Limit matches to one or more lifecycle states.'),
    labels: z.array(z.string().min(1)).max(12).optional().describe('Require all listed project labels.'),
    ownerGroupId: z.string().optional().describe('Known group ID used to limit projects by ownership.'),
    updatedAfter: z.string().optional().describe('ISO 8601 lower bound for last modification time.'),
    includeArchived: z.boolean().optional().describe('Include archived projects when true.'),
    limit: z.number().int().min(1).max(100).optional().describe('Maximum results in this page.'),
    cursor: z.string().optional().describe('Opaque nextCursor from a previous page; omit for the first page.'),
  }),
  async execute() {
    return serviceUnavailable("projects", "search");
  },
});
