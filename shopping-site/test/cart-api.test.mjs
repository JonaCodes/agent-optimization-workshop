import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createShoppingServer } from "../server.mjs";

async function createApi(t, scenarioName = "happy") {
  const server = createShoppingServer({ scenarioName });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/api/cart`;

  async function request(method = "GET", change) {
    const response = await fetch(url, {
      method,
      ...(change === undefined
        ? {}
        : {
            headers: { "content-type": "application/json" },
            body: JSON.stringify(change),
          }),
    });
    return { status: response.status, body: await response.json() };
  }

  async function startPost(change) {
    const received = new Promise((resolve) => {
      server.once("request", (request) => request.once("end", resolve));
    });
    const completed = request("POST", change);
    await received;
    return { completed };
  }

  return { request, startPost };
}

test("cart reads expose committed quantities while an update is pending", async (t) => {
  const api = await createApi(t);
  const initial = await api.request();
  assert.deepEqual(initial, {
    status: 200,
    body: { quantities: {}, revision: 0 },
  });

  const startedAt = performance.now();
  const pending = await api.startPost({
    productId: "oats-organic-1000",
    delta: 1,
  });
  const invalid = await api.request("POST", {
    productId: "missing-product",
    delta: 1,
  });
  assert.equal(invalid.status, 400);
  assert.deepEqual(await api.request(), initial);

  const committed = await pending.completed;
  assert.ok(performance.now() - startedAt >= 900);
  assert.deepEqual(committed, {
    status: 200,
    body: { quantities: { "oats-organic-1000": 1 }, revision: 1 },
  });
  assert.deepEqual(await api.request(), committed);
});

test("overlapping changes stay ordered per product without blocking other products", async (t) => {
  const api = await createApi(t);
  const first = await api.startPost({
    productId: "oats-organic-1000",
    delta: 1,
  });
  const second = await api.startPost({
    productId: "oats-organic-1000",
    delta: 1,
  });
  const removal = await api.startPost({
    productId: "oats-organic-1000",
    remove: true,
  });
  const independent = await api.startPost({
    productId: "milk-two-1000",
    delta: 1,
  });

  const [addedOnce, addedTwice, removed, otherProduct] = await Promise.all(
    [first, second, removal, independent].map(({ completed }) => completed),
  );
  for (const result of [addedOnce, addedTwice, removed, otherProduct])
    assert.equal(result.status, 200);
  assert.equal(addedOnce.body.quantities["oats-organic-1000"], 1);
  assert.equal(addedTwice.body.quantities["oats-organic-1000"], 2);
  assert.ok(addedOnce.body.revision < addedTwice.body.revision);
  assert.ok(otherProduct.body.revision < addedTwice.body.revision);
  assert.deepEqual(removed.body, {
    quantities: { "milk-two-1000": 1 },
    revision: 4,
  });
  assert.deepEqual(await api.request(), removed);
});

test("reset restores the scenario cart and cancels pending changes from before reset", async (t) => {
  const api = await createApi(t, "in-process");
  const initialQuantities = {
    "oats-organic-1000": 1,
    "milk-two-1000": 1,
    "pasta-penne-500": 1,
  };
  assert.deepEqual(await api.request(), {
    status: 200,
    body: { quantities: initialQuantities, revision: 0 },
  });
  const changed = await api.request("POST", {
    productId: "oats-organic-1000",
    remove: true,
  });
  assert.equal(changed.status, 200);
  assert.equal(changed.body.quantities["oats-organic-1000"], undefined);

  const pending = await api.startPost({
    productId: "milk-two-1000",
    delta: 1,
  });
  const queued = await api.startPost({
    productId: "milk-two-1000",
    remove: true,
  });
  assert.deepEqual(await api.request("DELETE"), {
    status: 200,
    body: { quantities: initialQuantities, revision: 2 },
  });
  const fresh = await api.startPost({
    productId: "milk-two-1000",
    delta: 1,
  });

  const [canceled, canceledQueued, committed] = await Promise.all(
    [pending, queued, fresh].map(({ completed }) => completed),
  );
  assert.equal(canceled.status, 409);
  assert.equal(canceledQueued.status, 409);
  assert.deepEqual(committed, {
    status: 200,
    body: {
      quantities: { ...initialQuantities, "milk-two-1000": 2 },
      revision: 3,
    },
  });
  assert.deepEqual(await api.request(), committed);
});
