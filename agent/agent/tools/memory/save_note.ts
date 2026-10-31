import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Save a durable workspace note containing a reusable project fact, decision, or procedure. Use this when the information is likely to help with later work and can be stated clearly without relying on temporary conversation context. The response identifies the created note and its collection, tags, and revision when the memory provider supports them. A source reference can point back to a project file or record so the note can be checked later. Optional expiration is useful for time-bounded status. Duplicate detection may suggest an existing note instead of creating another copy; inspect that result before saving again. Keep the title specific and the content concise enough to retrieve and verify. This operation stores a note but does not validate its factual accuracy.",
  inputSchema: z.object({
    title: z
      .string()
      .min(1)
      .max(180)
      .describe("Short searchable title that states the note’s topic."),
    content: z
      .string()
      .min(1)
      .max(12000)
      .describe(
        "Concise durable project fact, decision, or reusable procedure.",
      ),
    collectionId: z
      .string()
      .optional()
      .describe(
        "Destination collection identifier; provider default is used when omitted.",
      ),
    tags: z
      .array(z.string())
      .max(16)
      .optional()
      .describe("Search labels that help group or retrieve the note."),
    sourceReference: z
      .string()
      .optional()
      .describe(
        "Optional file path, issue key, or other reference that supports verification.",
      ),
    expiresAt: z
      .string()
      .optional()
      .describe(
        "Optional ISO timestamp after which a time-bounded note is no longer current.",
      ),
    checkForDuplicate: z
      .boolean()
      .optional()
      .describe(
        "Whether the provider should look for similar existing notes before saving.",
      ),
  }),
  async execute() {
    return serviceUnavailable("memory service", "save note");
  },
});
