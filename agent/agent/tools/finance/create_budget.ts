import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Create a spending budget for a category and recurring period in a connected finance workspace. Use this when the requested limit, category, currency, and start period are sufficiently specified. The budget tracks categorized spending against the supplied amount; it does not transfer money or restrict purchases. The provider may return a budget identifier, tracking period, and initial spent amount, which can differ from zero if the period is already underway. Category keys and account scope must match values accepted by the provider. Recurrence controls the period length rather than an automatic renewal payment. If a budget already exists for the same category and period, the provider may reject the duplicate or return the existing definition; inspect that response before trying a different period.",
  inputSchema: z.object({
    name: z
      .string()
      .min(1)
      .describe(
        "Short label for the budget as displayed in the finance workspace.",
      ),
    categoryKey: z
      .string()
      .min(1)
      .describe("Provider category key whose spending this budget will track."),
    amount: z
      .number()
      .positive()
      .describe("Positive budget limit in the specified currency."),
    currency: z
      .string()
      .length(3)
      .describe("ISO 4217 currency code for the limit amount."),
    cadence: z
      .enum(["weekly", "monthly", "quarterly", "yearly"])
      .describe("Recurring period used to reset or report the budget."),
    startsOn: z
      .string()
      .optional()
      .describe("Optional ISO date when the first budget period begins."),
    accountIds: z
      .array(z.string())
      .max(30)
      .optional()
      .describe(
        "Optional connected accounts whose categorized spending should count.",
      ),
    alertAtPercent: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe(
        "Optional utilization threshold at which the provider should alert.",
      ),
  }),
  async execute() {
    return serviceUnavailable("finance service", "create budget");
  },
});
