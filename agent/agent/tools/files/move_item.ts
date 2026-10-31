import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Move an existing file or folder to a different parent location. Use stable IDs obtained from a recent search, detail lookup, or folder listing; destination must be an accessible folder or the provider root. The response should report the item ID, prior and new parent IDs, resulting name, and any provider warnings about inherited access changes. Moving a folder can affect the location of all its descendants, while moving a file may alter its inherited permissions. The operation preserves the item name unless an explicit replacement is supplied. If the provider rejects the move because of permissions or a conflicting destination, inspect the current item and destination before trying again. Do not use this tool to duplicate an item; it changes the existing item's location.",
  inputSchema: z.object({
    itemId: z
      .string()
      .describe("Stable identifier of the existing file or folder to move."),
    destinationFolderId: z
      .string()
      .optional()
      .describe(
        "Target parent folder identifier; omit only when moving to the provider root.",
      ),
    newName: z
      .string()
      .optional()
      .describe("Optional replacement name applied as part of the move."),
    conflictMode: z
      .enum(["reject", "allow_duplicate", "rename"])
      .optional()
      .describe("How to handle a destination sibling with the same name."),
    preserveSharing: z
      .boolean()
      .optional()
      .describe(
        "Whether to request preservation of explicit shares where the provider supports it.",
      ),
    notifyOwner: z
      .boolean()
      .optional()
      .describe(
        "Whether to notify the owner about the location change when supported.",
      ),
  }),
  async execute() {
    return serviceUnavailable("files", "move_item");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("files")
    ? { "files-move_item": registeredTool }
    : null,
);
