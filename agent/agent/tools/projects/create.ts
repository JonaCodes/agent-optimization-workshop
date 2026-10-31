import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Create a project record in the connected workspace. Supply a clear name and optionally a concise description, initial lifecycle status, owning group, labels, and parent scope. The result includes a stable project ID, normalized project metadata, and timestamps so later tools can inspect or update the record. Omitted status uses the workspace default, and omitted optional fields remain unset. This creates a new project; it does not merge with or replace an existing project of the same name. Search first when the user may mean an existing initiative. Keep the description factual and based on the user's input. Use projects-update to revise fields after creation and projects-set_status to record later lifecycle transitions.",
  inputSchema: z.object({
    name: z.string().min(1).max(180).describe('Project name supplied or approved by the user.'),
    description: z.string().max(5000).optional().describe('Short scope statement grounded in information supplied by the user.'),
    status: z.enum(['planned', 'active', 'paused']).optional().describe('Initial lifecycle state; omit to accept the workspace default.'),
    ownerGroupId: z.string().optional().describe('Known group ID to own the project.'),
    labels: z.array(z.string().min(1)).max(20).optional().describe('Labels that classify this project.'),
    parentProjectId: z.string().optional().describe('Known parent project ID when this work is a child initiative.'),
    startDate: z.string().optional().describe('Optional ISO 8601 date explicitly supplied for the project start.'),
    targetDate: z.string().optional().describe('Optional ISO 8601 target date explicitly supplied by the user.'),
  }),
  async execute() {
    return serviceUnavailable("projects", "create");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("projects")
    ? { "projects-create": registeredTool }
    : null,
);
