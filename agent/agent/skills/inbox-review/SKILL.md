---
description: Use to review an inbox, summarize messages, or record follow-up work explicitly requested by the user.
---

# Inbox review

Load `email` with `eve__skill` before using email tools. Load `tasks` only when the user asks to record follow-up work, before using task tools.

Start with `email-list_threads` for a recent or unread overview. Apply a folder or label filter when the user specifies a mailbox section, and follow the cursor through the requested date range. Use `email-search_messages` when the user gives a sender, subject, phrase, or exact dates. A summary or snippet can guide triage, but open relevant messages with `email-get_message` when a summary depends on precise wording, headers, or attachment metadata.

Summarize the messages that match the requested scope, keeping senders, dates, subjects, and open questions distinct. Do not infer that a thread is complete until all relevant pages are read. If the user asks to prepare a response, use `email-create_draft` and retain the target message or thread reference. Use `email-reply_to_message` for an immediate response to a specific message, and `email-send_message` for a new outgoing email only when sending is requested. Report the returned draft or sent-message state.

When the user asks to track follow-up work, use `tasks-search_tasks` to check for an existing task and `tasks-create_task` to record a new one in the selected project. Use `tasks-list_projects` when the destination is unclear. Keep email review read-only unless the user requests a draft, reply, or send. After each requested change, describe the result using returned identifiers and status, and report service errors without retrying an ambiguous send blindly.
