import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Search the mailbox for messages using words, sender or recipient addresses, subject text, labels, folders, and date bounds. Use this when the user wants to locate existing correspondence or needs candidate messages before opening one; it returns message summaries with identifiers, thread identifiers, dates, participants, subject lines, labels, and snippets. Query terms use the provider's ordinary search syntax when available, while separate filters remain explicit and combine as constraints. Results are ordered by the requested sort mode and are bounded by page size; use the returned cursor to continue without repeating earlier results. An empty result is a valid search outcome, so refine terms or widen dates before assuming a message is absent. This operation only searches and does not mark messages read, move them, or change labels.",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe(
        "Free-text terms or provider search expression to match against message content and metadata.",
      ),
    from: z
      .string()
      .optional()
      .describe(
        "Sender email address or display name used as an additional filter.",
      ),
    to: z
      .string()
      .optional()
      .describe(
        "Recipient email address or display name used as an additional filter.",
      ),
    subject: z
      .string()
      .optional()
      .describe("Subject text to match; partial text is acceptable."),
    labels: z
      .array(z.string())
      .optional()
      .describe(
        "Labels that a result must have; provide stable label names or IDs.",
      ),
    after: z
      .string()
      .optional()
      .describe(
        "Inclusive lower date bound in ISO 8601 form or a provider-supported date expression.",
      ),
    before: z
      .string()
      .optional()
      .describe(
        "Exclusive upper date bound in ISO 8601 form or a provider-supported date expression.",
      ),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe(
        "Maximum summaries to return on this page; defaults to a conservative provider limit.",
      ),
    cursor: z
      .string()
      .optional()
      .describe("Opaque continuation token from a previous search response."),
  }),
  async execute() {
    return serviceUnavailable("email", "search_messages");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("email")
    ? { "email-search_messages": registeredTool }
    : null,
);
