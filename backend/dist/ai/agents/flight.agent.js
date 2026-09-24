"use strict";
/**
 * Flight Agent — searches for flights using FlightProvider.
 * Never invents prices or schedules. Returns FlightResult with provenance.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightAgent = void 0;
const tools_1 = require("../types/tools");
class FlightAgent {
    constructor(providers) {
        this.providers = providers;
    }
    async search(rawInput) {
        // Validate input with Zod — no unvalidated data reaches the provider
        const input = tools_1.FlightSearchInputSchema.parse(rawInput);
        return this.providers.flights.searchFlights(input);
    }
    async searchWithFallback(input) {
        const validated = tools_1.FlightSearchInputSchema.parse(input);
        const result = await this.providers.flights.searchFlights(validated);
        // If available, sort by price ascending
        if (result.available) {
            result.flights.sort((a, b) => a.price.amount - b.price.amount);
        }
        return result;
    }
}
exports.FlightAgent = FlightAgent;
//# sourceMappingURL=flight.agent.js.map