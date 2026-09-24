"use strict";
/**
 * ExchangeRates.host Currency Adapter
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRatesAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 3600 }); // 60-min cache
class ExchangeRatesAdapter {
    constructor() {
        this.name = "ExchangeRates.host";
        this.apiKey = process.env.EXCHANGE_RATES_API_KEY;
    }
    async getRate(input) {
        const cacheKey = `fx:${input.fromCurrency}:${input.toCurrency}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            // Return cached result but flag it
            if (cached.available) {
                return { ...cached, label: { ...(cached.label), dataType: "estimated" } };
            }
            return cached;
        }
        const retrievedAt = new Date().toISOString();
        const today = new Date().toISOString().split("T")[0];
        try {
            const res = await axios_1.default.get("https://api.exchangerate.host/latest", {
                params: {
                    access_key: this.apiKey,
                    base: input.fromCurrency,
                    symbols: input.toCurrency,
                },
            });
            if (!res.data.success) {
                return { available: false, reason: "ExchangeRates.host returned failure", provider: "ExchangeRates.host", attemptedAt: retrievedAt };
            }
            const rate = res.data.rates[input.toCurrency];
            if (!rate) {
                return { available: false, reason: `No rate found for ${input.toCurrency}`, provider: "ExchangeRates.host", attemptedAt: retrievedAt };
            }
            const result = {
                available: true,
                label: { dataType: "live", source: "ExchangeRates.host API", retrievedAt },
                fromCurrency: input.fromCurrency,
                toCurrency: input.toCurrency,
                rate,
                convertedAmount: input.amount != null ? parseFloat((input.amount * rate).toFixed(2)) : undefined,
                rateDate: today,
            };
            cache.set(cacheKey, result);
            return result;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { available: false, reason: `ExchangeRates error: ${message}`, provider: "ExchangeRates.host", attemptedAt: retrievedAt };
        }
    }
}
exports.ExchangeRatesAdapter = ExchangeRatesAdapter;
//# sourceMappingURL=currency.adapter.js.map