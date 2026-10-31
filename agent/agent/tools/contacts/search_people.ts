import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Search the address book for people matching names, email addresses, organizations, phone numbers, or tags. Use this when the user needs to find an existing contact or distinguish between similar entries before viewing or editing one. Results are concise person summaries containing stable contact IDs, display names, primary email, organization, and available match context; they do not include every private note or field by default. Text matching may be partial, while structured filters narrow the candidate set. Results are sorted by relevance unless a sort option is selected and are limited to one page. Continue with the returned cursor if the requested match is not present, then use contacts-get_person to inspect a candidate. Searching does not create contacts, update recency fields, or change group membership.",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe(
        "Name, email, phone, organization, or other free-text contact terms.",
      ),
    email: z
      .string()
      .optional()
      .describe(
        "Exact or partial email address used to narrow matching contacts.",
      ),
    organization: z
      .string()
      .optional()
      .describe("Company or organization name associated with the contact."),
    tags: z
      .array(z.string())
      .optional()
      .describe("Tags that a contact must include to match."),
    updatedAfter: z
      .string()
      .optional()
      .describe(
        "Only include contacts updated on or after this ISO 8601 timestamp.",
      ),
    sort: z
      .enum(["relevance", "name", "recently_updated"])
      .optional()
      .describe("Ordering for matching people; relevance is the default."),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum contact summaries to return on this page."),
    cursor: z
      .string()
      .optional()
      .describe("Opaque continuation token from a previous contact search."),
  }),
  async execute() {
    return serviceUnavailable("contacts", "search_people");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("contacts")
    ? { "contacts-search_people": registeredTool }
    : null,
);
