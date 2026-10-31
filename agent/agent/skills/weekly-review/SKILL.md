---
description: Use for weekly project reviews synthesizing analytics and saved workspace decisions.
---

# Weekly review

Load `analytics` and `memory` with `eve__skill` before using their tools.

1. Set the review’s start and end dates and the matching prior-week window. Use the same timezone for date boundaries and state it in the review.
2. Identify the small set of metrics that directly reflect the project’s current goals. If a definition is uncertain, call `analytics-get_metric_definition` before comparing values.
3. Call `analytics-compare_periods` for those metrics with the current and baseline windows. Preserve the returned units, sample status, and any unavailable percentage deltas.
4. For a specific behavior behind a change, call `analytics-query_events` with the relevant event key and narrow filters. Use `analytics-funnel_report` only when the question concerns an ordered journey; do not infer a funnel from unrelated events.
5. Find the project’s notes collection with `memory-list_collections` if its identifier is not already known. Call `memory-summarize_collection` with the review window and a focus on decisions, changes, and open work. Use its references to check important details with `memory-search_notes`.
6. Organize the review into measured changes, decisions recorded, and follow-up questions. Attribute each claim to the analytics result or note reference that supports it. Identify gaps instead of filling them with assumptions.
7. If the review establishes a durable project decision, preserve it with `memory-save_note` and include a source reference. Update an existing note with `memory-update_note` when it replaces an earlier decision.

Keep the output concise enough to scan. Separate facts from interpretation and state the comparison period next to every reported trend.

Do not infer personal tasks from calendar or financial records.
