---
description: Use to find a deck, inspect or edit slides, reorder slides, or export a presentation.
---

## Procedure

1. Find the intended deck with presentations-search. Use title terms or indexed text and any known folder or labels. Confirm the stable ID from a result; do not guess from a title.
2. Read the relevant slides with presentations-read_slides. Use explicit one-based slide numbers or a compact interval, and request notes or layout metadata only when needed. Check whether the response clipped text.
3. For a new slide in a known deck, use presentations-add_slide with a user-approved title, ordered text blocks, and requested placement. Inspect nearby slides first when they determine context or sequence.
4. For a requested edit, use presentations-update_slide and include the revision last inspected. Supply only the fields that should change. If a concurrent edit invalidates that revision, reread and reconcile the request before retrying.
5. For a sequence change, inspect the current deck order and provide the intended slide-number permutation to presentations-reorder_slides. On validation failure, reread current positions instead of guessing.
6. Use presentations-export for a requested file. Verify slide interval, format, warnings, and truncation metadata before describing its completeness.

Preserve user wording and supplied source material. These tools may return service unavailability; do not claim that content changes or exports completed unless a success result confirms them.

When the request is only for an export, do not add or revise slides as part of rendering. State the selected slide interval so the user can distinguish a partial export from a whole-deck copy.

This skill edits or exports known decks; it does not create presentation files.
