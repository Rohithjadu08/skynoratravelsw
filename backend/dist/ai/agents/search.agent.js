"use strict";
/**
 * Search Agent — for advisories, visa info, etc.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchAgent = void 0;
const tools_1 = require("../types/tools");
class SearchAgent {
    constructor(providers) {
        this.providers = providers;
    }
    async search(rawInput) {
        const input = tools_1.WebSearchInputSchema.parse(rawInput);
        return this.providers.search.search(input);
    }
}
exports.SearchAgent = SearchAgent;
//# sourceMappingURL=search.agent.js.map