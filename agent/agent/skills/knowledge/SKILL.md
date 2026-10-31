---
description: Use to find, inspect, add, correct, link, archive, or restore reusable knowledge entries.
---

## Procedure

1. Search with knowledge-search using a focused phrase and, when specified, type, tag, source, or freshness filters. Archived entries require an explicit includeArchived request. Confirm entry IDs from results.
2. Inspect the chosen record with knowledge-get_entry. Request a revision, source metadata, links, or history only when the question calls for it. Check the returned revision and any body truncation.
3. Add material only when the user asks to preserve or create an entry. Use knowledge-add_entry with a concise title, fitting entry type, and text grounded in supplied source material. Search first when a similar existing entry may be the intended target.
4. For corrections, use knowledge-update_entry with the revision inspected and only requested fields. Reread and reconcile if a revision conflict occurs. For a relationship, use knowledge-link_entries only when the user explicitly directs the connection and both IDs are known.
5. Use knowledge-archive_entry to archive or restore a confirmed entry. Preserve content and links unless the user asks for another change.

Do not invent citations, source labels, entry content, or relationships. If a tool reports service unavailability, state that the operation did not complete.

Use this skill for knowledge records, not document, spreadsheet, slide, or project edits or outside research.

When revision history matters, compare the requested revision with the current record before summarizing a change. If a relationship is central to the answer, inspect both entries and describe only the saved relationship label.
