"use strict";
/**
 * Tavily Web Search Adapter
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TavilySearchAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
class TavilySearchAdapter {
    constructor() {
        this.name = "Tavily";
        this.apiKey = process.env.TAVILY_API_KEY;
    }
    async search(input) {
        const retrievedAt = new Date().toISOString();
        try {
            const res = await axios_1.default.post("https://api.tavily.com/search", {
                api_key: this.apiKey,
                query: input.query,
                max_results: input.maxResults ?? 5,
                search_depth: "basic",
            });
            const results = (res.data.results ?? []).map((r) => ({
                title: r.title,
                url: r.url,
                snippet: r.content,
                publishedAt: r.published_date,
            }));
            return {
                available: true,
                label: { dataType: "live", source: "Tavily Search API", retrievedAt },
                query: input.query,
                results,
            };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { available: false, reason: `Tavily error: ${message}`, provider: "Tavily", attemptedAt: retrievedAt };
        }
    }
}
exports.TavilySearchAdapter = TavilySearchAdapter;
//# sourceMappingURL=search.adapter.js.map