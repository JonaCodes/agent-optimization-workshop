import * as browserTools from "@agent-browser/eve/tools";
import { defineDynamic, defineTool } from "eve/tools";
import { z } from "zod";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import {
  SHOPPING_CART_READER_SCRIPT,
  normalizeShoppingCartReaderResult,
} from "../../lib/browser/shopping-cart.js";

export const shoppingReadCart = defineTool({
  description: "Open Cart and read products, package details, quantities, prices, and total without changing quantities.",
  inputSchema: z.strictObject({}),
  async execute(_input, ctx) {
    await browserTools.open.execute(
      { url: "http://127.0.0.1:4173/cart" },
      ctx,
    );
    const data = await browserTools["eval"].execute(
      { script: SHOPPING_CART_READER_SCRIPT },
      ctx,
    );
    if (data === null || typeof data !== "object" || !("result" in data)) {
      throw new Error("Shopping cart reader returned no browser result.");
    }
    return normalizeShoppingCartReaderResult(data.result);
  },
});

export default defineDynamic(() =>
  isSkillLoaded("grocery-shopping")
    ? { shopping_read_cart: shoppingReadCart }
    : null,
);
