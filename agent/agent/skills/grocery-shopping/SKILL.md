---
description: Use to review live grocery products and a current cart, then make requested cart updates.
---

# Grocery shopping

Shopping happens at: http://127.0.0.1:4173/favorites

1. Inspect the live Favorites listings and use reliable current quantities shown alongside products as the starting state. Visit the cart initially only when quantity information is missing, unclear, or uninitialized; never infer an empty cart from missing or unreadable values. Use `snapshot` to discover actionable targets or controls, and scoped `get_text` directly for read-only details or verification when sufficient; a snapshot is not required before text reads. Reuse current valid observations rather than reading the same information twice. Use visible Favorites search or scrolling to find requested items. Do not search or navigate to the Catalog to find unavailable items; opening the cart to read quantities or verify the result is allowed.
2. Interpret requested amounts, package sizes, and quantities from the request and the product details shown. Choose suitable available products and variants only from Favorites listings. If an item is unavailable there, skip it and report it.
3. Compare requested quantities with the current cart and use one `batch` for known quantity updates: click, `wait`, repeat. Waits are explicit; the tool does not wait automatically. Omit `seconds` for the default five-second wait unless the user explicitly requests another duration. Avoid unnecessary intermediate snapshots; reinspect after navigation or changes that invalidate targets. Do not run concurrent calls in one browser session.
4. After a partial batch failure, reread current quantities before retrying.
5. Let updates settle, then inspect the cart and verify its products and quantities against the request. Do not proceed to checkout.
6. Report missing items, substitutions, or unresolved ambiguities alongside the resulting cart state.
7. Once the requested result is verified, finish and report. Leave the browser open unless the user explicitly requests closing it or closing is part of the task.
