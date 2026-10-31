export function createCartStore(productIds, initialQuantities = {}) {
  const validIds = new Set(productIds);
  const initialEntries = Object.entries(initialQuantities);
  const quantities = new Map(initialEntries);

  return {
    read() {
      return { quantities: Object.fromEntries(quantities) };
    },

    change(productId, delta) {
      if (!validIds.has(productId) || !Number.isInteger(delta) || delta === 0)
        return false;

      const quantity = Math.max(0, (quantities.get(productId) ?? 0) + delta);
      if (quantity === 0) quantities.delete(productId);
      else quantities.set(productId, quantity);
      return true;
    },

    remove(productId) {
      if (!validIds.has(productId)) return false;
      quantities.delete(productId);
      return true;
    },

    reset() {
      quantities.clear();
      for (const [productId, quantity] of initialEntries)
        quantities.set(productId, quantity);
    },
  };
}
