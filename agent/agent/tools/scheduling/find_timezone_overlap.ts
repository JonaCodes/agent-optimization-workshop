import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Identify reasonable overlapping meeting windows across several timezones over a date range. Use this when participants are in different regions and no single shared calendar is available, or as a first step before checking actual calendar availability. The response lists candidate windows in each timezone and marks windows that fall outside the requested local-hour range. It accounts for date-specific timezone offsets, including daylight-saving transitions, using IANA timezone identifiers. This calculation does not inspect calendars or reserve a slot; follow it with an availability search for the relevant calendars. If no overlap exists, broaden local hours or date range and clearly show the trade-off rather than silently shifting the meeting to unusual hours.",
  inputSchema: z.object({
    timezones: z
      .array(z.string())
      .min(2)
      .max(12)
      .describe("IANA timezone names for the participants or locations."),
    fromDate: z
      .string()
      .describe(
        "First local calendar date to consider in ISO YYYY-MM-DD format.",
      ),
    throughDate: z
      .string()
      .describe(
        "Last local calendar date to consider in ISO YYYY-MM-DD format.",
      ),
    localStart: z
      .string()
      .optional()
      .describe("Earliest local time considered reasonable in HH:MM format."),
    localEnd: z
      .string()
      .optional()
      .describe("Latest local time considered reasonable in HH:MM format."),
    durationMinutes: z
      .number()
      .int()
      .min(5)
      .max(720)
      .optional()
      .describe("Minimum duration for each candidate overlapping window."),
    weekdayOnly: z
      .boolean()
      .optional()
      .describe(
        "Whether to limit candidate windows to Monday through Friday locally.",
      ),
  }),
  async execute() {
    return serviceUnavailable("scheduling service", "find timezone overlap");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("scheduling")
    ? { "scheduling-find_timezone_overlap": registeredTool }
    : null,
);
