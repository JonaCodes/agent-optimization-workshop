import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Estimate the size and summary attributes of an audience defined by behavioral or profile conditions. Use this to inspect a cohort before comparing it with another population or building a report. Conditions are evaluated against the selected lookback window; event conditions refer to observed activity and profile conditions refer to the latest available user properties. The response provides an approximate user count, the evaluation window, and only the requested aggregate summaries, not individual-level records. Sampling may apply for very large cohorts, and the result identifies when an estimate is sampled. Add a stable cohort name only when the provider supports a saved reusable segment; otherwise omit it. If the audience is unexpectedly empty, broaden the date window or remove a restrictive condition and rerun.",
  inputSchema: z.object({
    conditions: z
      .array(
        z.object({
          category: z
            .enum(["event", "profile"])
            .describe(
              "Whether the condition checks an observed event or a user profile property.",
            ),
          field: z
            .string()
            .min(1)
            .describe("Event name or profile field used by this condition."),
          operator: z
            .enum([
              "equals",
              "not_equals",
              "contains",
              "greater_than",
              "less_than",
              "exists",
            ])
            .describe("Condition comparison; exists ignores the value field."),
          value: z
            .string()
            .optional()
            .describe(
              "Value compared with the selected field when the operator requires one.",
            ),
          occurrence: z
            .enum(["any_time", "at_least_once", "not_once"])
            .optional()
            .describe(
              "Optional event occurrence rule for behavioral conditions.",
            ),
        }),
      )
      .min(1)
      .describe(
        "Conditions combined to define the audience; provider semantics are AND unless stated in a group.",
      ),
    lookbackDays: z
      .number()
      .int()
      .min(1)
      .max(730)
      .optional()
      .describe("Number of recent days used to evaluate behavioral activity."),
    summaries: z
      .array(z.string())
      .max(8)
      .optional()
      .describe(
        "Aggregate properties or activity measures to summarize for this cohort.",
      ),
    savedSegmentName: z
      .string()
      .optional()
      .describe(
        "Optional human-readable name if the connected analytics provider can save segments.",
      ),
    sampling: z
      .enum(["automatic", "exact_if_available"])
      .optional()
      .describe(
        "Sampling preference for large audiences; exact mode may take longer or be unavailable.",
      ),
  }),
  async execute() {
    return serviceUnavailable("analytics service", "segment audience");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("analytics")
    ? { "analytics-segment_audience": registeredTool }
    : null,
);
