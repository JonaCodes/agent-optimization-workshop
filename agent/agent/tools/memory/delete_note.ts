import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Remove a saved workspace note from future search results or mark it as archived when the provider supports recoverable removal. Use this only after locating the exact note identifier and confirming that the record is obsolete or should no longer be retained. The response reports the note reference and whether it was archived or permanently removed. Supplying an expected revision helps avoid removing a note that was changed after it was reviewed. A collection filter can guard against an identifier from a different workspace. This tool does not delete source files referenced by the note. If the provider cannot find the note, search again by title or source reference and confirm the exact match before retrying.",
  inputSchema: z.object({
    noteId: z
      .string()
      .min(1)
      .describe("Stable identifier of the exact note to remove."),
    collectionId: z
      .string()
      .optional()
      .describe(
        "Optional collection identifier used to validate the note location.",
      ),
    removalMode: z
      .enum(["archive", "permanent"])
      .optional()
      .describe(
        "Whether to hide the note recoverably or request permanent removal when supported.",
      ),
    expectedRevision: z
      .string()
      .optional()
      .describe("Revision token for the note version previously inspected."),
    reason: z
      .string()
      .max(500)
      .optional()
      .describe("Optional short explanation recorded with the removal action."),
  }),
  async execute() {
    return serviceUnavailable("memory service", "delete note");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("memory")
    ? { "memory-delete_note": registeredTool }
    : null,
);
