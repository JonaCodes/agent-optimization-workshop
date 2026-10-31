---
description: Use to find, inspect, create, update, or complete tasks and resolve their project destinations.
---

# Task operations

Use `tasks-search_tasks` to locate work by title, words, project, status, assignee, due date, or label. Choose a status and sort order that fit the request, then follow the cursor if the relevant set extends beyond one page. Use `tasks-list_projects` to resolve the destination before creating a task or changing its project. Project names can repeat, so use the returned ID in later operations. Use `tasks-get_task` when the user asks for details or when an update depends on existing values.

For new work, use `tasks-create_task` with the requested title and only supplied details. Add an assignee, date, priority, labels, checklist, or links only when they are known. If a task may already exist, inspect search results first. Use `tasks-update_task` for changes other than a focused completion. Supplied labels and checklist values replace their full collections, so retrieve the task and preserve values the user did not ask to remove. Omitted fields remain unchanged.

Use `tasks-complete_task` when the user reports a task is finished or explicitly asks to mark it complete. Confirm the intended task before changing its status. Check returned status, completion time, and notification information after each write. If a write result is uncertain, retrieve the task or search for it before retrying. Summarize the applied change and any provider warning without claiming fields were saved when the result does not confirm them.
