---
description: Use to find, inspect, create, update, or RSVP to calendar events and identify calendars.
---

# Calendar operations

Use `calendar-list_calendars` when the destination or source calendar is unclear. Select a calendar by its stable identifier because display names may overlap. Use `calendar-search_events` to locate events by title, participant, calendar, or interval. Set an explicit time zone for date-only bounds or local meeting times, and follow returned cursors until the requested range is covered. Use `calendar-get_event` when the user asks for attendees, conferencing information, recurrence details, or a complete description.

For a new event, gather the requested title, start, end, and attendee details, then call `calendar-create_event`. Preserve the user's stated time zone and distinguish all-day dates from timestamps. Include recurrence or a conference request only when asked. For changes to an existing event, identify the current event with search and retrieve its details if the change depends on existing attendees or recurrence. Then use `calendar-update_event`; select occurrence or series scope deliberately. Supplied attendee lists replace the current list, so calculate a complete replacement list before sending an update.

Use `calendar-respond_to_invitation` only for an RSVP request. Choose accepted, tentative, or declined and use occurrence or series scope as intended. After writes, report the returned event reference and invitation or RSVP status. If an event cannot be found, repeat a focused search using the relevant calendar and date range rather than guessing identifiers. Keep read requests read-only and do not create or modify events during exploratory scheduling discussions.
