---
description: Use to find a meeting time, review or change a meeting, schedule it, or respond to an invitation.
---

# Meeting planning

Load `calendar` with `eve__skill` before using calendar tools. If attendee lookup is needed, load `contacts` before using contact tools.

Resolve people with `contacts-search_people` when the attendee is identified by a name or organization and an address is needed. Use `contacts-get_person` to inspect a candidate when multiple records match. Include only attendees the user named or confirmed. Use `calendar-list_calendars` to identify the correct calendar and its access role.

Check availability by calling `calendar-search_events` across the proposed interval for the relevant calendar or calendars. Interpret date-only requests in the user's stated time zone; if none is available, use the working time zone already established in the conversation and show it in the proposed time. Continue through search cursors when the interval is not covered by one page. Use `calendar-get_event` to inspect a candidate meeting's attendees, recurrence, or conference details before making a change.

When the user chooses a time and asks to schedule, use `calendar-create_event` with the confirmed title, start, end, time zone, attendee list, and any requested location or conference option. For an existing meeting, use `calendar-update_event` after identifying the current event. Select occurrence or series scope according to the request, and preserve the full attendee list if replacing it. For an invitation response, use `calendar-respond_to_invitation` with the chosen RSVP and correct recurrence scope. Summarize the result with the event identifier, local time, and invitation or RSVP status returned by the service.
