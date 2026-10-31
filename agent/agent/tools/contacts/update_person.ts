import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Update selected fields on an existing address-book contact while retaining fields that are not supplied. Use a person ID from a recent search or detail lookup so the intended record is clear. Supported fields include names, email and phone collections, organization, job title, and notes. For collection fields, the supplied array replaces the current collection as a whole; retrieve the person first if the requested change is only to add or remove one value. An empty array clears that collection when the provider permits it, while omitted fields remain untouched. The result returns the stable ID and normalized fields that were accepted. If a contact has changed concurrently or access is limited, resolve the reported conflict using a fresh detail read before retrying.",
  inputSchema: z.object({
    personId: z
      .string()
      .describe("Stable identifier for the contact record to modify."),
    givenName: z
      .string()
      .optional()
      .describe(
        "Replacement given name; an empty string clears it when allowed.",
      ),
    familyName: z
      .string()
      .optional()
      .describe(
        "Replacement family name; an empty string clears it when allowed.",
      ),
    displayName: z
      .string()
      .optional()
      .describe("Replacement preferred display name."),
    emails: z
      .array(
        z.object({
          value: z.string().describe("Email address."),
          type: z
            .enum(["work", "home", "other"])
            .optional()
            .describe("Purpose of the address."),
          primary: z
            .boolean()
            .optional()
            .describe("Whether it is the preferred address."),
        }),
      )
      .optional()
      .describe(
        "Complete replacement email collection; omitted preserves existing addresses.",
      ),
    phones: z
      .array(
        z.object({
          value: z.string().describe("Telephone number."),
          type: z
            .enum(["work", "home", "mobile", "other"])
            .optional()
            .describe("Purpose of the number."),
        }),
      )
      .optional()
      .describe(
        "Complete replacement phone collection; omitted preserves existing numbers.",
      ),
    organization: z
      .string()
      .optional()
      .describe("Replacement company or institution name."),
    jobTitle: z
      .string()
      .optional()
      .describe("Replacement professional title or role."),
    notes: z
      .string()
      .optional()
      .describe("Replacement note text; use an empty string to clear notes."),
  }),
  async execute() {
    return serviceUnavailable("contacts", "update_person");
  },
});
