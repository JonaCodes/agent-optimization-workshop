import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Compare a connected account’s provider balance with a supplied statement balance for a specific statement date. Use this to identify an account-level reconciliation difference and list unreconciled activity when the provider supports it. The comparison is performed in the account currency and does not move funds, edit transactions, or mark individual entries as cleared. The result reports both balances, the difference using provider sign conventions, the statement date, and any candidate unmatched transaction identifiers. If a date is outside the provider’s transaction history, the tool may return a partial reconciliation with that limitation. Check that the account and statement date are correct before interpreting a difference; a small unmatched item list can help focus a subsequent transaction search.",
  inputSchema: z.object({
    accountId: z
      .string()
      .min(1)
      .describe("Stable identifier of the connected account to reconcile."),
    statementDate: z
      .string()
      .describe("ISO date associated with the supplied statement balance."),
    statementBalance: z
      .number()
      .describe("Closing balance from the statement in the account currency."),
    currency: z
      .string()
      .length(3)
      .optional()
      .describe(
        "Currency code used to validate the supplied statement balance.",
      ),
    includeUnmatched: z
      .boolean()
      .optional()
      .describe(
        "Whether to return candidate transaction identifiers contributing to the difference.",
      ),
    tolerance: z
      .number()
      .nonnegative()
      .optional()
      .describe(
        "Optional absolute difference threshold considered reconciled.",
      ),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum unmatched activity records to include."),
  }),
  async execute() {
    return serviceUnavailable("finance service", "reconcile account");
  },
});
