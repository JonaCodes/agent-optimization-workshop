---
description: Use to find, inspect, draft, send, or reply to email messages and conversations.
---

# Email operations

Start with `email-search_messages` when the user gives search terms, sender, recipient, subject, labels, or dates. Use explicit date bounds when the requested period is clear. For an inbox or conversation overview, use `email-list_threads` and continue with its cursor until the relevant range is covered. A thread summary is enough for orientation; use `email-get_message` when exact body wording, headers, or attachment metadata matters. Keep body retrieval bounded when only a small excerpt is needed.

Before composing a reply, identify the target with a current message ID. Use `email-reply_to_message` when the user asked to respond immediately and choose direct reply or reply-all based on the request. Use `email-create_draft` when the user wants wording prepared for review or saved without sending. For a new outgoing message, supply the intended recipients, subject, body, and any existing file references through `email-send_message` only when sending is requested.

After an action, use its returned identifiers and status to describe what happened. If recipient validation or service status indicates a problem, correct the specific input or report the limitation. If a send result is uncertain, inspect the conversation before repeating the operation. Do not infer recipients, attachments, or message content from unrelated context. When the user asks only for a summary or suggested wording, provide that in the response without changing mailbox state.
