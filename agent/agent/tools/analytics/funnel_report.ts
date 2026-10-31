import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Calculate progression through an ordered sequence of product events and report drop-off between steps. Use this when the question concerns a journey, onboarding flow, or conversion path with a known order. Each step is an event key and may include a property filter; the analysis follows users within the selected attribution window and reports entrants, step conversions, and step-to-step loss. The first step anchors the cohort, so changing it changes every downstream rate. Optional breakdowns create independent funnels by dimension and can make results sparse. The returned definition echoes the steps, date window, attribution rule, and breakdowns so the result can be checked before drawing conclusions. If a step has no matching events, inspect its exact event key and filters before widening the window.",
  inputSchema: z.object({
    steps: z
      .array(
        z.object({
          eventName: z
            .string()
            .min(1)
            .describe(
              "Exact event key that identifies this ordered funnel step.",
            ),
          label: z
            .string()
            .optional()
            .describe("Readable display label for this step in the report."),
          filters: z
            .array(
              z.object({
                field: z
                  .string()
                  .describe("Event property restricted for this step."),
                value: z
                  .string()
                  .describe(
                    "Exact value required for the step event property.",
                  ),
              }),
            )
            .optional()
            .describe("Optional property matches applied only to this step."),
        }),
      )
      .min(2)
      .max(12)
      .describe("Ordered event steps, from entry through the desired outcome."),
    from: z
      .string()
      .describe("Inclusive start date or timestamp for the funnel cohort."),
    through: z
      .string()
      .describe("Inclusive end date or timestamp for the funnel cohort."),
    conversionWindowHours: z
      .number()
      .int()
      .min(1)
      .max(2160)
      .optional()
      .describe(
        "Maximum elapsed time allowed for a user to complete the next step.",
      ),
    breakdownBy: z
      .array(z.string())
      .max(3)
      .optional()
      .describe(
        "Optional user or event dimensions for side-by-side funnel results.",
      ),
    counting: z
      .enum(["unique_users", "event_instances"])
      .optional()
      .describe(
        "Whether each step counts distinct users or qualifying event occurrences.",
      ),
  }),
  async execute() {
    return serviceUnavailable("analytics service", "build funnel report");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("analytics")
    ? { "analytics-funnel_report": registeredTool }
    : null,
);
