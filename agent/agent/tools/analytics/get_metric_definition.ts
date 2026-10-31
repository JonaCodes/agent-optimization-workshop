import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Retrieve the saved definition and metadata for a metric in the connected analytics workspace. Use this before interpreting a metric whose counting rule, unit, or ownership is unclear, and before comparing it with another source. The response identifies the canonical metric key, display name, aggregation method, unit, filters, timezone, and any available owner or revision metadata. It describes how the provider defines the metric but does not calculate a current value. Search mode can locate candidates by a partial name; when a metric key is already known, provide it to reduce ambiguity. Results are limited to a single definition or a short matching list. If several candidates are returned, use the exact canonical key for subsequent analytics requests rather than guessing from display labels.",
  inputSchema: z.object({
    metricKey: z
      .string()
      .optional()
      .describe("Exact canonical metric identifier when known."),
    searchText: z
      .string()
      .optional()
      .describe(
        "Partial display name or phrase used to find candidate metric definitions.",
      ),
    includeArchived: z
      .boolean()
      .optional()
      .describe(
        "Whether to include definitions marked archived by the analytics workspace.",
      ),
    includeRevisionHistory: z
      .boolean()
      .optional()
      .describe(
        "Whether to include a concise list of prior definition revisions.",
      ),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe(
        "Maximum matching definitions to return when searching by text.",
      ),
    cursor: z
      .string()
      .optional()
      .describe("Opaque continuation cursor for a previous metric search."),
  }),
  async execute() {
    return serviceUnavailable("analytics service", "get metric definition");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("analytics")
    ? { "analytics-get_metric_definition": registeredTool }
    : null,
);
