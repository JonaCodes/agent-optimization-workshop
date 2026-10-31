import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description:
    "Find lodging options in a destination for a defined check-in and check-out period. Use this to compare available stays by location, nightly price, guest rating, and selected facilities. The response identifies the property, address or area, room offer, total quoted cost when available, included fees, cancellation terms, and the time the price was retrieved. Guest and room counts affect availability and should reflect the requested trip. Optional distance and amenity filters narrow the results; omit them when discovery is still broad. Prices may exclude local taxes or depend on a specific room being available, so preserve the provider’s stated price basis when summarizing. Search results do not reserve a room. If a destination has few matches, increase the radius or remove one amenity filter.",
  inputSchema: z.object({
    destination: z
      .string()
      .min(2)
      .describe("City, neighborhood, landmark, or other lodging search area."),
    checkIn: z
      .string()
      .describe("Local check-in date in ISO YYYY-MM-DD format."),
    checkOut: z
      .string()
      .describe("Local check-out date in ISO YYYY-MM-DD format."),
    guests: z
      .number()
      .int()
      .min(1)
      .max(16)
      .optional()
      .describe("Total number of guests included in availability and prices."),
    rooms: z
      .number()
      .int()
      .min(1)
      .max(8)
      .optional()
      .describe("Number of rooms requested."),
    maximumNightlyPrice: z
      .number()
      .positive()
      .optional()
      .describe("Optional upper nightly price in the selected currency."),
    currency: z
      .string()
      .length(3)
      .optional()
      .describe("ISO 4217 currency code requested for displayed prices."),
    amenities: z
      .array(z.string())
      .max(12)
      .optional()
      .describe(
        "Facilities or features that matching properties should offer.",
      ),
    radiusKm: z
      .number()
      .positive()
      .max(100)
      .optional()
      .describe(
        "Maximum search distance from the destination center, when supported.",
      ),
  }),
  async execute() {
    return serviceUnavailable("travel service", "search stays");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("travel")
    ? { "travel-search_stays": registeredTool }
    : null,
);
