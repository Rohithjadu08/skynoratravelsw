"use strict";
/**
 * Currency Agent
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyAgent = void 0;
const tools_1 = require("../types/tools");
class CurrencyAgent {
    constructor(providers) {
        this.providers = providers;
    }
    async getRate(rawInput) {
        const input = tools_1.CurrencyInputSchema.parse(rawInput);
        return this.providers.currency.getRate(input);
    }
}
exports.CurrencyAgent = CurrencyAgent;
//# sourceMappingURL=currency.agent.js.map