---
description: >-
  Use for calendar lookup and coordination: finding availability, listing events,
  creating or updating a meeting, canceling an event, or locating reasonable
  overlap across timezones. Trigger when a request involves a connected calendar,
  a specific event, a date range, attendee timing, or a recurring event scope.
  Keep timestamps paired with their timezone and use exact event identifiers
  when changing existing entries. For cross-region planning, distinguish
  calculated overlap from actual calendar availability and use the appropriate
  operation for each.
---

# Scheduling

1. Determine whether the request is an agenda lookup, an availability search, a timezone comparison, or a change to a known event. Establish the relevant calendars and date window.
2. To inspect an agenda or locate an event, call `scheduling-list_events` with the calendars and bounded time window. Use returned event identifiers for any later update or cancellation.
3. To find open slots, call `scheduling-find_availability` with the calendars, duration, and requested date range. Preserve the timezone on every suggested time. The result is a candidate slot, not a calendar hold.
4. When participants are in different regions, call `scheduling-find_timezone_overlap` to identify reasonable shared windows. Then check actual calendar availability for the selected window with `scheduling-find_availability`.
5. For a new meeting, call `scheduling-create_event` with the destination calendar, title, start, end, and only the supplied attendee and location details. Include the timezone for local times.
6. For a change, call `scheduling-update_event` with the exact calendar and event identifiers. Provide both start and end when changing time, and set recurring-event scope when the event belongs to a series.
7. For a cancellation, call `scheduling-cancel_event` with the exact event reference and intended recurrence scope. Report the provider result and any attendee notification behavior it returns.

After a calendar change, summarize the resulting event time and timezone. If a conflict or missing identifier prevents the operation, refresh the event list or availability before retrying.
