import { calculateCart } from "../cart-logic.mjs";
import { isProductAvailable } from "../inventory.mjs";
import { PRODUCTS, PRODUCTS_BY_ID } from "../products.mjs";

export function renderPage(route, state) {
  const page =
    route === "cart"
      ? renderCartPage(state)
      : renderProductPage(route, state);
  return `${renderHeader(route)}${page}`;
}

function formatMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function productCard(product, state) {
  const { quantities, tokensByProductId, pendingChangesByProductId } = state;
  const token = tokensByProductId.get(product.id);
  const available = isProductAvailable(product.id);
  const quantity = quantities.get(product.id);
  const pending = pendingChangesByProductId.get(product.id).length > 0;
  const controlMarkup = available
    ? `<div class="quantity-control" data-quantity="${quantity}">
        <button class="quantity-down" type="button" aria-label="Decrease ${product.name} quantity"${quantity === 0 ? " hidden disabled" : ""}>−</button>
        <output class="quantity-value" aria-live="polite"${quantity === 0 ? " hidden" : ""}>${quantity}</output>
        <button class="quantity-up" type="button" aria-label="Increase ${product.name} quantity">+</button>
      </div>`
    : "";

  return `<article class="product-card" data-ref="${token}" data-amount="${product.amount}" data-unit="${product.unit}"${pending ? ' aria-busy="true"' : ""}>
    <meta itemprop="size" content="${product.amount} ${product.unit}">
    <div class="product-art">
      <span class="product-icon" aria-hidden="true">${product.icon}</span>
      ${controlMarkup}
    </div>
    <div class="product-copy">
      <h3>${product.name}</h3>
      <p class="product-amount">${product.amount} ${product.unit}</p>
      <p class="product-price">${formatMoney(product.priceCents)}</p>
      <p class="product-availability">${available ? "Available" : "Unavailable"}</p>
    </div>
    ${available ? "" : '<p class="availability-note">Unavailable right now</p>'}
    <p class="mutation-feedback" aria-live="polite">${pending ? "Updating cart…" : ""}</p>
  </article>`;
}

function renderProductPage(viewName, state) {
  const favorites = viewName === "favorites";
  const products = favorites
    ? state.favoriteIds.map((id) => PRODUCTS_BY_ID.get(id))
    : PRODUCTS;
  const title = favorites ? "Favorites" : "Catalog";
  const eyebrow = favorites ? "YOUR USUALS" : "THE MARKET";
  const description = favorites
    ? "Good things, gathered in one place."
    : "Take a look around.";

  return `<main class="main-content"><div class="page-intro"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1></div><p>${description}</p></div>
    <div class="product-grid">${products.map((product) => productCard(product, state)).join("")}</div></main>`;
}

function renderCartStatus({ pendingChangesByProductId, cartNotice }) {
  const hasPendingChanges = [...pendingChangesByProductId.values()].some(
    (changes) => changes.length > 0,
  );
  return `${cartNotice ? `<p class="mutation-feedback" role="status">${cartNotice}</p>` : ""}${hasPendingChanges ? '<p class="mutation-feedback" role="status">Updating cart…</p>' : ""}`;
}

function renderCartPage(state) {
  const { quantities, tokensByProductId } = state;
  const cart = calculateCart(quantities, PRODUCTS);
  if (cart.lines.length === 0) {
    return `<main class="main-content cart-page"><div class="page-intro"><div><p class="eyebrow">YOUR ORDER</p><h1>Your cart</h1></div></div>
      ${renderCartStatus(state)}
      <section class="cart-content empty-cart" aria-label="Shopping cart">
        <span class="empty-cart-mark" aria-hidden="true">▤</span>
        <p>Your cart is empty. Add something good.</p>
        <a href="/catalog" data-route>Browse catalog</a>
      </section></main>`;
  }

  const rows = cart.lines
    .map((line) => {
      const product = PRODUCTS_BY_ID.get(line.productId);
      const token = tokensByProductId.get(product.id);
      return `<div class="cart-row">
        <div class="cart-item-cell">
          <div class="cart-item-visual"><span class="cart-product-icon" aria-hidden="true">${product.icon}</span>
            <button class="cart-remove" type="button" data-ref="${token}" aria-label="Remove ${product.name} from cart">×</button>
          </div>
          <div class="cart-product"><strong>${product.name}</strong><span>${product.amount} ${product.unit}</span></div>
        </div>
        <span class="cart-quantity">${line.quantity}</span>
        <span class="cart-unit">${formatMoney(line.unitPriceCents)}</span>
        <strong class="cart-line-total">${formatMoney(line.lineTotalCents)}</strong>
      </div>`;
    })
    .join("");

  return `<main class="main-content cart-page"><div class="page-intro"><div><p class="eyebrow">YOUR ORDER</p><h1>Your cart</h1></div><p>${cart.lines.length} item${cart.lines.length === 1 ? "" : "s"}</p></div>
    ${renderCartStatus(state)}
    <section class="cart-content" aria-label="Shopping cart">
      <div class="cart-headings" aria-hidden="true"><span>Item</span><span>Qty</span><span>Unit price</span><span>Total</span></div>
      ${rows}
      <div class="cart-grand-total"><span>Grand total</span><strong>${formatMoney(cart.totalCents)}</strong></div>
    </section></main>`;
}

function renderHeader(route) {
  return `<header class="site-header">
      <a class="brand" href="/catalog" data-route aria-label="Good Basket Market"><span class="brand-mark" aria-hidden="true">g</span><span>good basket</span></a>
      <nav class="view-nav" aria-label="Shop views">
        <a href="/favorites" data-route${route === "favorites" ? ' aria-current="page"' : ""}>Favorites</a>
        <a href="/catalog" data-route${route === "catalog" ? ' aria-current="page"' : ""}>Catalog</a>
      </nav>
      <a class="cart-open" href="/cart" data-route${route === "cart" ? ' aria-current="page"' : ""}><span aria-hidden="true">▤</span> Cart</a>
    </header>`;
}

