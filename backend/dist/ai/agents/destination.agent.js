"use strict";
/**
 * Destination / Attraction Agent
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationAgent = void 0;
const tools_1 = require("../types/tools");
class DestinationAgent {
    constructor(providers) {
        this.providers = providers;
    }
    async searchAttractions(rawInput) {
        const input = tools_1.PlacesSearchInputSchema.parse(rawInput);
        return this.providers.places.searchAttractions(input);
    }
}
exports.DestinationAgent = DestinationAgent;
//# sourceMappingURL=destination.agent.js.map