"use strict";
/**
 * Restaurant Agent
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantAgent = void 0;
const tools_1 = require("../types/tools");
class RestaurantAgent {
    constructor(providers) {
        this.providers = providers;
    }
    async search(rawInput) {
        const input = tools_1.RestaurantSearchInputSchema.parse(rawInput);
        return this.providers.places.searchRestaurants(input);
    }
}
exports.RestaurantAgent = RestaurantAgent;
//# sourceMappingURL=restaurant.agent.js.map