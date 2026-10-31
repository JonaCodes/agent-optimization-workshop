import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Update selected fields of an existing task while leaving omitted fields unchanged. Identify the task by a current stable ID, typically from tasks-search_tasks or tasks-get_task. Supported values include title, description, status, priority, due date, assignee, labels, and checklist. Collection fields such as labels and checklist replace the stored collection when supplied, so inspect the current task first when only a single member should be added or removed. Use an empty string to clear text fields and an empty array to clear a supported collection. The response should return the updated summary and any notification status. If an update conflicts with a concurrent edit or an invalid field value, fetch current details and resolve the conflict before submitting another update.",
  inputSchema: z.object({
    taskId: z.string().describe("Stable identifier of the task to update."),
    title: z.string().optional().describe("Replacement task title."),
    description: z
      .string()
      .optional()
      .describe(
        "Replacement description; an empty string clears it when permitted.",
      ),
    status: z
      .enum(["open", "in_progress", "blocked", "completed"])
      .optional()
      .describe("Replacement task status."),
    priority: z
      .enum(["low", "normal", "high", "urgent"])
      .optional()
      .describe("Replacement priority level."),
    dueDate: z
      .string()
      .optional()
      .describe("Replacement due date or timestamp in ISO 8601 form."),
    assigneeId: z
      .string()
      .optional()
      .describe(
        "Replacement assignee identifier; use an empty string to unassign when supported.",
      ),
    labels: z
      .array(z.string())
      .optional()
      .describe("Complete replacement label collection."),
    checklist: z
      .array(z.string())
      .optional()
      .describe("Complete replacement checklist item titles."),
  }),
  async execute() {
    return serviceUnavailable("tasks", "update_task");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("tasks")
    ? { "tasks-update_task": registeredTool }
    : null,
);
