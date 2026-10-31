export interface ShoppingProductRow {
  name: string;
  size: string;
  price: string;
  available: true;
  quantity: number;
  plus: string;
  minus: string | null;
}

export interface ShoppingProductReaderResult {
  status: "ready" | "unavailable" | "wrong_page" | "mapping_error";
  products: ShoppingProductRow[];
  error?: string;
}

// Read card-scoped DOM details and verify unique action selectors.
export const SHOPPING_PRODUCT_READER_SCRIPT = String.raw`(() => {
  if (location.origin !== "http://127.0.0.1:4173" ||
      location.pathname.replace(/\/+$/, "") !== "/favorites") {
    return { status: "wrong_page", products: [], error: "Open the store Favorites page first." };
  }
  const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
  const fail = (status, error) => ({ status, products: [], error });
  const app = document.querySelector("#app");
  const loader = document.querySelector("#page-loader");
  if (!app || app.inert || (loader && !loader.hidden)) {
    return fail("unavailable", "Favorites are still loading; wait and reread.");
  }
  if (clean(app.querySelector("h1")?.textContent) !== "Favorites" ||
      !app.querySelector(".product-grid")) {
    return fail("unavailable", "Favorites listings are not initialized or use unsupported markup.");
  }
  const cards = Array.from(app.querySelectorAll(".product-grid .product-card"));
  if (!cards.length) return fail("unavailable", "No Favorites product cards were found.");
  const products = [];
  for (const card of cards) {
    const availability = clean(card.querySelector(".product-availability")?.textContent);
    if (availability === "Unavailable") continue;
    if (availability !== "Available") {
      return fail("mapping_error", "A Favorites card has unknown availability markup.");
    }
    if (card.getAttribute("aria-busy") === "true") {
      return fail("unavailable", "Cart quantities are still updating; wait and reread.");
    }
    const control = card.querySelector(".quantity-control");
    const output = card.querySelector(".quantity-value");
    const rawQuantity = control?.getAttribute("data-quantity");
    const quantityText = clean(output?.textContent);
    if (rawQuantity === null || rawQuantity === undefined ||
        !/^(0|[1-9]\d*)$/.test(rawQuantity) || quantityText !== rawQuantity ||
        !Number.isSafeInteger(Number(rawQuantity))) {
      return fail("unavailable", "A current cart quantity is missing or unreadable; do not assume zero.");
    }
    const quantity = Number(rawQuantity);
    const name = clean(card.querySelector("h3")?.textContent);
    const size = clean(card.querySelector(".product-amount")?.textContent);
    const price = clean(card.querySelector(".product-price")?.textContent);
    const id = card.getAttribute("data-ref");
    if (!name || !size || !price || !id) {
      return fail("mapping_error", "A Favorites card is missing product details or an action reference.");
    }
    const escaped = id.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const root = 'article.product-card[data-ref="' + escaped + '"]';
    const target = (className) => {
      const button = card.querySelector(className);
      const selector = root + " " + className;
      const matches = document.querySelectorAll(selector);
      return button && !button.hidden && !button.disabled &&
        matches.length === 1 && matches[0] === button &&
        button.closest(".product-card") === card ? selector : null;
    };
    const plus = target(".quantity-up");
    const minus = target(".quantity-down");
    if (!plus || (quantity > 0 && !minus) ||
        (quantity === 0 && minus) || output.hidden !== (quantity === 0)) {
      return fail("mapping_error", "Favorites quantity controls cannot be mapped unambiguously.");
    }
    products.push({ name, size, price, available: true, quantity, plus, minus });
  }
  return { status: "ready", products };
})()`;

export function normalizeShoppingProductReaderResult(
  value: unknown,
): ShoppingProductReaderResult {
  if (value === null || typeof value !== "object") {
    throw new Error("Shopping product reader returned malformed data.");
  }
  const result = value as Record<string, unknown>;
  const status = result.status;
  if (
    status !== "ready" &&
    status !== "unavailable" &&
    status !== "wrong_page" &&
    status !== "mapping_error"
  ) {
    throw new Error("Shopping product reader returned an unknown status.");
  }
  if (
    !Array.isArray(result.products) ||
    (status !== "ready" && result.products.length !== 0)
  ) {
    throw new Error(
      "Shopping product reader returned an invalid product list.",
    );
  }
  const nonempty = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;
  const products = result.products.map((value, index) => {
    if (value === null || typeof value !== "object") {
      throw new Error(`Shopping product row ${index + 1} is malformed.`);
    }
    const row = value as Record<string, unknown>;
    if (
      !nonempty(row.name) ||
      !nonempty(row.size) ||
      !nonempty(row.price) ||
      row.available !== true ||
      typeof row.quantity !== "number" ||
      !Number.isSafeInteger(row.quantity) ||
      row.quantity < 0 ||
      !nonempty(row.plus) ||
      (row.quantity === 0 ? row.minus !== null : !nonempty(row.minus))
    ) {
      throw new Error(`Shopping product row ${index + 1} is malformed.`);
    }
    return {
      name: row.name,
      size: row.size,
      price: row.price,
      available: true as const,
      quantity: row.quantity,
      plus: row.plus,
      minus: row.minus as string | null,
    };
  });
  const targets = products.flatMap((row) =>
    row.minus === null ? [row.plus] : [row.plus, row.minus],
  );
  if (new Set(targets).size !== targets.length) {
    throw new Error(
      "Shopping product reader returned duplicate action targets.",
    );
  }
  return {
    status,
    products,
    ...(typeof result.error === "string" ? { error: result.error } : {}),
  };
}
