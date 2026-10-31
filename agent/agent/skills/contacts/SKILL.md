---
description: >-
  Use this skill to find, inspect, create, or update people and address-book groups. It applies when a user refers to a contact by name, email, phone, organization, tags, or group, and when contact fields need to be reviewed or maintained. Search before creating when a record may already exist, use stable IDs from current results, and retrieve details before making partial changes to collections such as emails or phone numbers. Group membership listings are paginated and should be completed when a full membership list is requested.
---

# Contact operations

Use `contacts-search_people` with the strongest known name, email, organization, or tag filters. If several candidates match, compare the available summary fields and use `contacts-get_person` to inspect the relevant field groups before selecting one. Request only the needed groups when the record contains unrelated details. Treat a missing field as unknown rather than filling it from context.

Use `contacts-create_person` when the user asks to add a person and no matching record is evident. Pass only details the user supplied or confirmed, and use typed email and phone entries when available. If the provider reports a duplicate candidate, inspect it before creating another record. For changes, first retrieve the current record when collection fields are involved. `contacts-update_person` replaces supplied email or phone collections as a whole; preserve existing values the user did not ask to remove. Omitted fields remain unchanged.

Use `contacts-list_groups` to locate a group by name or scope before working with membership. Use `contacts-get_group_members` for a requested member list, and continue with its cursor until all requested pages are covered. Then use `contacts-get_person` only when detailed member fields are needed. Report record IDs or group IDs only when useful for follow-up. After a write, summarize which fields were accepted and report any provider warning rather than assuming every value was saved.
