import * as browserTools from "@agent-browser/eve/tools";
import { defineDynamic, defineTool } from "eve/tools";
import { z } from "zod";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import {
  SHOPPING_PRODUCT_READER_SCRIPT,
  normalizeShoppingProductReaderResult,
} from "../../lib/browser/shopping-products.js";

// Use the public executor to share the configured browser session and bridge.
export const shoppingReadProducts = defineTool({
  description:
    "Open Favorites and read available products, current quantities, and +/- selectors without changing the cart.",
  inputSchema: z.strictObject({}),
  async execute(_input, ctx) {
    await browserTools.open.execute(
      { url: "http://127.0.0.1:4173/favorites" },
      ctx,
    );
    const data = await browserTools["eval"].execute(
      { script: SHOPPING_PRODUCT_READER_SCRIPT },
      ctx,
    );
    if (data === null || typeof data !== "object" || !("result" in data)) {
      throw new Error("Shopping product reader returned no browser result.");
    }
    return normalizeShoppingProductReaderResult(data.result);
  },
});

export default defineDynamic(() =>
  isSkillLoaded("grocery-shopping")
    ? { shopping_read_products: shoppingReadProducts }
    : null,
);
