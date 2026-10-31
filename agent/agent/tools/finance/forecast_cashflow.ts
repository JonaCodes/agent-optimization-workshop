import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Estimate account cash flow over a future horizon from available balances and scheduled recurring activity. Use this for a planning view of expected inflows, outflows, and projected balance, not as a guarantee of funds or investment advice. The forecast can include selected accounts and known recurring transactions; uncertain items may be marked as estimates with their source. The response provides a dated series in each account currency and summarizes the lowest projected balance. A scenario adjustment can model a one-time inflow or expense without changing the connected records. Longer horizons typically have more uncertainty, which should be stated when presenting results. If the provider lacks recurring-item data, retry with the balance-only option and describe the limited basis of the forecast.",
  inputSchema: z.object({
    accountIds: z
      .array(z.string())
      .max(30)
      .optional()
      .describe("Connected accounts to include in the cash-flow projection."),
    horizonDays: z
      .number()
      .int()
      .min(7)
      .max(365)
      .optional()
      .describe("Number of future days to project."),
    includeRecurring: z
      .boolean()
      .optional()
      .describe(
        "Whether to include provider-recognized recurring income and expenses.",
      ),
    includePending: z
      .boolean()
      .optional()
      .describe(
        "Whether known pending transactions should affect the near-term projection.",
      ),
    scenarioAdjustment: z
      .object({
        amount: z
          .number()
          .describe(
            "One-time modeled amount; positive is an inflow and negative is an outflow.",
          ),
        date: z
          .string()
          .describe(
            "ISO date or timestamp when the modeled adjustment occurs.",
          ),
        label: z
          .string()
          .optional()
          .describe("Short label identifying this hypothetical scenario item."),
      })
      .optional()
      .describe(
        "Optional hypothetical item included only in this forecast calculation.",
      ),
    cadence: z
      .enum(["daily", "weekly", "monthly"])
      .optional()
      .describe("Granularity of points in the returned forecast series."),
  }),
  async execute() {
    return serviceUnavailable("finance service", "forecast cash flow");
  },
});
