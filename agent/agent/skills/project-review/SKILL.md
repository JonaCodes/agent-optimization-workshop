---
description: >-
  Use this skill when the user asks to review a workspace project record, status, activity, labels, ownership, or linked project material. Triggers include checking current state, summarizing recent project events, comparing a project record with its documents or workbook, preparing a review from project sources, or applying a clearly requested status or metadata change. Use projects-search and projects-get to establish project identity and current state, projects-list_activity for timeline evidence, and the relevant documents, spreadsheets, presentations, or knowledge tools for linked content. Use projects-update or projects-set_status only when the user explicitly requests a change. This skill provides a bounded workspace review and does not infer project health from names alone.
---

## Procedure

1. Find the project with projects-search and confirm its stable ID. Retrieve the current record with projects-get, including status, labels, ownership, and linked-resource counts when relevant.
2. Read activity with projects-list_activity over the requested period. Follow pagination as needed and distinguish event summaries from the current project record.
3. If the review includes source material, locate known linked items in their domain. Read prose with documents-read, exact cell ranges with spreadsheets-read_range, slides with presentations-read_slides, and knowledge records with knowledge-get_entry. Use their search tools only to resolve an unknown resource ID. Keep revisions and timestamps with observations.
4. Summarize only evidence retrieved from the project record, activity, and selected resources. Mark conflicting or missing source details as unresolved; do not infer completion, risk, or ownership from labels alone.
5. Apply a record edit only on an explicit request. Use projects-update for descriptive fields and projects-set_status for a requested lifecycle transition, including the revision last inspected. If the service detects a stale state, reread before retrying.

Report service unavailability as a gap in the review and avoid claiming the missing source was checked. Do not present an attempted mutation as completed without a success result.

For a comparison across periods, use explicit time bounds and include the relevant activity dates. Tie each conclusion to a project field, event, or retrieved source so the review remains traceable.
