"use strict";
/**
 * Mock Currency Provider
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockCurrencyProvider = void 0;
// Approximate static rates for mock purposes only — NEVER used in production
const MOCK_RATES = {
    INR: { KRW: 16.2, USD: 0.012, EUR: 0.011, JPY: 1.78, THB: 0.42, SGD: 0.016 },
    USD: { INR: 83.5, KRW: 1350, EUR: 0.92, JPY: 149.5, THB: 35.2, SGD: 1.35 },
    KRW: { INR: 0.062, USD: 0.00074, EUR: 0.00068 },
    EUR: { INR: 90.1, USD: 1.09, KRW: 1470 },
};
class MockCurrencyProvider {
    constructor() {
        this.name = "MockCurrencyProvider";
    }
    async getRate(input) {
        await new Promise((r) => setTimeout(r, 80));
        const retrievedAt = new Date().toISOString();
        const today = new Date().toISOString().split("T")[0];
        const rate = MOCK_RATES[input.fromCurrency]?.[input.toCurrency];
        if (!rate) {
            return {
                available: false,
                reason: `Mock does not have rate for ${input.fromCurrency} → ${input.toCurrency}`,
                provider: "MockCurrencyProvider",
                attemptedAt: retrievedAt,
            };
        }
        return {
            available: true,
            label: {
                dataType: "live",
                source: "MockCurrencyProvider (sandbox — not live rates)",
                retrievedAt,
            },
            fromCurrency: input.fromCurrency,
            toCurrency: input.toCurrency,
            rate,
            convertedAmount: input.amount != null ? parseFloat((input.amount * rate).toFixed(2)) : undefined,
            rateDate: today,
        };
    }
}
exports.MockCurrencyProvider = MockCurrencyProvider;
//# sourceMappingURL=currency.mock.js.map