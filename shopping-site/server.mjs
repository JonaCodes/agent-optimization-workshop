import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { mutationDelayAt } from "./src/cart-logic.mjs";
import { createCartStore } from "./src/cart-store.mjs";
import { PRODUCTS } from "./src/products.mjs";
import { ACTIVE_SCENARIO, getScenarioState } from "./src/scenario.mjs";

const siteRoot = resolve(fileURLToPath(new URL(".", import.meta.url)));
const serverFile = fileURLToPath(import.meta.url);
const pageRoutes = new Set(["/", "/catalog", "/favorites", "/cart"]);
const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
]);

export function createShoppingServer({ scenarioName = ACTIVE_SCENARIO } = {}) {
  const scenario = getScenarioState(scenarioName);
  const productIds = PRODUCTS.map((product) => product.id);
  const validProductIds = new Set(productIds);
  const cart = createCartStore(productIds, scenario.initialQuantities);
  const mutationQueues = new Map();
  let mutationNumber = 0;
  let mutationGeneration = 0;
  let revision = 0;

  function readSnapshot() {
    return { ...cart.read(), revision };
  }

  async function handleCartRequest(request, response, generationAtArrival) {
    if (request.method === "GET") {
      sendJson(response, 200, readSnapshot());
      return;
    }

    if (request.method === "DELETE") {
      mutationGeneration += 1;
      mutationQueues.clear();
      cart.reset();
      mutationNumber = 0;
      revision += 1;
      sendJson(response, 200, readSnapshot());
      return;
    }

    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    let change;
    try {
      change = await readJson(request);
    } catch {
      sendJson(response, 400, { error: "Invalid request" });
      return;
    }

    if (!isValidChange(change, validProductIds)) {
      sendJson(response, 400, { error: "Invalid cart change" });
      return;
    }
    if (generationAtArrival !== mutationGeneration) {
      sendJson(response, 409, {
        error: "Cart changed before the update completed",
      });
      return;
    }

    const delay = mutationDelayAt(mutationNumber++);
    const previous = mutationQueues.get(change.productId) ?? Promise.resolve();
    const mutation = previous
      .catch(() => {})
      .then(async () => {
        await wait(delay);
        if (generationAtArrival !== mutationGeneration) return null;

        const changed = change.remove
          ? cart.remove(change.productId)
          : cart.change(change.productId, change.delta);
        if (!changed) return null;

        revision += 1;
        return readSnapshot();
      });
    mutationQueues.set(change.productId, mutation);

    try {
      const snapshot = await mutation;
      if (!snapshot) {
        sendJson(response, 409, {
          error: "Cart changed before the update completed",
        });
        return;
      }
      sendJson(response, 200, snapshot);
    } catch {
      sendJson(response, 500, { error: "Cart update failed" });
    } finally {
      if (mutationQueues.get(change.productId) === mutation)
        mutationQueues.delete(change.productId);
    }
  }

  return createServer(async (request, response) => {
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
    } catch {
      response.writeHead(404).end("Not found");
      return;
    }

    if (pathname === "/api/cart") {
      const generationAtArrival = mutationGeneration;
      await handleCartRequest(request, response, generationAtArrival);
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(404).end("Not found");
      return;
    }

    const requestedPath = pageRoutes.has(pathname.replace(/\/+$/, "") || "/")
      ? "/index.html"
      : pathname;
    const filePath = resolve(siteRoot, `.${requestedPath}`);
    if (filePath !== siteRoot && !filePath.startsWith(`${siteRoot}${sep}`)) {
      response.writeHead(404).end("Not found");
      return;
    }

    try {
      if (!(await stat(filePath)).isFile()) throw new Error("Not a file");
      const content = await readFile(filePath);
      response.writeHead(200, {
        "content-type":
          contentTypes.get(extname(filePath)) ?? "application/octet-stream",
      });
      response.end(request.method === "HEAD" ? undefined : content);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
}

function isValidChange(change, productIds) {
  if (!change || typeof change !== "object") return false;
  if (!productIds.has(change.productId)) return false;
  return (
    change.remove === true ||
    (Number.isInteger(change.delta) && change.delta !== 0)
  );
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  return JSON.parse(body);
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

function wait(delay) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, delay));
}

if (process.argv[1] && resolve(process.argv[1]) === serverFile) {
  createShoppingServer().listen(4173, "127.0.0.1", () => {
    console.log("Shopping site available at http://127.0.0.1:4173");
  });
}
