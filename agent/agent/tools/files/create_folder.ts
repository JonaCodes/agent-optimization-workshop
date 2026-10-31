import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Create a new folder in the selected parent folder or at the provider's default root. The folder name is required; a parent ID is optional, and description, color, and initial labels can be supplied where supported. The response should return the new folder ID, normalized name, parent reference, and creation timestamp. Before creating a folder, inspect the parent when the user refers to an existing location or when name collisions would matter. Providers may permit duplicate names, so a matching name does not guarantee that a prior request succeeded. If a timeout leaves the result uncertain, list the parent folder and check for the newly created item before retrying. This operation creates an empty folder only; it does not move existing files or create a shared link.",
  inputSchema: z.object({
    name: z.string().min(1).describe("Visible folder name to create."),
    parentId: z
      .string()
      .optional()
      .describe(
        "Existing parent folder identifier; omit to create under the provider root.",
      ),
    description: z
      .string()
      .optional()
      .describe("Optional description text for the folder."),
    color: z
      .string()
      .optional()
      .describe("Optional provider-supported color value or color name."),
    labels: z
      .array(z.string())
      .optional()
      .describe("Existing labels to apply to the new folder."),
    conflictMode: z
      .enum(["allow_duplicate", "reject_duplicate"])
      .optional()
      .describe(
        "How the service should handle a same-name sibling if it can detect one.",
      ),
  }),
  async execute() {
    return serviceUnavailable("files", "create_folder");
  },
});
