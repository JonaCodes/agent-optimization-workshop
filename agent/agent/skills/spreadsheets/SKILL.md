---
description: Use to find, inspect, create, edit, format, or export workbooks and cell ranges.
---

## Procedure

1. Locate a workbook with spreadsheets-search using the name or relevant phrase. Apply known folder, label, or date filters; continue pagination only as needed and include archived workbooks only when requested.
2. Inspect only the needed tab and A1 range with spreadsheets-read_range. Choose values, formulas, or both based on the user's question. Check dimensions and clipping metadata before interpreting blank or missing cells.
3. Create a new workbook only when requested, using spreadsheets-create with a clear title and distinct tab names. Include seed rows only when the user supplied the initial values. Search first when the request may refer to an existing workbook.
4. Before changing cells, read the target range. Use spreadsheets-write_range with a matrix matching the requested area and the appropriate raw, entered, or formula mode. Include the inspected revision when available. If the revision is stale, reread and reconcile rather than repeating the write.
5. Use spreadsheets-format_range for presentation properties, leaving values alone. Use spreadsheets-export when a file rendering or workbook download is requested; review scope, size, and truncation details.

Keep ranges narrow and preserve adjacent content. Do not supply invented data or formulas. Report service unavailability as an incomplete operation, never as a successful edit or export.
