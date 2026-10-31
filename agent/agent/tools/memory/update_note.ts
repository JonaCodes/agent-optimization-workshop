import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Revise selected fields on an existing workspace note identified by its stable note identifier. Use this when a saved project fact or procedure has changed and the existing record should remain the canonical reference. Only provided optional fields are replaced; omitted fields remain as they are. The response identifies the revised note and its new revision or update timestamp when available. An expected revision can prevent overwriting a newer edit made after the note was read. A source reference should be updated alongside content when its supporting file or record changes. If the provider reports a revision conflict, retrieve the current note, reconcile the differences, and retry with the latest revision rather than forcing an old version over newer work.",
  inputSchema: z.object({
    noteId: z
      .string()
      .min(1)
      .describe("Stable identifier returned by a prior note search or save."),
    title: z
      .string()
      .min(1)
      .max(180)
      .optional()
      .describe("Replacement searchable title."),
    content: z
      .string()
      .min(1)
      .max(12000)
      .optional()
      .describe("Replacement note content."),
    collectionId: z
      .string()
      .optional()
      .describe("Destination collection identifier for moving the note."),
    tags: z
      .array(z.string())
      .max(16)
      .optional()
      .describe("Replacement set of search labels for the note."),
    sourceReference: z
      .string()
      .optional()
      .describe(
        "Replacement file path, issue key, or supporting record reference.",
      ),
    expiresAt: z
      .string()
      .optional()
      .describe(
        "Replacement expiration timestamp for time-bounded information.",
      ),
    expectedRevision: z
      .string()
      .optional()
      .describe(
        "Revision token of the version previously read, when concurrency checks are supported.",
      ),
  }),
  async execute() {
    return serviceUnavailable("memory service", "update note");
  },
});
