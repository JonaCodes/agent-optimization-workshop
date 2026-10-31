import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Assign or replace the category and optional bookkeeping labels on a single transaction. Use this when the intended category is clear and the transaction identifier has been confirmed from a transaction listing. The operation records the provider’s category key, optional business or personal label, and an optional note; it does not change the transaction amount, merchant, or account. The response should identify the updated transaction and its resulting category, or explain that the provider rejected the change. Category names are provider-specific, so use a valid key rather than inventing a display label. If the transaction is pending or locked, the update may not be accepted; retrieve it again later and retry only if the same identifier remains editable.",
  inputSchema: z.object({
    transactionId: z
      .string()
      .min(1)
      .describe(
        "Stable transaction identifier returned by a connected account listing.",
      ),
    categoryKey: z
      .string()
      .min(1)
      .describe("Valid provider category key to assign to this transaction."),
    labels: z
      .array(z.string())
      .max(12)
      .optional()
      .describe(
        "Optional bookkeeping labels supported by the account provider.",
      ),
    note: z
      .string()
      .max(500)
      .optional()
      .describe(
        "Short annotation explaining the categorization for later review.",
      ),
    applyToSimilar: z
      .boolean()
      .optional()
      .describe(
        "Whether the provider should apply the same rule to future matching transactions.",
      ),
  }),
  async execute() {
    return serviceUnavailable("finance service", "categorize transaction");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("finance")
    ? { "finance-categorize_transaction": registeredTool }
    : null,
);
