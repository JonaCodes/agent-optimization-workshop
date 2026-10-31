import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Record the connected user's response to an event invitation without changing the event's title, time, or other details. Supply the event identifier and choose accepted, tentative, or declined; an optional note can accompany the response when the provider supports it. The result reports the event, recorded response, and whether the organizer was notified. If the event has moved or the invitation reference has expired, search the relevant time range and use the current event identifier. This operation is appropriate when the user asks to RSVP; it should not be used to send a separate message to the organizer. For a recurring series, the scope determines whether the response applies to one occurrence or the entire series. Check the returned response state before attempting a second RSVP.",
  inputSchema: z.object({
    eventId: z
      .string()
      .describe("Identifier of the invitation event to answer."),
    calendarId: z
      .string()
      .optional()
      .describe("Calendar identifier when needed to disambiguate the event."),
    response: z
      .enum(["accepted", "tentative", "declined"])
      .describe("The user's RSVP choice for the invitation."),
    scope: z
      .enum(["occurrence", "series"])
      .optional()
      .describe(
        "Whether to apply the response to this occurrence or its recurring series.",
      ),
    note: z
      .string()
      .optional()
      .describe("Optional short response note to include with the RSVP."),
    notifyOrganizer: z
      .boolean()
      .optional()
      .describe(
        "Whether the service should send the response update to the organizer.",
      ),
    timeZone: z
      .string()
      .optional()
      .describe(
        "IANA time zone used to resolve a recurring occurrence reference.",
      ),
  }),
  async execute() {
    return serviceUnavailable("calendar", "respond_to_invitation");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("calendar")
    ? { "calendar-respond_to_invitation": registeredTool }
    : null,
);
