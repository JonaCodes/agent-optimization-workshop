import products from "./products.json" with { type: "json" };

export const PRODUCTS = products;
export const PRODUCTS_BY_ID = new Map(PRODUCTS.map((product) => [product.id, product]));
