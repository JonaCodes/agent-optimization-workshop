export const MUTATION_DELAY_SCHEDULE_MS = Object.freeze([
  950, 1050, 850, 1200, 900, 5800, 1000, 1100,
]);

export function nextQuantity(currentQuantity, change) {
  return Math.max(0, currentQuantity + change);
}

export function mutationDelayAt(mutationNumber) {
  const index =
    ((mutationNumber % MUTATION_DELAY_SCHEDULE_MS.length) +
      MUTATION_DELAY_SCHEDULE_MS.length) %
    MUTATION_DELAY_SCHEDULE_MS.length;
  return MUTATION_DELAY_SCHEDULE_MS[index];
}

export function calculateCart(quantities, products) {
  const lines = [];
  let totalCents = 0;

  for (const product of products) {
    const quantity = quantities.get(product.id) ?? 0;
    if (quantity <= 0) continue;

    const lineTotalCents = product.priceCents * quantity;
    lines.push({
      productId: product.id,
      quantity,
      unitPriceCents: product.priceCents,
      lineTotalCents,
    });
    totalCents += lineTotalCents;
  }

  return { lines, totalCents };
}
