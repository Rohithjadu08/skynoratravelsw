"use strict";
/**
 * Zod schemas for all tool inputs and outputs.
 * These are the ONLY way agents communicate with the outside world.
 * Validation is enforced at runtime — no unvalidated data reaches the LLM or the user.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataUnavailableSchema = exports.WebSearchOutputSchema = exports.WebSearchInputSchema = exports.TransportOutputSchema = exports.TransportInputSchema = exports.RestaurantSearchOutputSchema = exports.RestaurantSearchInputSchema = exports.PlacesSearchOutputSchema = exports.PlacesSearchInputSchema = exports.CurrencyOutputSchema = exports.CurrencyInputSchema = exports.WeatherOutputSchema = exports.WeatherInputSchema = exports.HotelSearchOutputSchema = exports.HotelSearchInputSchema = exports.FlightSearchOutputSchema = exports.FlightSearchInputSchema = exports.DataLabelSchema = exports.MoneySchema = void 0;
const zod_1 = require("zod");
// ── Shared primitives ────────────────────────────────────────────────────────
exports.MoneySchema = zod_1.z.object({
    amount: zod_1.z.number().finite(),
    currency: zod_1.z.string().length(3).toUpperCase(), // ISO 4217
});
exports.DataLabelSchema = zod_1.z.object({
    dataType: zod_1.z.enum(["live", "estimated", "ai_recommended"]),
    source: zod_1.z.string().optional(),
    retrievedAt: zod_1.z.string().datetime().optional(),
});
// ── Flight Search Tool ───────────────────────────────────────────────────────
exports.FlightSearchInputSchema = zod_1.z.object({
    origin: zod_1.z.string().min(3).max(3).toUpperCase(), // IATA
    destination: zod_1.z.string().min(3).max(3).toUpperCase(), // IATA
    departureDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
    returnDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    adults: zod_1.z.number().int().min(1).max(9).default(1),
    cabinClass: zod_1.z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]).default("ECONOMY"),
    maxResults: zod_1.z.number().int().min(1).max(20).default(5),
    maxPrice: exports.MoneySchema.optional(),
    nonstopOnly: zod_1.z.boolean().default(false),
});
exports.FlightSearchOutputSchema = zod_1.z.object({
    available: zod_1.z.literal(true),
    label: exports.DataLabelSchema,
    flights: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        label: exports.DataLabelSchema,
        airline: zod_1.z.string(),
        flightNumber: zod_1.z.string(),
        origin: zod_1.z.string(),
        destination: zod_1.z.string(),
        departureAt: zod_1.z.string().datetime(),
        arrivalAt: zod_1.z.string().datetime(),
        durationMinutes: zod_1.z.number().int().positive(),
        stops: zod_1.z.number().int().min(0),
        price: exports.MoneySchema,
        cabinClass: zod_1.z.string(),
        seatsAvailable: zod_1.z.number().int().min(0).optional(),
    })),
    searchParams: exports.FlightSearchInputSchema,
});
// ── Hotel Search Tool ────────────────────────────────────────────────────────
exports.HotelSearchInputSchema = zod_1.z.object({
    cityCode: zod_1.z.string().min(3).max(3).toUpperCase(), // IATA city code
    checkIn: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOut: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    adults: zod_1.z.number().int().min(1).max(8).default(1),
    rooms: zod_1.z.number().int().min(1).max(5).default(1),
    minStars: zod_1.z.number().int().min(1).max(5).optional(),
    maxPricePerNight: exports.MoneySchema.optional(),
    maxResults: zod_1.z.number().int().min(1).max(20).default(5),
});
exports.HotelSearchOutputSchema = zod_1.z.object({
    available: zod_1.z.literal(true),
    label: exports.DataLabelSchema,
    hotels: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        label: exports.DataLabelSchema,
        name: zod_1.z.string(),
        address: zod_1.z.string(),
        stars: zod_1.z.number().int().min(1).max(5),
        rating: zod_1.z.number().min(0).max(10).optional(),
        pricePerNight: exports.MoneySchema,
        totalPrice: exports.MoneySchema,
        amenities: zod_1.z.array(zod_1.z.string()).optional(),
    })),
    searchParams: exports.HotelSearchInputSchema,
});
// ── Weather Tool ─────────────────────────────────────────────────────────────
exports.WeatherInputSchema = zod_1.z.object({
    location: zod_1.z.string().min(2), // city name or lat,lon
    startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    units: zod_1.z.enum(["metric", "imperial"]).default("metric"),
});
exports.WeatherOutputSchema = zod_1.z.object({
    available: zod_1.z.literal(true),
    label: exports.DataLabelSchema,
    location: zod_1.z.string(),
    forecast: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.string(),
        minTemp: zod_1.z.number(),
        maxTemp: zod_1.z.number(),
        unit: zod_1.z.enum(["C", "F"]),
        condition: zod_1.z.string(),
        precipitationChance: zod_1.z.number().min(0).max(100),
        humidity: zod_1.z.number().min(0).max(100),
        icon: zod_1.z.string(),
    })),
});
// ── Currency Tool ─────────────────────────────────────────────────────────────
exports.CurrencyInputSchema = zod_1.z.object({
    fromCurrency: zod_1.z.string().length(3).toUpperCase(),
    toCurrency: zod_1.z.string().length(3).toUpperCase(),
    amount: zod_1.z.number().positive().optional(),
});
exports.CurrencyOutputSchema = zod_1.z.object({
    available: zod_1.z.literal(true),
    label: exports.DataLabelSchema,
    fromCurrency: zod_1.z.string(),
    toCurrency: zod_1.z.string(),
    rate: zod_1.z.number().positive(),
    convertedAmount: zod_1.z.number().optional(),
    rateDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
// ── Places / Attractions Tool ─────────────────────────────────────────────────
exports.PlacesSearchInputSchema = zod_1.z.object({
    location: zod_1.z.string().min(2),
    categories: zod_1.z.array(zod_1.z.string()).optional(), // e.g. ["museum", "temple", "park"]
    radius: zod_1.z.number().int().min(100).max(50000).default(5000), // metres
    maxResults: zod_1.z.number().int().min(1).max(20).default(10),
    openNow: zod_1.z.boolean().optional(),
});
exports.PlacesSearchOutputSchema = zod_1.z.object({
    available: zod_1.z.literal(true),
    label: exports.DataLabelSchema,
    places: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        label: exports.DataLabelSchema,
        name: zod_1.z.string(),
        category: zod_1.z.string(),
        address: zod_1.z.string(),
        latitude: zod_1.z.number().optional(),
        longitude: zod_1.z.number().optional(),
        rating: zod_1.z.number().min(0).max(5).optional(),
        reviewCount: zod_1.z.number().int().optional(),
        openNow: zod_1.z.boolean().optional(),
        photoUrl: zod_1.z.string().url().optional(),
    })),
});
// ── Restaurant Search Tool ────────────────────────────────────────────────────
exports.RestaurantSearchInputSchema = zod_1.z.object({
    location: zod_1.z.string().min(2),
    cuisine: zod_1.z.string().optional(),
    dietary: zod_1.z.array(zod_1.z.string()).optional(), // e.g. ["vegetarian", "vegan", "halal"]
    radius: zod_1.z.number().int().min(100).max(10000).default(2000),
    maxResults: zod_1.z.number().int().min(1).max(20).default(8),
    openNow: zod_1.z.boolean().optional(),
    minRating: zod_1.z.number().min(1).max(5).optional(),
});
exports.RestaurantSearchOutputSchema = zod_1.z.object({
    available: zod_1.z.literal(true),
    label: exports.DataLabelSchema,
    restaurants: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        label: exports.DataLabelSchema,
        name: zod_1.z.string(),
        cuisine: zod_1.z.string(),
        address: zod_1.z.string(),
        rating: zod_1.z.number().min(0).max(5).optional(),
        priceLevel: zod_1.z.number().int().min(1).max(4).optional(),
        openNow: zod_1.z.boolean().optional(),
        dietaryOptions: zod_1.z.array(zod_1.z.string()).optional(),
    })),
    searchParams: exports.RestaurantSearchInputSchema,
});
// ── Transport Tool ────────────────────────────────────────────────────────────
exports.TransportInputSchema = zod_1.z.object({
    from: zod_1.z.string().min(2),
    to: zod_1.z.string().min(2),
    mode: zod_1.z.enum(["transit", "driving", "walking", "bicycling"]).default("transit"),
    departureTime: zod_1.z.string().datetime().optional(),
});
exports.TransportOutputSchema = zod_1.z.object({
    available: zod_1.z.literal(true),
    label: exports.DataLabelSchema,
    from: zod_1.z.string(),
    to: zod_1.z.string(),
    options: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        label: exports.DataLabelSchema,
        mode: zod_1.z.string(),
        durationMinutes: zod_1.z.number().int().positive(),
        distanceKm: zod_1.z.number().positive(),
        cost: exports.MoneySchema.optional(),
        steps: zod_1.z.array(zod_1.z.string()).optional(),
    })),
});
// ── Web Search Tool (advisories, visa, etc.) ──────────────────────────────────
exports.WebSearchInputSchema = zod_1.z.object({
    query: zod_1.z.string().min(3).max(200),
    maxResults: zod_1.z.number().int().min(1).max(10).default(5),
});
exports.WebSearchOutputSchema = zod_1.z.object({
    available: zod_1.z.literal(true),
    label: exports.DataLabelSchema,
    query: zod_1.z.string(),
    results: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        url: zod_1.z.string().url(),
        snippet: zod_1.z.string(),
        publishedAt: zod_1.z.string().optional(),
    })),
});
// ── DataUnavailable schema (shared) ──────────────────────────────────────────
exports.DataUnavailableSchema = zod_1.z.object({
    available: zod_1.z.literal(false),
    reason: zod_1.z.string(),
    provider: zod_1.z.string().optional(),
    attemptedAt: zod_1.z.string().datetime(),
});
//# sourceMappingURL=tools.js.map