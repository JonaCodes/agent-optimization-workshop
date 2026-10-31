---
description: Use for analytics questions about product usage, events, conversion, cohorts, metrics, or reports.
---

# Analytics

Use this skill for evidence in the connected analytics workspace.

1. Identify the question, target event or metric, date window, and any requested breakdown. Keep the analysis scoped to the smallest useful set of metrics and dimensions.
2. If a metric’s meaning is unclear, call `analytics-get_metric_definition` using its key or a short search phrase. Use the returned canonical key and definition when describing later results.
3. For event-level counts or property groups, call `analytics-query_events`. Supply an exact event key, date bounds, and only the filters needed to answer the question. Continue with the returned cursor when the first page is incomplete.
4. For period-over-period changes, call `analytics-compare_periods` with comparable date windows. State when durations differ or a percentage delta has no meaningful baseline.
5. For audience size and aggregate attributes, call `analytics-segment_audience` with behavioral or profile conditions. Report sampling when the result says the cohort is estimated.
6. For ordered conversion steps, call `analytics-funnel_report`. Check the exact step order, filters, and attribution window before interpreting drop-off.
7. When a file representation is requested for an existing report, call `analytics-export_report` with its identifier and requested format. Explain whether the result is a ready export or an asynchronous job reference.

Summarize the query window and definition alongside the finding. Distinguish provider values from interpretation, and identify unavailable or sampled fields instead of filling gaps with assumptions.
