---
description: >-
  Use this skill when the user asks to assemble a report from workspace documents, spreadsheet ranges, or presentation slides, or to prepare a final document or exported deck for review. Triggers include collecting source material for a status report, validating report facts against a workbook, summarizing selected slide text, drafting a new report document from supplied information, or exporting a finished report. Use documents-search and documents-read to find and inspect prose, spreadsheets-search and spreadsheets-read_range for tabular evidence, and presentations-search and presentations-read_slides for slide content. Create or export only when requested, using documents-create, documents-update, documents-export, or presentations-export as appropriate. This skill does not authorize adding unverified content or changing source records.
---

## Procedure

1. Identify the output type and source scope from the user's request. Search only the relevant collections with documents-search, spreadsheets-search, or presentations-search. Confirm the selected IDs and read dates or revision metadata.
2. Retrieve bounded source material. Use documents-read for requested sections, spreadsheets-read_range for exact tab ranges, and presentations-read_slides for selected slides. Keep source identifiers and revision labels beside notes during drafting so facts can be traced back to their locations.
3. Draft from retrieved material and user-supplied context. Preserve distinctions between confirmed values, estimates, and open questions. Do not fill missing values, invent dates, or treat a search excerpt as a complete source.
4. If the user requests a saved report document, use documents-create for a new item or documents-update for a confirmed existing one. Include only the requested content and use a revision check for edits. If the user requests a deck export, use presentations-export on the selected presentation; if the report is a document, use documents-export.
5. Check the returned revision, format, size, and truncation details. A completed draft and a successful save or export are separate outcomes; describe each according to the result actually returned.

When any source or output service is unavailable, keep the affected portion marked unresolved and report the failed operation. Do not claim an assembled report contains data that could not be read.
