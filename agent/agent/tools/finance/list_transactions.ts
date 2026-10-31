import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "List transactions from connected accounts within an optional posting-date range. Use this to review recent activity, locate a merchant charge, or prepare a categorized summary. The response includes transaction identifiers, dates, merchant labels, amounts, currency, account labels, and provider categories when present. Amount sign follows the account’s provider convention, so inspect the transaction type before describing a charge or credit. Search terms match merchant and memo text; account and category filters are applied before pagination. Results are ordered newest first by default and use an opaque cursor for subsequent pages. The maximum page size is bounded to keep responses manageable. If a cursor is rejected, restart without it using a narrower date range or search term.",
  inputSchema: z.object({
    from: z
      .string()
      .optional()
      .describe("Inclusive posting date or timestamp in ISO 8601 format."),
    through: z
      .string()
      .optional()
      .describe("Inclusive posting date or timestamp in ISO 8601 format."),
    accountIds: z
      .array(z.string())
      .max(30)
      .optional()
      .describe(
        "Connected account identifiers to include in the transaction search.",
      ),
    searchText: z
      .string()
      .optional()
      .describe(
        "Case-insensitive phrase matched against merchant and memo text.",
      ),
    category: z
      .string()
      .optional()
      .describe("Provider category label used to narrow the transaction list."),
    minimumAmount: z
      .number()
      .optional()
      .describe(
        "Optional lower amount bound in the transaction’s own currency.",
      ),
    maximumAmount: z
      .number()
      .optional()
      .describe(
        "Optional upper amount bound in the transaction’s own currency.",
      ),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe("Maximum transactions to return in this page."),
    cursor: z
      .string()
      .optional()
      .describe("Opaque continuation token returned by the preceding page."),
  }),
  async execute() {
    return serviceUnavailable("finance service", "list transactions");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("finance")
    ? { "finance-list_transactions": registeredTool }
    : null,
);
