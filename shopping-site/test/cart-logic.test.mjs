import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateCart,
  MUTATION_DELAY_SCHEDULE_MS,
  mutationDelayAt,
  nextQuantity,
} from "../src/cart-logic.mjs";
import { PRODUCTS, PRODUCTS_BY_ID } from "../src/products.mjs";
import { getScenarioState } from "../src/scenario.mjs";

test("quantity changes never go below zero", () => {
  assert.equal(nextQuantity(0, -1), 0);
  assert.equal(nextQuantity(4, -1), 3);
  assert.equal(nextQuantity(0, 1), 1);
});

test("cart totals use integer cents and omit empty products", () => {
  const products = [
    { id: "one", priceCents: 189 },
    { id: "two", priceCents: 249 },
  ];
  const cart = calculateCart(
    new Map([
      ["one", 2],
      ["two", 1],
    ]),
    products,
  );
  assert.deepEqual(cart.lines, [
    { productId: "one", quantity: 2, unitPriceCents: 189, lineTotalCents: 378 },
    { productId: "two", quantity: 1, unitPriceCents: 249, lineTotalCents: 249 },
  ]);
  assert.equal(cart.totalCents, 627);
});

test("catalog contains at least 75 products with unique IDs", () => {
  assert.ok(PRODUCTS.length >= 75);
  assert.equal(
    new Set(PRODUCTS.map((product) => product.id)).size,
    PRODUCTS.length,
  );
});

test("scenario fixtures are stable and keep the Favorites list size", () => {
  for (const name of ["happy", "partial", "in-process"]) {
    const first = getScenarioState(name);
    assert.deepEqual(getScenarioState(name), first);
    assert.equal(first.favoriteIds.length, 25);
    assert.equal(new Set(first.favoriteIds).size, 25);
    assert.ok(first.favoriteIds.every((id) => PRODUCTS_BY_ID.has(id)));
  }
  assert.deepEqual(getScenarioState("happy").initialQuantities, {});
  assert.deepEqual(getScenarioState("partial").initialQuantities, {});
  assert.deepEqual(
    getScenarioState("in-process").favoriteIds,
    getScenarioState("happy").favoriteIds,
  );
  assert.deepEqual(getScenarioState("in-process").initialQuantities, {
    "oats-organic-1000": 1,
    "milk-two-1000": 1,
    "pasta-penne-500": 1,
  });
  assert.throws(() => getScenarioState("unavailable"), /Unknown scenario/);
});

test("mutation delays follow a fixed repeating schedule", () => {
  assert.equal(mutationDelayAt(0), MUTATION_DELAY_SCHEDULE_MS[0]);
  assert.equal(
    mutationDelayAt(MUTATION_DELAY_SCHEDULE_MS.length),
    MUTATION_DELAY_SCHEDULE_MS[0],
  );
  assert.equal(mutationDelayAt(5), 5800);
  assert.ok(
    MUTATION_DELAY_SCHEDULE_MS.filter((delay) => delay < 1500).length > 5,
  );
});
