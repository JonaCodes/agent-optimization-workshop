import { nextQuantity } from "../cart-logic.mjs";
import { isProductAvailable } from "../inventory.mjs";
import { PRODUCTS } from "../products.mjs";
import { ACTIVE_SCENARIO, getScenarioState } from "../scenario.mjs";
import { renderPage } from "./views.mjs";

const app = document.querySelector("#app");
const loader = document.querySelector("#page-loader");
const scenario = getScenarioState(ACTIVE_SCENARIO);
const quantities = new Map(PRODUCTS.map((product) => [product.id, 0]));
const confirmedQuantities = new Map(PRODUCTS.map((product) => [product.id, 0]));
const pendingChangesByProductId = new Map(
  PRODUCTS.map((product) => [product.id, []]),
);
const tokensByProductId = new Map(
  PRODUCTS.map((product) => [product.id, crypto.randomUUID()]),
);
const productIdByToken = new Map(
  [...tokensByProductId].map(([id, token]) => [token, id]),
);
const activeCardByProductId = new Map();
const routeByPath = new Map([
  ["/", "catalog"],
  ["/catalog", "catalog"],
  ["/favorites", "favorites"],
  ["/cart", "cart"],
]);
let removalInProgress = false;
let latestCartRevision = -1;
let nextMutationId = 0;
let cartNotice = "";

async function requestCart(method = "GET", change) {
  const response = await fetch("/api/cart", {
    method,
    headers: change ? { "content-type": "application/json" } : undefined,
    body: change ? JSON.stringify(change) : undefined,
  });
  if (!response.ok) throw new Error("Cart request failed");
  return response.json();
}

function applyCartSnapshot(snapshot, updatePage = true) {
  if (
    !Number.isInteger(snapshot.revision) ||
    snapshot.revision < latestCartRevision
  )
    return;
  latestCartRevision = Math.max(latestCartRevision, snapshot.revision);
  const changedProductIds = [];
  for (const product of PRODUCTS) {
    const productId = product.id;
    const changes = pendingChangesByProductId.get(productId);
    if (changes.some((change) => change.status === "pending")) continue;

    const confirmedQuantity = snapshot.quantities[productId] ?? 0;
    confirmedQuantities.set(productId, confirmedQuantity);
    const quantity = confirmedQuantity;
    const hadUnconfirmedChanges = changes.length > 0;
    changes.length = 0;
    if (quantities.get(productId) === quantity && !hadUnconfirmedChanges)
      continue;
    quantities.set(productId, quantity);
    changedProductIds.push(productId);
  }

  if (!updatePage || changedProductIds.length === 0) return;
  const route = routeByPath.get(
    window.location.pathname.replace(/\/+$/, "") || "/",
  );
  if (route === "cart" && !removalInProgress) renderRoute();
  else {
    for (const productId of changedProductIds) {
      updateProductCards(productId);
      updateFeedback(productId, "", false);
    }
  }
}

function projectedQuantity(productId) {
  return pendingChangesByProductId
    .get(productId)
    .reduce(
      (quantity, change) => nextQuantity(quantity, change.delta),
      confirmedQuantities.get(productId),
    );
}

async function syncCart(updatePage = true) {
  applyCartSnapshot(await requestCart(), updatePage);
}

function rememberCards(container) {
  activeCardByProductId.clear();
  for (const card of container.querySelectorAll(".product-card")) {
    const productId = productIdByToken.get(card.dataset.ref);
    activeCardByProductId.set(productId, card);
    card
      .querySelector(".quantity-down")
      ?.addEventListener("click", (event) =>
        changeProductQuantity(event.currentTarget, -1),
      );
    card
      .querySelector(".quantity-up")
      ?.addEventListener("click", (event) =>
        changeProductQuantity(event.currentTarget, 1),
      );
  }
}

function renderRoute() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const route = routeByPath.get(pathname);
  if (!route) return;

  activeCardByProductId.clear();
  app.innerHTML = renderPage(route, {
    favoriteIds: scenario.favoriteIds,
    quantities,
    tokensByProductId,
    pendingChangesByProductId,
    cartNotice,
  });

  if (route === "cart") {
    for (const button of app.querySelectorAll(".cart-remove")) {
      button.addEventListener("click", () =>
        removeProductFromCart(productIdByToken.get(button.dataset.ref)),
      );
    }
  } else {
    rememberCards(app.querySelector(".product-grid"));
  }
}

function updateProductCards(productId) {
  const card = activeCardByProductId.get(productId);
  if (!card) return;
  const quantity = quantities.get(productId);
  const hasQuantity = quantity > 0;
  const control = card.querySelector(".quantity-control");
  if (control) control.dataset.quantity = String(quantity);
  const decrement = card.querySelector(".quantity-down");
  if (decrement) {
    decrement.hidden = !hasQuantity;
    decrement.disabled = !hasQuantity;
  }
  const output = card.querySelector(".quantity-value");
  if (output) {
    output.textContent = String(quantity);
    output.hidden = !hasQuantity;
  }
}

function updateFeedback(productId, message, pending) {
  const card = activeCardByProductId.get(productId);
  if (!card) return;
  card.querySelector(".mutation-feedback").textContent = message;
  card.setAttribute("aria-busy", String(pending));
}

function changeProductQuantity(button, change) {
  const token = button.closest(".product-card")?.dataset.ref;
  const productId = productIdByToken.get(token);
  if (!productId || !isProductAvailable(productId)) return;

  const currentQuantity = quantities.get(productId);
  if (change < 0 && currentQuantity === 0) return;

  const mutationId = nextMutationId++;
  pendingChangesByProductId
    .get(productId)
    .push({ mutationId, delta: change, status: "pending" });
  quantities.set(productId, nextQuantity(currentQuantity, change));
  updateProductCards(productId);
  updateFeedback(productId, "Updating cart…", true);

  void requestCart("POST", { productId, delta: change }).then(
    (snapshot) => finishProductMutation(productId, mutationId, snapshot),
    () => failProductMutation(productId, mutationId),
  );
}

function findMutation(productId, mutationId) {
  const changes = pendingChangesByProductId.get(productId);
  return changes.find((change) => change.mutationId === mutationId);
}

async function finishProductMutation(productId, mutationId, snapshot) {
  const mutation = findMutation(productId, mutationId);
  if (mutation) mutation.status = "acknowledged";
  applyCartSnapshot(snapshot);
  try {
    await syncCart();
  } catch {
    // Keep the acknowledged optimistic quantity until a later poll succeeds.
  }

  const changes = pendingChangesByProductId.get(productId);
  const pendingRequest = changes.some((change) => change.status === "pending");
  const awaitingSnapshot = changes.length > 0;
  if (
    routeByPath.get(window.location.pathname.replace(/\/+$/, "") || "/") ===
    "cart"
  ) {
    if (!removalInProgress) renderRoute();
    return;
  }
  updateFeedback(
    productId,
    pendingRequest
      ? "Updating cart…"
      : awaitingSnapshot
        ? "Confirming cart…"
        : `Updated · ${quantities.get(productId)} in cart`,
    awaitingSnapshot,
  );
}

async function failProductMutation(productId, mutationId) {
  const changes = pendingChangesByProductId.get(productId);
  const index = changes.findIndex((change) => change.mutationId === mutationId);
  if (index !== -1) changes.splice(index, 1);
  quantities.set(productId, projectedQuantity(productId));
  updateProductCards(productId);

  try {
    await syncCart();
  } catch {
    // Keep the last confirmed snapshot if the follow-up read also fails.
  }

  if (
    routeByPath.get(window.location.pathname.replace(/\/+$/, "") || "/") ===
    "cart"
  ) {
    cartNotice = "Cart update failed. Showing the last confirmed cart.";
    if (!removalInProgress) renderRoute();
    return;
  }
  const pendingRequest = changes.some((change) => change.status === "pending");
  const awaitingSnapshot = changes.length > 0;
  updateFeedback(
    productId,
    pendingRequest
      ? "Updating cart…"
      : awaitingSnapshot
        ? "Confirming cart…"
        : `Update failed · ${quantities.get(productId)} in cart`,
    awaitingSnapshot,
  );
}

async function removeProductFromCart(productId) {
  if (removalInProgress || !productId || quantities.get(productId) === 0)
    return;
  removalInProgress = true;
  cartNotice = "";
  app.inert = true;
  loader.hidden = false;

  try {
    applyCartSnapshot(
      await requestCart("POST", { productId, remove: true }),
      false,
    );
  } catch {
    try {
      await syncCart(false);
    } catch {
      // Keep the last confirmed snapshot if the follow-up read also fails.
    }
    cartNotice = "Item removal failed. Showing the last confirmed cart.";
  } finally {
    loader.hidden = true;
    app.inert = false;
    removalInProgress = false;
    renderRoute();
  }
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-route]");
  if (
    !link ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  window.history.pushState(null, "", link.pathname);
  renderRoute();
});

window.addEventListener("popstate", renderRoute);
await syncCart(false);
renderRoute();
window.setInterval(() => void syncCart().catch(() => {}), 500);
