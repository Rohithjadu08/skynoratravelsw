"use strict";
/**
 * Google Places Adapter — attractions, restaurants, and directions.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GooglePlacesAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 600 }); // 10-min cache
class GooglePlacesAdapter {
    constructor() {
        this.name = "Google Places";
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    }
    async searchAttractions(input) {
        const cacheKey = `attractions:${input.location}:${input.categories?.join(",")}`;
        const cached = cache.get(cacheKey);
        if (cached)
            return cached;
        const retrievedAt = new Date().toISOString();
        try {
            const types = input.categories?.join("|") ?? "tourist_attraction|museum|park";
            const res = await axios_1.default.get("https://maps.googleapis.com/maps/api/place/textsearch/json", {
                params: { query: `${types} in ${input.location}`, key: this.apiKey, radius: input.radius },
            });
            const results = res.data.results.slice(0, input.maxResults ?? 10);
            const attractions = results.map((p, i) => ({
                id: p.place_id ?? `G-ATT-${i}`,
                label: { dataType: "live", source: "Google Places API", retrievedAt },
                name: p.name,
                category: (p.types[0] ?? "attraction"),
                description: `Popular attraction: ${p.name}`,
                address: p.formatted_address,
                latitude: p.geometry.location.lat,
                longitude: p.geometry.location.lng,
                rating: p.rating,
                reviewCount: p.user_ratings_total,
                openingHours: p.opening_hours?.open_now != null
                    ? (p.opening_hours.open_now ? "Currently open" : "Currently closed")
                    : undefined,
            }));
            const result = {
                available: true,
                label: { dataType: "live", source: "Google Places API", retrievedAt },
                destination: input.location,
                attractions,
            };
            cache.set(cacheKey, result);
            return result;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { available: false, reason: `Google Places error: ${message}`, provider: "Google Places", attemptedAt: retrievedAt };
        }
    }
    async searchRestaurants(input) {
        const cacheKey = `restaurants:${input.location}:${input.cuisine}:${input.dietary?.join(",")}`;
        const cached = cache.get(cacheKey);
        if (cached)
            return cached;
        const retrievedAt = new Date().toISOString();
        try {
            const query = [input.cuisine, "restaurant", input.dietary?.join(" "), "in", input.location].filter(Boolean).join(" ");
            const res = await axios_1.default.get("https://maps.googleapis.com/maps/api/place/textsearch/json", {
                params: { query, key: this.apiKey, radius: input.radius, opennow: input.openNow },
            });
            const restaurants = (res.data.results ?? [])
                .filter((r) => !input.minRating || r.rating >= input.minRating)
                .slice(0, input.maxResults ?? 8)
                .map((r, i) => ({
                id: r.place_id ?? `G-RST-${i}`,
                label: { dataType: "live", source: "Google Places API", retrievedAt },
                name: r.name,
                cuisine: input.cuisine ?? "Various",
                address: r.formatted_address,
                latitude: r.geometry.location.lat,
                longitude: r.geometry.location.lng,
                rating: r.rating,
                reviewCount: r.user_ratings_total,
                priceLevel: r.price_level,
                openNow: r.opening_hours?.open_now,
                dietaryOptions: input.dietary ?? [],
            }));
            const result = {
                available: true,
                label: { dataType: "live", source: "Google Places API", retrievedAt },
                restaurants,
                searchParams: input,
            };
            cache.set(cacheKey, result);
            return result;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { available: false, reason: `Google Places error: ${message}`, provider: "Google Places", attemptedAt: retrievedAt };
        }
    }
    async getDirections(input) {
        const retrievedAt = new Date().toISOString();
        try {
            const res = await axios_1.default.get("https://maps.googleapis.com/maps/api/directions/json", {
                params: {
                    origin: input.from,
                    destination: input.to,
                    mode: input.mode,
                    key: this.apiKey,
                    departure_time: input.departureTime ? new Date(input.departureTime).getTime() / 1000 : "now",
                },
            });
            if (res.data.status !== "OK") {
                return { available: false, reason: `Google Directions: ${res.data.status}`, provider: "Google Directions", attemptedAt: retrievedAt };
            }
            const route = res.data.routes[0];
            const leg = route.legs[0];
            const duration = leg.duration.value;
            const distance = leg.distance.value;
            return {
                available: true,
                label: { dataType: "live", source: "Google Directions API", retrievedAt },
                from: input.from,
                to: input.to,
                options: [{
                        id: `GDIR-${Date.now()}`,
                        label: { dataType: "live", source: "Google Directions API", retrievedAt },
                        mode: input.mode,
                        durationMinutes: Math.round(duration / 60),
                        distanceKm: parseFloat((distance / 1000).toFixed(2)),
                        steps: (leg.steps ?? []).slice(0, 5).map((s) => s.html_instructions.replace(/<[^>]+>/g, "")),
                    }],
            };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { available: false, reason: `Google Directions error: ${message}`, provider: "Google Directions", attemptedAt: retrievedAt };
        }
    }
}
exports.GooglePlacesAdapter = GooglePlacesAdapter;
//# sourceMappingURL=places.adapter.js.map