import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Send a composed email to the specified recipients. Use this only when the user has asked for the message to be sent, not when they only want a draft or suggested wording. The operation accepts primary, carbon-copy, and blind-copy recipient lists, a subject, body content, a body representation, and optional reply-thread references. A successful response should contain the provider message ID, conversation ID, accepted recipients, and sent timestamp; partial delivery failures should identify the rejected addresses so they can be addressed explicitly. Keep the submitted content as authored and do not infer additional recipients from context. The page-size concepts used for search do not apply here because sending is a single-message operation. If the outcome is ambiguous after a service error, inspect the relevant conversation before retrying to avoid duplicate delivery.",
  inputSchema: z.object({
    to: z
      .array(z.string())
      .min(1)
      .describe(
        "One or more primary recipient addresses or display-name and address strings.",
      ),
    cc: z
      .array(z.string())
      .optional()
      .describe("Optional carbon-copy recipient addresses."),
    bcc: z
      .array(z.string())
      .optional()
      .describe("Optional blind-copy recipient addresses."),
    subject: z
      .string()
      .describe("Subject line to send, including any intended reply prefix."),
    body: z.string().describe("Message body content to send."),
    bodyFormat: z
      .enum(["text", "html"])
      .optional()
      .describe("Format of body content; defaults to plain text."),
    replyToMessageId: z
      .string()
      .optional()
      .describe(
        "Message identifier to use for reply headers and threading when replying.",
      ),
    threadId: z
      .string()
      .optional()
      .describe(
        "Conversation identifier to keep this outgoing message in an existing thread.",
      ),
    attachments: z
      .array(
        z.object({
          fileId: z
            .string()
            .describe(
              "Identifier of a file already accessible to the mail service.",
            ),
          filename: z
            .string()
            .optional()
            .describe("Display filename override for the attachment."),
        }),
      )
      .optional()
      .describe(
        "Existing file references to attach; raw bytes are not accepted as input.",
      ),
  }),
  async execute() {
    return serviceUnavailable("email", "send_message");
  },
});
