export const ACTIVE_SCENARIO = "happy";

const FAVORITES = {
  happy: [
    "oats-organic-1000",
    "oats-organic-750",
    "milk-two-2000",
    "almond-unsweet-750",
    "milk-whole-1000",
    "almond-sweet-1000",
    "soy-unsweet-1000",
    "oats-quick-1000",
    "milk-skim-1000",
    "milk-lactose-1000",
    "oat-unsweet-1000",
    "eggs-free-6",
    "eggs-cage-12",
    "bread-white-700",
    "bread-sourdough-500",
    "pasta-penne-1000",
    "olive-light-500",
    "water-lime-8",
    "bananas-6",
    "milk-two-1000",
    "almond-unsweet-1000",
    "eggs-free-12",
    "bread-whole-700",
    "pasta-penne-500",
    "olive-evoo-500",
  ],
  partial: [
    "milk-whole-1000",
    "bananas-6",
    "oats-quick-1000",
    "almond-unsweet-750",
    "eggs-cage-12",
    "apples-3lb",
    "oats-organic-750",
    "soy-unsweet-1000",
    "pasta-penne-1000",
    "spinach-baby-5",
    "eggs-free-12",
    "milk-skim-1000",
    "pasta-whole-500",
    "olive-evoo-500",
    "yogurt-greek-32",
    "milk-two-2000",
    "almond-sweet-1000",
    "pasta-spaghetti-500",
    "rice-jasmine-2lb",
    "pasta-penne-500",
    "oat-unsweet-1000",
    "eggs-free-6",
    "olive-evoo-1000",
    "olive-light-500",
    "milk-lactose-1000",
  ],
};

export function getScenarioState(name = ACTIVE_SCENARIO) {
  const favoriteIds = FAVORITES[name === "in-process" ? "happy" : name];
  if (!favoriteIds) throw new Error(`Unknown scenario: ${name}`);
  return {
    favoriteIds: [...favoriteIds],
    initialQuantities:
      name === "in-process"
        ? {
            "oats-organic-1000": 1,
            "milk-two-1000": 1,
            "pasta-penne-500": 1,
          }
        : {},
  };
}
