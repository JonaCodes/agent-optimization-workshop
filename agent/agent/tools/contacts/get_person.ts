import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Retrieve the detailed address-book record for a person using a stable person ID, usually obtained from contacts-search_people. The response can include names, email and phone collections, organization and role, addresses, dates, tags, group memberships, notes, and the provider's field metadata. Select individual field groups to keep the result focused; when omitted, the service returns its normal contact detail set. Some directories restrict notes or private fields, and unavailable groups may be omitted rather than returned as empty values. If the ID is stale, search again using the person's current email or name and inspect the candidate before updating. This operation is read-only; it does not add the person to recent contacts, share the record, or reveal credentials or authentication details.",
  inputSchema: z.object({
    personId: z
      .string()
      .describe("Stable identifier for the contact record to retrieve."),
    fieldGroups: z
      .array(
        z.enum([
          "names",
          "emails",
          "phones",
          "organization",
          "addresses",
          "dates",
          "tags",
          "groups",
          "notes",
        ]),
      )
      .optional()
      .describe(
        "Specific contact field groups to return; omit to use the provider default.",
      ),
    includeGroupNames: z
      .boolean()
      .optional()
      .describe(
        "Whether group memberships should include readable names as well as IDs.",
      ),
    includeMetadata: z
      .boolean()
      .optional()
      .describe("Whether to include field source and last-modified metadata."),
    locale: z
      .string()
      .optional()
      .describe("Locale tag used to format names and dates in the response."),
    includeArchived: z
      .boolean()
      .optional()
      .describe(
        "Whether an archived contact can be returned if the identifier refers to one.",
      ),
  }),
  async execute() {
    return serviceUnavailable("contacts", "get_person");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("contacts")
    ? { "contacts-get_person": registeredTool }
    : null,
);
