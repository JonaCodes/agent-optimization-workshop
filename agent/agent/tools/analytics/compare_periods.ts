import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Compare one or more named analytics metrics across two explicit date windows. Choose this for questions such as whether a conversion rate or active-user count changed between comparable periods. Supply the same timezone-aware date format for both windows; the service aligns the metric definitions and reports absolute and percentage deltas where they are meaningful. A zero or missing baseline may make a percentage unavailable, which is represented as null rather than a fabricated value. Optional segmentation produces separate comparisons for each requested dimension and can multiply the number of returned rows. Keep the metric list small and the segment list narrow for readable results. If the windows differ in length, the response includes their durations so comparisons are not mistaken for like-for-like periods.",
  inputSchema: z.object({
    metrics: z
      .array(z.string().min(1))
      .min(1)
      .max(12)
      .describe("Metric identifiers configured in the analytics workspace."),
    baselineFrom: z
      .string()
      .describe(
        "Inclusive start date or timestamp for the comparison baseline.",
      ),
    baselineThrough: z
      .string()
      .describe("Inclusive end date or timestamp for the comparison baseline."),
    currentFrom: z
      .string()
      .describe("Inclusive start date or timestamp for the newer period."),
    currentThrough: z
      .string()
      .describe("Inclusive end date or timestamp for the newer period."),
    segments: z
      .array(z.string())
      .max(4)
      .optional()
      .describe(
        "Optional dimensions used to break out each metric comparison.",
      ),
    timezone: z
      .string()
      .optional()
      .describe("IANA timezone used to interpret date-only boundaries."),
    includeDailySeries: z
      .boolean()
      .optional()
      .describe(
        "Whether to include aligned daily values in addition to period totals.",
      ),
  }),
  async execute() {
    return serviceUnavailable("analytics service", "compare periods");
  },
});
