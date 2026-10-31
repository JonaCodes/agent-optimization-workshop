import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Retrieve one message by its provider message identifier, typically after locating it with email-search_messages or following a thread reference. The response includes the message's stable ID, conversation ID, sender and recipient headers, sent and received timestamps, subject, labels, and selected body representation. Choose a body format to request plain text, HTML, or a normalized text rendering; large bodies may be truncated according to the maximum character limit and carry a truncation indicator. Attachment metadata can be included without downloading file contents, and headers can be requested for delivery details. If an identifier is stale or belongs to another account, the service should report that the message could not be found; use a fresh search rather than guessing an ID. This is a read operation and leaves mailbox state unchanged.",
  inputSchema: z.object({
    messageId: z
      .string()
      .describe(
        "Stable provider identifier for the specific message to retrieve.",
      ),
    bodyFormat: z
      .enum(["text", "html", "normalized"])
      .optional()
      .describe(
        "Representation for the message body; normalized removes common quoting and markup noise.",
      ),
    maxBodyCharacters: z
      .number()
      .int()
      .min(0)
      .max(50000)
      .optional()
      .describe(
        "Maximum body characters to return before truncation; omit to use the service default.",
      ),
    includeAttachments: z
      .boolean()
      .optional()
      .describe(
        "Whether to include attachment names, media types, sizes, and identifiers without fetching their bytes.",
      ),
    includeHeaders: z
      .boolean()
      .optional()
      .describe(
        "Whether to include the full available transport header set in addition to common address fields.",
      ),
    includeLabels: z
      .boolean()
      .optional()
      .describe("Whether to return the message labels and folder memberships."),
  }),
  async execute() {
    return serviceUnavailable("email", "get_message");
  },
});
