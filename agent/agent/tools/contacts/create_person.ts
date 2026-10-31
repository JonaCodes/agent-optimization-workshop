import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Create a new address-book contact from the supplied name and any known contact details. A contact can be created with only a partial name, while email addresses, phone numbers, organization, job title, group IDs, and notes are optional. Collections accept typed values so a person can have separate work and personal details without flattening them into one string. The response should contain the new stable person ID, normalized display name, accepted fields, and any provider warnings about duplicate candidates. Before creating, search for an existing record when the user indicates the person may already be in the address book. This action writes a contact and may become visible to synced devices; do not add inferred details. If the provider identifies a duplicate, inspect it rather than repeating the create request.",
  inputSchema: z.object({
    givenName: z.string().optional().describe("Person given name, if known."),
    familyName: z.string().optional().describe("Person family name, if known."),
    displayName: z
      .string()
      .optional()
      .describe(
        "Preferred display name when it differs from the composed given and family names.",
      ),
    emails: z
      .array(
        z.object({
          value: z.string().describe("Email address."),
          type: z
            .enum(["work", "home", "other"])
            .optional()
            .describe("Purpose of this email address."),
          primary: z
            .boolean()
            .optional()
            .describe("Whether this is the preferred email address."),
        }),
      )
      .optional()
      .describe(
        "Known email addresses with optional type and primary markers.",
      ),
    phones: z
      .array(
        z.object({
          value: z.string().describe("Telephone number."),
          type: z
            .enum(["work", "home", "mobile", "other"])
            .optional()
            .describe("Purpose of this phone number."),
        }),
      )
      .optional()
      .describe("Known phone numbers."),
    organization: z
      .string()
      .optional()
      .describe("Company, institution, or organization name."),
    jobTitle: z.string().optional().describe("Professional title or role."),
    groupIds: z
      .array(z.string())
      .optional()
      .describe("Existing address-book group IDs for initial membership."),
    notes: z
      .string()
      .optional()
      .describe("User-provided notes to store on the contact."),
  }),
  async execute() {
    return serviceUnavailable("contacts", "create_person");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("contacts")
    ? { "contacts-create_person": registeredTool }
    : null,
);
