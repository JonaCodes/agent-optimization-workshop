import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "List conversations in a mailbox folder or label, returning one summary per thread rather than one row per message. Use this for an inbox overview, recent conversation scan, or when the user refers to a thread without knowing its subject. Each result includes a stable thread ID, latest-message timestamp, participant names, latest subject and snippet, message count, unread state, and relevant labels. Folder and label filters narrow the collection, while an optional unread filter supports triage. Results are sorted by most recently updated by default and constrained by page size; pass the returned cursor to fetch the next page. A thread summary is not a substitute for inspecting an individual message when exact wording or attachment details matter. This operation does not mark conversations read or alter folder membership.",
  inputSchema: z.object({
    folder: z
      .string()
      .optional()
      .describe(
        "Folder or mailbox section to list, such as inbox, sent, or archive.",
      ),
    label: z
      .string()
      .optional()
      .describe(
        "Label name or stable label identifier used to limit the conversation list.",
      ),
    unreadOnly: z
      .boolean()
      .optional()
      .describe(
        "Whether to return only conversations containing unread messages.",
      ),
    updatedAfter: z
      .string()
      .optional()
      .describe(
        "Inclusive lower bound for the latest message timestamp, in ISO 8601 form.",
      ),
    participant: z
      .string()
      .optional()
      .describe(
        "Address or name that must appear among the thread participants.",
      ),
    sort: z
      .enum(["recent", "oldest", "unread_first"])
      .optional()
      .describe("Ordering for returned threads; recent is the default."),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum thread summaries to return on this page."),
    cursor: z
      .string()
      .optional()
      .describe(
        "Opaque continuation token returned by a previous thread listing.",
      ),
  }),
  async execute() {
    return serviceUnavailable("email", "list_threads");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("email")
    ? { "email-list_threads": registeredTool }
    : null,
);
