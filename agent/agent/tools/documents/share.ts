import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description: "Change access for an existing document according to a clearly stated sharing request. Identify the document, select a workspace or project audience, provide the corresponding scope ID when required, and choose the least broad permission that satisfies the request. The service returns the document ID, audience scope, effective permission, and any expiration metadata. A read-only audience cannot edit; an editor audience can change document content. Omit expiration for access without a scheduled end, or supply an ISO timestamp if the user specified one. Do not infer recipients or broaden an audience from context; use a known target ID. If the service rejects the scope, verify it with the user or workspace records before retrying. Use documents-read to inspect content, not this operation.",
  inputSchema: z.object({
    documentId: z.string().min(1).describe('Stable ID of the document whose access is being changed.'),
    audience: z.enum(['workspace', 'project']).describe('Sharing boundary; workspace applies to the whole connected workspace and project to one project scope.'),
    targetId: z.string().optional().describe('Known project or workspace scope ID when required by the selected audience.'),
    permission: z.enum(['viewer', 'editor']).describe('Effective access level to grant within the chosen audience.'),
    expiresAt: z.string().optional().describe('Optional ISO 8601 expiration timestamp explicitly requested by the user.'),
    notifyAudience: z.boolean().optional().describe('Whether the service should notify the selected audience about the access change; defaults to false.'),
    note: z.string().max(500).optional().describe('Optional short message attached to the access update.'),
  }),
  async execute() {
    return serviceUnavailable("documents", "share");
  },
});
