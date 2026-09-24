"use strict";
/**
 * Transport Agent
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportAgent = void 0;
const tools_1 = require("../types/tools");
class TransportAgent {
    constructor(providers) {
        this.providers = providers;
    }
    async getDirections(rawInput) {
        const input = tools_1.TransportInputSchema.parse(rawInput);
        return this.providers.places.getDirections(input);
    }
}
exports.TransportAgent = TransportAgent;
//# sourceMappingURL=transport.agent.js.map