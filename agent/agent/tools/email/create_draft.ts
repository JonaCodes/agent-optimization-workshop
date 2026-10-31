import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Create an editable draft message without sending it. Use this when the user asks to prepare or save correspondence for later review, or when a composed reply should remain unsent. Recipients may be supplied as addresses or display-name and address pairs; CC and BCC are optional, and subject and body can be left incomplete for a working draft. A reply can be associated with an existing message or thread so the draft inherits conversation context and provider threading metadata. The result identifies the created draft and reports its normalized recipient list and current save state. The body format indicates whether supplied content is plain text or HTML; plain text is the default and safer for ordinary prose. If the service rejects an address or required content, correct the indicated input and create a new draft only after resolving whether the first request succeeded.",
  inputSchema: z.object({
    to: z
      .array(z.string())
      .optional()
      .describe(
        "Primary recipient addresses or display-name and address strings; an empty list is valid for an incomplete draft.",
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
      .optional()
      .describe(
        "Draft subject line, which may be omitted while the draft is unfinished.",
      ),
    body: z
      .string()
      .optional()
      .describe("Draft message body in the selected representation."),
    bodyFormat: z
      .enum(["text", "html"])
      .optional()
      .describe("Format of body content; defaults to plain text."),
    replyToMessageId: z
      .string()
      .optional()
      .describe(
        "Existing message identifier to associate this draft with as a reply.",
      ),
    threadId: z
      .string()
      .optional()
      .describe(
        "Existing conversation identifier when the draft should be grouped with that thread.",
      ),
  }),
  async execute() {
    return serviceUnavailable("email", "create_draft");
  },
});
