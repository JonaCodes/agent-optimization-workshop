import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Create a task in a project or the account's default task list. A title is required; description, assignee, due date, priority, labels, checklist items, and links are optional. Use existing project and person identifiers when available so the task lands in the intended workspace and is assigned correctly. Due dates accept an ISO 8601 date or timestamp; include an explicit offset when local time matters. The response should return the new task ID, normalized title, status, and any provider warnings about unavailable labels or assignees. Before creating, search for a likely existing task when the user may be referring to one. This action writes a task and may notify assignees; do not invent ownership, dates, or checklist items.",
  inputSchema: z.object({
    title: z
      .string()
      .min(1)
      .describe("Short task title that communicates the requested work."),
    projectId: z
      .string()
      .optional()
      .describe(
        "Existing project or task-list identifier; omit to use the default list.",
      ),
    description: z
      .string()
      .optional()
      .describe("Additional details or acceptance notes supplied by the user."),
    assigneeId: z
      .string()
      .optional()
      .describe("Existing person identifier to assign the task to."),
    dueDate: z
      .string()
      .optional()
      .describe("Due date or timestamp in ISO 8601 form."),
    priority: z
      .enum(["low", "normal", "high", "urgent"])
      .optional()
      .describe("Task priority; normal is the provider default."),
    labels: z
      .array(z.string())
      .optional()
      .describe("Existing label names or IDs to apply."),
    checklist: z
      .array(z.string())
      .optional()
      .describe("Short checklist item titles to create with the task."),
    links: z
      .array(z.string())
      .optional()
      .describe("URLs to associate with the task."),
  }),
  async execute() {
    return serviceUnavailable("tasks", "create_task");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("tasks")
    ? { "tasks-create_task": registeredTool }
    : null,
);
