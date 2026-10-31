import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Search task records by words, status, due-date range, assignee, project, or label. Use this to locate an existing task before opening or changing it, or to prepare a focused list for the user. Results contain task IDs, titles, status, due date, priority, project, assignee, and a short description excerpt. Free text may search both titles and descriptions, while structured filters narrow the result set. Sort options support due date, recent update, or priority, and results are paginated to a bounded page size. Continue with the returned cursor to ensure a complete list before reporting there are no matches. Search does not change task status, assignment, due dates, or project membership.",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe("Words or phrases to match in task titles and descriptions."),
    status: z
      .enum(["open", "in_progress", "blocked", "completed", "any"])
      .optional()
      .describe("Task status filter; any includes all statuses."),
    projectId: z
      .string()
      .optional()
      .describe("Project identifier used to limit results to one project."),
    assignee: z
      .string()
      .optional()
      .describe(
        "Person name or account identifier assigned to matching tasks.",
      ),
    dueBefore: z
      .string()
      .optional()
      .describe(
        "Exclusive due-date upper bound in ISO 8601 date or timestamp form.",
      ),
    label: z
      .string()
      .optional()
      .describe("Label name or ID that a matching task must have."),
    sort: z
      .enum(["due_soonest", "recently_updated", "priority"])
      .optional()
      .describe("Ordering for results; due date is the default."),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum task summaries to return on this page."),
    cursor: z
      .string()
      .optional()
      .describe("Opaque continuation token from a previous task search."),
  }),
  async execute() {
    return serviceUnavailable("tasks", "search_tasks");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("tasks")
    ? { "tasks-search_tasks": registeredTool }
    : null,
);
