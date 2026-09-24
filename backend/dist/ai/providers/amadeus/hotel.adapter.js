"use strict";
/**
 * Amadeus Hotel Adapter — real implementation.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmadeusHotelAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 300 });
class AmadeusHotelAdapter {
    constructor() {
        this.name = "Amadeus";
        this.accessToken = null;
        this.tokenExpiresAt = 0;
        this.clientId = process.env.AMADEUS_CLIENT_ID;
        this.clientSecret = process.env.AMADEUS_CLIENT_SECRET;
        this.baseUrl =
            process.env.AMADEUS_ENV === "production"
                ? "https://api.amadeus.com"
                : "https://test.api.amadeus.com";
    }
    async getAccessToken() {
        if (this.accessToken && Date.now() < this.tokenExpiresAt - 30000) {
            return this.accessToken;
        }
        const res = await axios_1.default.post(`${this.baseUrl}/v1/security/oauth2/token`, new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.clientId,
            client_secret: this.clientSecret,
        }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        this.accessToken = res.data.access_token;
        this.tokenExpiresAt = Date.now() + res.data.expires_in * 1000;
        return this.accessToken;
    }
    async searchHotels(input) {
        const cacheKey = `hotel:${JSON.stringify(input)}`;
        const cached = cache.get(cacheKey);
        if (cached)
            return cached;
        const retrievedAt = new Date().toISOString();
        try {
            const token = await this.getAccessToken();
            // Step 1: Get hotel IDs by city
            const listRes = await axios_1.default.get(`${this.baseUrl}/v1/reference-data/locations/hotels/by-city`, {
                params: { cityCode: input.cityCode, ratings: input.minStars, hotelSource: "ALL" },
                headers: { Authorization: `Bearer ${token}` },
            });
            const hotelIds = (listRes.data.data ?? [])
                .slice(0, 20)
                .map((h) => h.hotelId)
                .join(",");
            if (!hotelIds) {
                return { available: false, reason: "No hotels found for city code", provider: "Amadeus", attemptedAt: retrievedAt };
            }
            // Step 2: Get offers for those hotels
            const offersRes = await axios_1.default.get(`${this.baseUrl}/v3/shopping/hotel-offers`, {
                params: {
                    hotelIds,
                    checkInDate: input.checkIn,
                    checkOutDate: input.checkOut,
                    adults: input.adults,
                    roomQuantity: input.rooms,
                    currency: "INR",
                    bestRateOnly: true,
                },
                headers: { Authorization: `Bearer ${token}` },
            });
            const nights = Math.max(1, Math.round((new Date(input.checkOut).getTime() - new Date(input.checkIn).getTime()) / 86400000));
            const hotels = (offersRes.data.data ?? [])
                .slice(0, input.maxResults ?? 5)
                .map((h, i) => {
                const hotel = h.hotel;
                const offer = (h.offers[0]);
                const price = offer.price;
                const pricePerNight = parseFloat(price.base) / nights;
                return {
                    id: hotel.hotelId ?? `HT-${i}`,
                    label: { dataType: "live", source: "Amadeus API", retrievedAt },
                    name: hotel.name,
                    address: hotel.address?.lines?.join(", ") ?? "",
                    stars: parseInt(String(hotel.rating ?? "3")),
                    rating: undefined,
                    pricePerNight: { amount: parseFloat(pricePerNight.toFixed(2)), currency: "INR" },
                    totalPrice: { amount: parseFloat(price.total), currency: "INR" },
                    amenities: hotel.amenities ?? [],
                };
            });
            const result = {
                available: true,
                label: { dataType: "live", source: "Amadeus API", retrievedAt },
                hotels,
                searchParams: input,
            };
            cache.set(cacheKey, result);
            return result;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { available: false, reason: `Amadeus API error: ${message}`, provider: "Amadeus", attemptedAt: retrievedAt };
        }
    }
}
exports.AmadeusHotelAdapter = AmadeusHotelAdapter;
//# sourceMappingURL=hotel.adapter.js.map