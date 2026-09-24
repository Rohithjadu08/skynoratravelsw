"use strict";
/**
 * Hotel Agent
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelAgent = void 0;
const tools_1 = require("../types/tools");
class HotelAgent {
    constructor(providers) {
        this.providers = providers;
    }
    async search(rawInput) {
        const input = tools_1.HotelSearchInputSchema.parse(rawInput);
        const result = await this.providers.hotels.searchHotels(input);
        if (result.available) {
            // Sort by price ascending by default
            result.hotels.sort((a, b) => a.pricePerNight.amount - b.pricePerNight.amount);
        }
        return result;
    }
}
exports.HotelAgent = HotelAgent;
//# sourceMappingURL=hotel.agent.js.map