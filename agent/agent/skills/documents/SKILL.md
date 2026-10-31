---
description: Use to find, read, create, revise, share, or export workspace documents.
---

## Procedure

1. Resolve an existing item with documents-search. Use a specific query and any known folder, tag, or update window. Follow the returned cursor only when more matches are needed; archived items require an explicit request.
2. Inspect the selected source with documents-read. Prefer a named section and bounded character window for long files. Carry its document ID and revision forward when discussing or editing it.
3. For a new document, use documents-create with a user-approved title, supplied body, and matching content format. Search first if an existing title may be intended. For edits, use documents-update and include the revision read; send only requested changes and preserve omitted fields. If a revision conflict occurs, reread and reconcile before retrying.
4. For a requested access change, use documents-share with a known workspace or project scope and the narrow permission the user specified. Do not infer audience IDs or expiration dates.
5. Use documents-export for a requested output format. Check the returned revision, size, and truncation metadata before describing the export as complete.

Treat IDs and cursors as opaque. Do not invent source text, metadata, recipients, or successful results. Each tool may report service unavailability; explain that plainly and stop the affected operation rather than claiming it succeeded.

Use this skill for document records and text; route spreadsheet cells, slides, project status, and knowledge entries to their matching skills.
