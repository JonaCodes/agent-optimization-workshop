import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Create a document in the connected workspace from text supplied by the user. Provide a title and initial body, choose an explicit content format, and optionally place it in a known folder with labels. The service returns the new document ID, saved title, revision, normalized format, and destination metadata so later edits or reads can use the stable ID. Empty or omitted tags do not add labels, and omitted folderId uses the workspace default location. This operation creates a new item and does not replace a similarly named document; check with documents-search first if the user may mean an existing file. Keep source text intact unless the user requested edits, and use documents-update for later changes to the created item.",
  inputSchema: z.object({
    title: z.string().min(1).max(240).describe('Human-readable document title; keep it concise and preserve wording provided by the user.'),
    body: z.string().describe('Initial document contents supplied or approved by the user; an empty string creates a blank body.'),
    format: z.enum(['markdown', 'plain_text', 'html']).describe('Interpretation of body content; choose markdown for headings and lists, plain_text for literal text, or html for supplied markup.'),
    folderId: z.string().optional().describe('Known destination folder ID; omit to use the connected workspace default.'),
    tags: z.array(z.string().min(1)).max(20).optional().describe('Labels to apply at creation; omitted or empty means no labels.'),
    sourceNote: z.string().max(1000).optional().describe('Short provenance note to store with the item, when the user has provided useful context.'),
    locale: z.string().optional().describe('Optional BCP 47 locale hint for language-aware display and indexing.'),
  }),
  async execute() {
    return serviceUnavailable("documents", "create");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("documents")
    ? { "documents-create": registeredTool }
    : null,
);
