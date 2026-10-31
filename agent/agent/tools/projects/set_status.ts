import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Change the lifecycle status of a project after the user has clearly requested that transition. Identify the project by stable ID, choose a supported status, and include the current revision when available. Optional effective date and transition note can record timing and context supplied by the user. The service returns the prior and new statuses, saved revision, and any transition validation message. If a transition is rejected, retrieve the current project with projects-get and resolve the state mismatch before retrying; do not invent an alternate status. This operation changes lifecycle state. Use projects-update for names, descriptions, labels, or ownership, and projects-search when the project ID is not known.",
  inputSchema: z.object({
    projectId: z.string().min(1).describe('Stable ID of the project to transition.'),
    status: z.enum(['planned', 'active', 'paused', 'completed', 'archived']).describe('Requested lifecycle state.'),
    expectedRevision: z.string().optional().describe('Revision last retrieved; stale transitions may be rejected.'),
    effectiveAt: z.string().optional().describe('Optional ISO 8601 time when the transition should take effect.'),
    transitionNote: z.string().max(1000).optional().describe('Brief context supplied by the user for the status history.'),
    preserveOpenItems: z.boolean().optional().describe('Keep linked open items unchanged when completing or archiving, if supported.'),
    notifyOwnerGroup: z.boolean().optional().describe('Notify the project owner group about the transition when true.'),
  }),
  async execute() {
    return serviceUnavailable("projects", "set_status");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("projects")
    ? { "projects-set_status": registeredTool }
    : null,
);
