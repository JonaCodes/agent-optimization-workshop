import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Send a reply associated with an existing email message. The target message determines the default conversation, recipient context, and reply headers; the response reports those resolved recipients so the result can be checked. Use reply-all only when explicitly appropriate, since it can include every original participant. A new body is required, while a subject override is optional and normally unnecessary. The operation can add CC recipients and attach already available files. It returns the outgoing message and thread identifiers, send time, and any recipient-level delivery errors. This operation sends immediately; use email-create_draft when the user wants to review the reply first. If the referenced message cannot be found, search for the conversation and obtain its current message identifier before trying again. Do not reconstruct a reply by using a guessed conversation ID.",
  inputSchema: z.object({
    messageId: z
      .string()
      .describe(
        "Identifier of the message being answered; the service uses it to establish reply context.",
      ),
    body: z.string().describe("New reply text or HTML content to send."),
    bodyFormat: z
      .enum(["text", "html"])
      .optional()
      .describe(
        "Representation of the new reply body; defaults to plain text.",
      ),
    replyAll: z
      .boolean()
      .optional()
      .describe(
        "Whether to include the original sender and other visible recipients; defaults to a direct reply.",
      ),
    cc: z
      .array(z.string())
      .optional()
      .describe("Additional carbon-copy recipients for this reply."),
    subjectOverride: z
      .string()
      .optional()
      .describe(
        "Optional replacement subject when the normal reply subject should be changed.",
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
      .describe("Existing file references to attach to the reply."),
    includeQuotedText: z
      .boolean()
      .optional()
      .describe(
        "Whether the provider should include the original message as quoted content.",
      ),
  }),
  async execute() {
    return serviceUnavailable("email", "reply_to_message");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("email")
    ? { "email-reply_to_message": registeredTool }
    : null,
);
