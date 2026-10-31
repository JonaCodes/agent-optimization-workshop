import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Produce a concise digest of notes from one selected workspace collection. Use this when several saved decisions or procedures need to be reviewed together before continuing project work. The summary can focus on a topic, limit itself to notes updated in a date window, and include note identifiers or source references for follow-up. It synthesizes stored notes and may surface disagreements or stale timestamps, but does not change the underlying records. A maximum note count bounds the material considered; the response reports that limit so omissions are clear. If the digest lacks an expected decision, run a focused note search or increase the note limit rather than treating the summary as a complete archive. Preserve uncertainty when notes conflict or lack supporting references.",
  inputSchema: z.object({
    collectionId: z
      .string()
      .min(1)
      .describe(
        "Stable collection identifier whose notes should be summarized.",
      ),
    focus: z
      .string()
      .optional()
      .describe(
        "Topic or question to guide which details the digest emphasizes.",
      ),
    updatedSince: z
      .string()
      .optional()
      .describe(
        "Optional ISO date or timestamp lower bound for included note updates.",
      ),
    updatedThrough: z
      .string()
      .optional()
      .describe(
        "Optional ISO date or timestamp upper bound for included note updates.",
      ),
    maximumNotes: z
      .number()
      .int()
      .min(1)
      .max(500)
      .optional()
      .describe("Upper limit on note records considered for the digest."),
    format: z
      .enum(["bullets", "timeline", "decisions"])
      .optional()
      .describe("Preferred structure for the resulting summary."),
    includeReferences: z
      .boolean()
      .optional()
      .describe(
        "Whether to include note identifiers and source references for verification.",
      ),
    excludeTags: z
      .array(z.string())
      .max(16)
      .optional()
      .describe("Tags used to exclude notes from this digest."),
  }),
  async execute() {
    return serviceUnavailable("memory service", "summarize collection");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("memory")
    ? { "memory-summarize_collection": registeredTool }
    : null,
);
