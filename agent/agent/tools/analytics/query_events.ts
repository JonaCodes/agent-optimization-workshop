import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Query event records for a named product event across an optional time window. Use this when a question concerns occurrences, properties, or trends at event level rather than a precomputed metric. The time bounds are interpreted in the analytics workspace timezone and are inclusive; omit either bound to use the provider’s available history. Filters are combined with AND, while values inside one filter remain a single exact match. Grouping returns one row per distinct group and may increase result volume. Results are capped by the requested limit, with a continuation cursor when more rows are available. Returned rows include the event name, count, selected dimensions, and the window applied. If a cursor expires, repeat the same query without it and narrow the date range or filters.",
  inputSchema: z.object({
    eventName: z
      .string()
      .min(1)
      .describe("Exact event key as configured in the analytics workspace."),
    from: z
      .string()
      .optional()
      .describe("Inclusive start date or timestamp in ISO 8601 format."),
    through: z
      .string()
      .optional()
      .describe("Inclusive end date or timestamp in ISO 8601 format."),
    filters: z
      .array(
        z.object({
          field: z
            .string()
            .describe("Event property or recognized user attribute to test."),
          operator: z
            .enum([
              "equals",
              "not_equals",
              "contains",
              "greater_than",
              "less_than",
            ])
            .describe("Comparison used for this property value."),
          value: z
            .string()
            .describe(
              "Literal comparison value; numeric comparisons parse this as a number.",
            ),
        }),
      )
      .optional()
      .describe(
        "Optional conditions applied together before counts and groups are computed.",
      ),
    groupBy: z
      .array(z.string())
      .optional()
      .describe(
        "Event properties to group by; keep the list short to control cardinality.",
      ),
    limit: z
      .number()
      .int()
      .min(1)
      .max(500)
      .optional()
      .describe("Maximum rows in this page; defaults to a modest page size."),
    cursor: z
      .string()
      .optional()
      .describe(
        "Opaque continuation token returned by the preceding page for the same query.",
      ),
  }),
  async execute() {
    return serviceUnavailable("analytics service", "query events");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("analytics")
    ? { "analytics-query_events": registeredTool }
    : null,
);
