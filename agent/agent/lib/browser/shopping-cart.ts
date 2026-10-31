import { z } from "zod";

const nonempty = z.string().trim().min(1);
const money = z.string().regex(/^\$(?:0|[1-9]\d{0,2}(?:,\d{3})*|[1-9]\d*)\.\d{2}$/);
const cartResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("ready"),
    items: z.array(z.object({
      name: nonempty,
      size: nonempty,
      quantity: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
      unitPrice: money,
      lineTotal: money,
    })).min(1),
    total: money,
    notices: z.array(nonempty),
  }),
  z.object({ status: z.literal("empty"), items: z.array(z.never()), notices: z.array(nonempty) }),
  ...["loading", "pending", "unavailable", "wrong_page", "mapping_error"].map(
    (status) => z.object({ status: z.literal(status), error: nonempty }),
  ),
]);

export function normalizeShoppingCartReaderResult(value: unknown) {
  return cartResultSchema.parse(value);
}

export const SHOPPING_CART_READER_SCRIPT = String.raw`(() => {
  const fail = (status, error) => ({ status, error });
  if (location.origin !== "http://127.0.0.1:4173" ||
      location.pathname.replace(/\/+$/, "") !== "/cart") {
    return fail("wrong_page", "Open the store Cart page first.");
  }
  const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
  const app = document.querySelector("#app");
  const loader = document.querySelector("#page-loader");
  if (!app || app.inert || (loader && !loader.hidden)) {
    return fail("loading", "Cart is still loading; wait and reread.");
  }
  const pages = app.querySelectorAll(".cart-page");
  if (pages.length !== 1 || clean(pages[0].querySelector("h1")?.textContent) !== "Your cart") {
    return fail("unavailable", "Cart is not initialized or uses unsupported markup.");
  }
  const page = pages[0];
  const notices = Array.from(page.querySelectorAll(".mutation-feedback"))
    .map(node => clean(node.textContent)).filter(Boolean);
  if (notices.some(text => /^(Updating|Confirming) cart/.test(text)) ||
      page.querySelector('[aria-busy="true"]')) {
    return fail("pending", "Cart quantities are still updating; wait and reread.");
  }
  const sections = page.querySelectorAll('.cart-content[aria-label="Shopping cart"]');
  if (sections.length !== 1) return fail("unavailable", "No unique cart contents found.");
  const section = sections[0];
  const rows = Array.from(section.querySelectorAll(".cart-row"));
  if (section.classList.contains("empty-cart")) {
    if (rows.length || section.querySelector(".cart-grand-total") ||
        clean(section.querySelector("p")?.textContent) !== "Your cart is empty. Add something good.") {
      return fail("mapping_error", "Empty-cart confirmation conflicts with the cart markup.");
    }
    return { status: "empty", items: [], notices };
  }
  if (!rows.length) return fail("unavailable", "No cart rows or empty-cart confirmation found.");
  const text = (root, selector) => {
    const nodes = root.querySelectorAll(selector);
    return nodes.length === 1 ? clean(nodes[0].textContent) : "";
  };
  const money = /^\$(?:0|[1-9]\d{0,2}(?:,\d{3})*|[1-9]\d*)\.\d{2}$/;
  const items = [];
  for (const row of rows) {
    const name = text(row, ".cart-product strong");
    const size = text(row, ".cart-product span");
    const rawQuantity = text(row, ".cart-quantity");
    const quantity = Number(rawQuantity);
    const unitPrice = text(row, ".cart-unit");
    const lineTotal = text(row, ".cart-line-total");
    if (!name || !size || !/^[1-9]\d*$/.test(rawQuantity) ||
        !Number.isSafeInteger(quantity) || !money.test(unitPrice) || !money.test(lineTotal)) {
      return fail("mapping_error", "A cart row could not be read completely; inspect the cart.");
    }
    items.push({ name, size, quantity, unitPrice, lineTotal });
  }
  const total = text(section, ".cart-grand-total strong");
  if (!money.test(total)) return fail("mapping_error", "Cart grand total could not be read.");
  return { status: "ready", items, total, notices };
})()`;
