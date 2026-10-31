---
description: >-
  Use this skill when the user asks to find a workspace project, inspect its record or activity, create a project, revise descriptive fields, or change lifecycle status. Triggers include locating an initiative, checking its current owner group or labels, reviewing recent events, setting a requested project state, or recording a project scope statement. Route discovery to projects-search, record inspection to projects-get, timeline questions to projects-list_activity, new project requests to projects-create, descriptive edits to projects-update, and status transitions to projects-set_status. Use stable project IDs for all operations after discovery. This skill covers project records and lifecycle only; use domain-specific tools to read or edit linked documents, sheets, decks, or knowledge entries.
---

## Procedure

1. Resolve the target with projects-search using the name or a distinctive phrase. Apply status, label, owner-group, or date filters only when the user supplied those constraints. Confirm the stable project ID.
2. Use projects-get for current record fields and projects-list_activity for a bounded event timeline. Pass the cursor unchanged when another page is required. Activity summaries are not a substitute for reading a linked resource.
3. Create a project only on an explicit request. Use projects-create with a user-approved name and only the scope, owner group, dates, labels, and description supplied or confirmed by the user. Search first if an existing project may be intended.
4. For requested descriptive changes, use projects-update with the revision last inspected and only the fields being changed. If stale, retrieve the latest record and reconcile before retrying.
5. For a lifecycle request, use projects-set_status with the requested status and current revision. If rejected, inspect the new state and resolve the mismatch; do not choose another status on the user's behalf.

Treat project IDs and cursors as opaque. Do not infer ownership, dates, or state transitions from a project name. If a tool reports service unavailability, report the operation as incomplete and do not state that the record changed.
