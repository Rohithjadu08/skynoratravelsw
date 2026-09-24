"use strict";
/**
 * Amadeus Flight Adapter — real implementation.
 * Only loaded when AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET are set.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmadeusFlightAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 300 }); // 5-minute cache
class AmadeusFlightAdapter {
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
    async searchFlights(input) {
        const cacheKey = `flight:${JSON.stringify(input)}`;
        const cached = cache.get(cacheKey);
        if (cached)
            return cached;
        const retrievedAt = new Date().toISOString();
        try {
            const token = await this.getAccessToken();
            const params = {
                originLocationCode: input.origin,
                destinationLocationCode: input.destination,
                departureDate: input.departureDate,
                adults: String(input.adults),
                travelClass: input.cabinClass,
                max: String(input.maxResults ?? 5),
                currencyCode: "INR",
            };
            if (input.returnDate)
                params.returnDate = input.returnDate;
            if (input.nonstopOnly)
                params.nonStop = "true";
            const res = await axios_1.default.get(`${this.baseUrl}/v2/shopping/flight-offers`, {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            const offers = (res.data.data ?? []).slice(0, input.maxResults ?? 5);
            const flights = offers.map((offer, i) => {
                const itin = offer.itineraries[0];
                const segments = itin.segments;
                const first = segments[0];
                const last = segments[segments.length - 1];
                const price = offer.price;
                return {
                    id: offer.id,
                    label: { dataType: "live", source: "Amadeus API", retrievedAt },
                    airline: first.carrierCode,
                    flightNumber: `${first.carrierCode}${first.number}`,
                    origin: first.departure.iataCode,
                    destination: last.arrival.iataCode,
                    departureAt: first.departure.at,
                    arrivalAt: last.arrival.at,
                    durationMinutes: parseDuration(itin.duration),
                    stops: segments.length - 1,
                    price: { amount: parseFloat(price.grandTotal), currency: price.currency },
                    cabinClass: input.cabinClass,
                    seatsAvailable: offer.numberOfBookableSeats,
                };
            });
            const result = {
                available: true,
                label: { dataType: "live", source: "Amadeus API", retrievedAt },
                flights,
                searchParams: input,
            };
            cache.set(cacheKey, result);
            return result;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return {
                available: false,
                reason: `Amadeus API error: ${message}`,
                provider: "Amadeus",
                attemptedAt: retrievedAt,
            };
        }
    }
}
exports.AmadeusFlightAdapter = AmadeusFlightAdapter;
function parseDuration(iso) {
    // PT2H30M → 150 minutes
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match)
        return 0;
    return (parseInt(match[1] ?? "0") * 60) + parseInt(match[2] ?? "0");
}
//# sourceMappingURL=flight.adapter.js.map