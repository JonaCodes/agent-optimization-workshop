import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Find open time slots across one or more connected calendars within a requested date window. Use this when arranging a meeting and a set of participants or calendars is known. The response returns candidate start and end times with the timezone used, plus an indication of which requested calendars are free. Working hours, meeting duration, and preferred days narrow the search; when omitted, the provider uses its calendar defaults. Slot boundaries respect existing event buffers only when the connected calendar exposes them. Results are suggestions and do not place a hold or create an event. A cursor can continue a long availability search. If no slot is available, broaden the range or remove a preference rather than shortening the requested meeting without direction.",
  inputSchema: z.object({
    calendarIds: z
      .array(z.string())
      .min(1)
      .max(20)
      .describe("Connected calendars whose busy periods should be considered."),
    from: z
      .string()
      .describe("Beginning of the search window as an ISO date or timestamp."),
    through: z
      .string()
      .describe("End of the search window as an ISO date or timestamp."),
    durationMinutes: z
      .number()
      .int()
      .min(5)
      .max(720)
      .describe("Length of each candidate meeting slot."),
    timezone: z
      .string()
      .optional()
      .describe("IANA timezone in which to express candidate times."),
    preferredDays: z
      .array(
        z.enum([
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ]),
      )
      .optional()
      .describe("Optional weekdays to prioritize during the search."),
    workingHours: z
      .object({
        start: z
          .string()
          .describe("Local earliest time to consider in HH:MM format."),
        end: z
          .string()
          .describe("Local latest time to consider in HH:MM format."),
      })
      .optional()
      .describe("Optional daily local-time range for acceptable slots."),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum candidate slots returned in one page."),
    cursor: z
      .string()
      .optional()
      .describe("Opaque continuation token for a prior availability search."),
  }),
  async execute() {
    return serviceUnavailable("scheduling service", "find availability");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("scheduling")
    ? { "scheduling-find_availability": registeredTool }
    : null,
);
