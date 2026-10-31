import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Update descriptive project fields while preserving every field omitted from the request. Identify the project by stable ID and include expectedRevision when available to avoid overwriting concurrent changes. Supply one or more of name, description, labels, owner group, parent project, or target date. An empty labels array clears labels; omit labels to leave them unchanged. The result reports the accepted changes and current revision. If a stale revision is rejected, retrieve the latest project using projects-get and apply only the requested changes to the current record. This operation does not set lifecycle status; use projects-set_status for that state change. Use projects-search to resolve names to IDs and avoid treating a similarly named project as the intended target.",
  inputSchema: z.object({
    projectId: z.string().min(1).describe('Stable ID of the existing project to edit.'),
    expectedRevision: z.string().optional().describe('Revision last retrieved; the service can reject an update if the project changed.'),
    name: z.string().min(1).max(180).optional().describe('Replacement project name; omit to preserve the current name.'),
    description: z.string().max(5000).optional().describe('Replacement description; omit to preserve current text.'),
    labels: z.array(z.string().min(1)).max(20).optional().describe('Replacement label set; pass an empty array to clear labels.'),
    ownerGroupId: z.string().optional().describe('New known owner group ID; omit to preserve ownership.'),
    parentProjectId: z.string().optional().describe('New known parent project ID; omit to preserve the current parent.'),
    targetDate: z.string().optional().describe('Replacement ISO 8601 target date.'),
    changeNote: z.string().max(500).optional().describe('Short edit note attached to the resulting revision.'),
  }),
  async execute() {
    return serviceUnavailable("projects", "update");
  },
});
