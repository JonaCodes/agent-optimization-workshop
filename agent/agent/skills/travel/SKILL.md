---
description: >-
  Use when someone is searching for flights, lodging, or rail options, comparing
  candidate itineraries, retrieving an existing reservation, or checking a
  flight’s operational status. Trigger for trip-planning questions that depend
  on current route availability, dates, fare details, property amenities, or
  booking status in a connected travel service. Keep dates, local times, route,
  traveler counts, currencies, and provider timestamps attached to results so
  options remain comparable. Use this skill for exploration and lookup; searches
  do not themselves reserve transport or a stay.
---

# Travel

1. Establish the origin or destination, travel dates, mode, and any constraints the request already specifies. Do not add preferences that were not provided.
2. For air travel, call `travel-search_flights` with the route and departure date. Include return date, traveler counts, cabin, and stop limit when known. If no results appear, widen the date range or stop allowance and make that change clear.
3. For lodging, call `travel-search_stays` with the destination and complete stay dates. Apply guest count, price, amenity, or radius filters only when relevant. Preserve whether a quoted total includes fees.
4. For train travel, call `travel-search_rail` with the city or station pair and date. Use the local time window and direct-service preference only when the request calls for them.
5. When multiple candidates need a trade-off view, pass their available details to `travel-compare_itineraries`. Keep original price and currency visible, and mark missing criteria as unavailable.
6. To inspect a saved booking, use `travel-get_reservation` with its identifier or a narrow date and destination search. Report the provider’s booking status and terms without implying that a lookup changed the reservation.
7. For a flight-day update, call `travel-track_flight` with the flight number and departure date. Include the feed’s update time when describing a delay, gate, or terminal.

Separate quoted availability from confirmed booking details. When a result omits a fare rule, fee, or status timestamp, say it is not provided rather than inferring it.
