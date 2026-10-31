import assert from "node:assert/strict";
import test from "node:test";
import { createCartStore } from "../src/cart-store.mjs";

test("shared cart applies changes against current server state", () => {
  const cart = createCartStore(["oats"]);

  assert.equal(cart.change("oats", 1), true);
  assert.equal(cart.change("oats", 1), true);
  assert.deepEqual(cart.read(), { quantities: { oats: 2 } });
  assert.equal(cart.change("oats", -1), true);
  assert.deepEqual(cart.read(), { quantities: { oats: 1 } });
});

test("shared cart removal and reset clear server state", () => {
  const cart = createCartStore(["oats", "milk"]);

  cart.change("oats", 2);
  cart.change("milk", 1);
  cart.remove("oats");
  assert.deepEqual(cart.read(), { quantities: { milk: 1 } });
  cart.reset();
  assert.deepEqual(cart.read(), { quantities: {} });
});

test("seeded cart restores its original quantities on reset", () => {
  const initialQuantities = { oats: 1, pasta: 1 };
  const cart = createCartStore(["oats", "milk", "pasta"], initialQuantities);
  initialQuantities.oats = 9;
  assert.deepEqual(cart.read(), { quantities: { oats: 1, pasta: 1 } });

  cart.remove("oats");
  cart.change("pasta", 1);
  cart.change("milk", 1);
  cart.reset();
  assert.deepEqual(cart.read(), { quantities: { oats: 1, pasta: 1 } });
});
