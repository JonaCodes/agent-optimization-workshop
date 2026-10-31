import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Request a formatted export of an existing analytics report by its report identifier. Use this after a report has been selected and the user needs a file-oriented representation for review or sharing. The export preserves the report’s saved metric definitions and filters, with optional date overrides when the provider permits them. Choose CSV for row-based analysis, JSON for structured processing, or PDF for a fixed-layout snapshot. Large reports may be prepared asynchronously; the response then returns a job reference and status rather than file contents, which can be used to check or retrieve the export later. The tool does not create or alter the source report. If the requested format or date override is unsupported, retry with the report’s saved settings and a supported format.",
  inputSchema: z.object({
    reportId: z
      .string()
      .min(1)
      .describe("Stable identifier of an existing analytics report."),
    format: z
      .enum(["csv", "json", "pdf"])
      .describe("File representation requested for the report export."),
    from: z
      .string()
      .optional()
      .describe(
        "Optional inclusive start date override, if supported by the saved report.",
      ),
    through: z
      .string()
      .optional()
      .describe(
        "Optional inclusive end date override, if supported by the saved report.",
      ),
    timezone: z
      .string()
      .optional()
      .describe(
        "IANA timezone used for date overrides and timestamp formatting.",
      ),
    includeMetadata: z
      .boolean()
      .optional()
      .describe(
        "Whether to include column definitions and report metadata with the export.",
      ),
    delivery: z
      .enum(["inline_when_small", "job_reference"])
      .optional()
      .describe(
        "Preferred response mode; large reports may still require a job reference.",
      ),
  }),
  async execute() {
    return serviceUnavailable("analytics service", "export report");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("analytics")
    ? { "analytics-export_report": registeredTool }
    : null,
);
