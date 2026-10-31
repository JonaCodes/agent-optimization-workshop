import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Read current and available balances for one or more connected financial accounts. Use this for a point-in-time balance check, not for transaction history or a projected cash position. Account selection can be narrowed by identifier, institution, or account type; omit selectors to return the accounts visible to the connected service. The result reports each account’s display label, currency, current balance, available balance when supplied, and the provider’s as-of timestamp. Balances from different currencies remain separate and should not be added unless an explicit conversion is requested elsewhere. A provider may omit available balance for some account types. If the returned timestamp is stale or an account is missing, repeat with the account identifier and report that the connection may need refreshing.",
  inputSchema: z.object({
    accountIds: z
      .array(z.string())
      .max(30)
      .optional()
      .describe("Specific connected account identifiers to include."),
    institution: z
      .string()
      .optional()
      .describe("Institution name used to narrow the visible account set."),
    accountType: z
      .enum(["checking", "savings", "credit", "investment", "loan", "other"])
      .optional()
      .describe("Optional account category filter."),
    currency: z
      .string()
      .length(3)
      .optional()
      .describe("ISO 4217 currency code used to filter accounts."),
    includeClosed: z
      .boolean()
      .optional()
      .describe("Whether to include accounts marked closed by the provider."),
    asOf: z
      .string()
      .optional()
      .describe(
        "Optional timestamp for historical balance lookup when supported.",
      ),
  }),
  async execute() {
    return serviceUnavailable("finance service", "get account balances");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("finance")
    ? { "finance-get_account_balances": registeredTool }
    : null,
);
