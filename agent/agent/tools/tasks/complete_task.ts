import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Mark a task as completed, optionally recording a completion date or a short completion note. Use this focused operation when the user reports that a specific task is finished; use tasks-update_task for other task edits. The result should identify the task, final status, and completion timestamp. If the task ID is not certain, search first and inspect the candidate before marking it complete. An already completed task should be reported as such rather than treated as a failure. Providers may close open checklist items automatically or leave them unchanged; the response should expose any such behavior. Completion changes the task record and can trigger project notifications, so only call it when the user requests completion or clearly states the task is done.",
  inputSchema: z.object({
    taskId: z
      .string()
      .describe("Stable identifier of the task to mark complete."),
    completedAt: z
      .string()
      .optional()
      .describe(
        "Completion timestamp in ISO 8601 form; omit to use the current service time.",
      ),
    note: z
      .string()
      .optional()
      .describe("Optional concise note describing the reported completion."),
    closeChecklist: z
      .boolean()
      .optional()
      .describe(
        "Whether to mark remaining checklist entries complete if the provider supports it.",
      ),
    notifyAssignee: z
      .boolean()
      .optional()
      .describe("Whether to notify the current assignee about the completion."),
    preserveDueDate: z
      .boolean()
      .optional()
      .describe("Whether to keep the due date on the completed task."),
  }),
  async execute() {
    return serviceUnavailable("tasks", "complete_task");
  },
});
