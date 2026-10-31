import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Retrieve a task by its stable task ID, usually obtained from tasks-search_tasks or a project view. The response includes title, full description, status, priority, due date, assignee, project, labels, checklist items, links, and timestamps. Optional sections can include comments or activity history when the user needs context about how the task changed. A task ID from another workspace or a deleted item may not be accessible; search by title or project and verify the candidate before making changes. Details are returned in a bounded response, with long descriptions or activity histories subject to service limits. This is a read operation; it does not subscribe the user, change status, or update project recency.",
  inputSchema: z.object({
    taskId: z.string().describe("Stable identifier of the task to retrieve."),
    includeChecklist: z
      .boolean()
      .optional()
      .describe(
        "Whether to include task checklist items and their completion states.",
      ),
    includeComments: z
      .boolean()
      .optional()
      .describe("Whether to include recent comments associated with the task."),
    includeActivity: z
      .boolean()
      .optional()
      .describe("Whether to include a bounded change history for the task."),
    activityLimit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe(
        "Maximum activity entries to return when activity is requested.",
      ),
    includeLinks: z
      .boolean()
      .optional()
      .describe(
        "Whether to include related web links and external references.",
      ),
    timeZone: z
      .string()
      .optional()
      .describe("IANA time zone for rendering due dates and timestamps."),
  }),
  async execute() {
    return serviceUnavailable("tasks", "get_task");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("tasks")
    ? { "tasks-get_task": registeredTool }
    : null,
);
