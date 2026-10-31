---
description: Use to inspect and interact with the current web page, then verify the result.
---

# Browser interaction

1. Use `snapshot` to discover actionable targets or controls. For read-only details or verification, use scoped `get_text` directly when sufficient; a snapshot is not required before a text read. Reuse current valid observations rather than reading the same information twice.
2. Choose targets from current page observations and reuse references while valid. Use `batch` for known actions that need no intermediate inspection; reinspect after navigation or another change that may invalidate targets. Waits are explicit; the tool does not wait automatically. When a fixed settling delay is needed, follow the click with `wait` in the same batch. Omit `seconds` for the default five-second wait unless the user explicitly requests another duration. Do not run concurrent calls in one browser session.
3. After a partial `batch` failure, inspect current state before retrying. Verify the requested result after updates settle and report any failure or unresolved outcome.
4. Once the user goal is verified, finish and report. Leave the browser open unless the user explicitly requests closing it or closing is part of the task.
