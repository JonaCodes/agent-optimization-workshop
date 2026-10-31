const OUT_OF_STOCK_PRODUCT_IDS = new Set(["spinach-baby-5", "water-lime-8"]);

export function isProductAvailable(productId) {
  return !OUT_OF_STOCK_PRODUCT_IDS.has(productId);
}
