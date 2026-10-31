import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Add a knowledge entry from material the user supplied or explicitly asked to preserve. Provide a concise title, a supported entry type, and body text; optionally attach topic tags, a source label, and citations or related entry IDs. The result reports the new stable ID, revision, normalized metadata, and any unresolved related IDs. Omitted source information remains unset rather than being invented. This operation creates a new entry and does not replace an existing one with a similar title; search first if the user may mean an existing record. Keep the body faithful to source material and distinguish quoted facts from interpretation. Use knowledge-update_entry for later corrections and knowledge-link_entries to establish relationships after confirming the target IDs.",
  inputSchema: z.object({
    title: z.string().min(1).max(240).describe('Short knowledge-entry title supplied or approved by the user.'),
    type: z.enum(['definition', 'process', 'decision', 'reference', 'faq']).describe('Kind of knowledge record that best fits the content.'),
    body: z.string().min(1).describe('Entry text based on supplied material; preserve important qualifiers and scope.'),
    tags: z.array(z.string().min(1)).max(20).optional().describe('Topic labels to make the entry discoverable.'),
    sourceLabel: z.string().optional().describe('Known collection or source label; omit when the source is unspecified.'),
    citations: z.array(z.object({ label: z.string().min(1).describe('Readable reference label.'), uri: z.string().optional().describe('Optional stable source URI.') })).max(20).optional().describe('References explicitly provided for this entry.'),
    relatedEntryIds: z.array(z.string().min(1)).max(20).optional().describe('Known entry IDs to associate with this item at creation.'),
    locale: z.string().optional().describe('BCP 47 language hint for indexing and display.'),
  }),
  async execute() {
    return serviceUnavailable("knowledge", "add_entry");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("knowledge")
    ? { "knowledge-add_entry": registeredTool }
    : null,
);
