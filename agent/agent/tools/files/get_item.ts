import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Retrieve metadata and optional content for one file or folder by its stable item ID. The response can include the item's name, MIME type, size, parent folders, owner, editors, modified timestamp, description, labels, and share link. Content retrieval is separately controlled: request a text or metadata-only view for supported document types, or omit content to inspect metadata alone. Binary file bytes are not returned through this tool. A maximum character limit bounds textual content and the response indicates truncation when needed. If the ID no longer resolves or the account lacks access, search by filename or parent folder to locate a current accessible item. This is a read operation; it does not change permissions, move the item, or update its modified timestamp.",
  inputSchema: z.object({
    itemId: z
      .string()
      .describe("Stable identifier for the file or folder to retrieve."),
    contentMode: z
      .enum(["metadata", "text"])
      .optional()
      .describe(
        "Whether to return metadata only or supported textual document content.",
      ),
    maxContentCharacters: z
      .number()
      .int()
      .min(0)
      .max(50000)
      .optional()
      .describe(
        "Maximum characters for returned text content before truncation.",
      ),
    includeParents: z
      .boolean()
      .optional()
      .describe("Whether to include parent folder identifiers and names."),
    includeOwners: z
      .boolean()
      .optional()
      .describe("Whether to include owner names and account addresses."),
    includePermissions: z
      .boolean()
      .optional()
      .describe(
        "Whether to include a summarized view of current item permissions.",
      ),
    includeLabels: z
      .boolean()
      .optional()
      .describe(
        "Whether to include provider labels or classification metadata.",
      ),
  }),
  async execute() {
    return serviceUnavailable("files", "get_item");
  },
});
