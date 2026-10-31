import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Grant a person or group access to a file or folder, or create a link with a selected access level when the provider supports it. Identify the item by a current stable ID and specify either named recipients or link access. Named permission roles are viewer, commenter, or editor; link permissions may be broader and should only be selected when requested. Optional expiry and notification settings are passed to the provider where supported. The response should report the created permission ID, target, effective role, link scope, and any rejected recipients. Folder sharing can grant access to descendants through inheritance, so use a folder ID only when that scope is intended. If the item is unavailable or a grant fails, verify the item and current permissions before retrying; do not duplicate grants blindly.",
  inputSchema: z.object({
    itemId: z
      .string()
      .describe(
        "Stable identifier of the file or folder whose access should change.",
      ),
    recipients: z
      .array(z.string())
      .optional()
      .describe(
        "Email addresses or group identifiers to receive named access.",
      ),
    role: z
      .enum(["viewer", "commenter", "editor"])
      .describe(
        "Permission role granted to named recipients or link visitors.",
      ),
    linkScope: z
      .enum(["none", "anyone", "organization"])
      .optional()
      .describe(
        "Audience of a link grant; omit or choose none when only named recipients are intended.",
      ),
    expiration: z
      .string()
      .optional()
      .describe("Optional permission expiration timestamp in ISO 8601 form."),
    notify: z
      .boolean()
      .optional()
      .describe(
        "Whether the provider should notify named recipients about the grant.",
      ),
    message: z
      .string()
      .optional()
      .describe(
        "Short notification text sent with the invitation when supported.",
      ),
    allowReshare: z
      .boolean()
      .optional()
      .describe(
        "Whether recipients may pass access onward when the provider supports this setting.",
      ),
  }),
  async execute() {
    return serviceUnavailable("files", "share_item");
  },
});
