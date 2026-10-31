import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Retrieve the current record for one project by its stable project ID. The result includes its name, description, lifecycle status, labels, owning group, creation and update timestamps, and linked-resource counts. Request fields can limit the response when the user needs only project basics or only scope metadata. If the ID is unknown, use projects-search to find a matching project rather than guessing. This operation does not change the project. Use projects-list_activity for chronological events, projects-update for descriptive or label changes, and projects-set_status when the requested action concerns the lifecycle state. Treat a missing project response as a lookup failure and confirm the identifier before attempting a mutation.",
  inputSchema: z.object({
    projectId: z.string().min(1).describe('Stable ID of the project to retrieve.'),
    includeDescription: z.boolean().optional().describe('Include the saved project description when true; defaults to true.'),
    includeLabels: z.boolean().optional().describe('Include project labels when true.'),
    includeOwner: z.boolean().optional().describe('Include the owning group identifier and display label when available.'),
    includeCounts: z.boolean().optional().describe('Include counts of linked documents, sheets, and presentations when available.'),
    fields: z.array(z.enum(['status', 'created_at', 'updated_at', 'scope'])).max(4).optional().describe('Additional metadata groups to include in the record.'),
    locale: z.string().optional().describe('Optional locale for localized status labels and timestamps.'),
  }),
  async execute() {
    return serviceUnavailable("projects", "get");
  },
});
