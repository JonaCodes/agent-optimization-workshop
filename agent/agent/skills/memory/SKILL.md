---
description: >-
  Use for retrieving, organizing, summarizing, saving, revising, or removing
  durable workspace notes. Trigger when prior project decisions, technical facts,
  or reusable procedures may answer the current request, or when the user asks to
  preserve or correct such information. Focus records on project context and
  operational knowledge, and avoid saving private personal details. Search by
  meaning or exact wording, use collection names to narrow the scope, and retain
  source references when they make a note easier to verify later.
---

# Memory

1. For a prior fact or decision, first call `memory-search_notes` with a specific phrase. Narrow by collection or tags when the workspace contains multiple projects. Treat relevance ordering as approximate and compare conflicting note revisions.
2. Call `memory-list_collections` when the destination or scope is unclear. Use the stable collection identifier in later operations, not a guessed display name.
3. For a broad review, call `memory-summarize_collection` with a collection and, when useful, a focus question or update window. Use included note and source references to verify details that affect the current work.
4. Save only durable project facts, decisions, and reusable procedures. Use `memory-save_note` with a specific title, concise content, and a supporting source reference when available. Add tags that improve retrieval, not a long keyword list.
5. If an existing note is outdated, use `memory-update_note` with its exact identifier. When the note provides a revision token, pass it so newer edits are not overwritten. Update its source reference when the supporting record changes.
6. When a note should no longer appear, inspect its exact identifier and call `memory-delete_note` with the intended archive or permanent-removal mode. This affects the note record only, not its referenced project file.

Keep summaries and saved notes traceable to source material. If a search or digest does not include the needed detail, run a narrower search instead of treating an incomplete result as the full record.
