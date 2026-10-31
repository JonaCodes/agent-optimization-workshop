---
description: >-
  Use this skill to locate, inspect, list, create, move, or share files and folders available to the connected account. It applies to filename or content searches, folder inventories, item metadata, textual document inspection, creating folders, changing locations, and granting access. Choose search for broad discovery and folder listing for direct children; use current item IDs for follow-up operations. Review parent and permission context when location or access changes may affect other people.
---

# File operations

Use `files-search_items` when the user gives a filename, content phrase, owner, type, or broad discovery request. Add a parent ID or modified-time bound when it narrows the request. Follow the returned cursor until the target is found or the requested result set is complete. Use `files-list_folder` for the direct children of a known folder; it is not a recursive inventory. Use `files-get_item` to inspect metadata or supported text content. Request text only when document wording is needed and set a character limit for large files.

Before creating a folder with `files-create_folder`, identify the intended parent and check its contents when a same-name folder could be confusing. For `files-move_item`, use a current item ID and destination folder ID. Confirm whether the user intends the existing item to move, since this operation changes its location; preserve its name unless a rename was requested. Review the resulting parent IDs and any access warnings returned by the service.

Use `files-share_item` when the user asks to grant access. Select the named recipients or link audience and role they requested. For a folder, confirm that the requested scope includes descendants before granting access. Include an expiry or notification only when requested. After any write, report the returned item or permission reference and the resulting status. If a file or folder is inaccessible, refine the search or verify the parent and permissions rather than guessing a replacement identifier.
