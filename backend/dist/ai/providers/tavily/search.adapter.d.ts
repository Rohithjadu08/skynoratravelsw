/**
 * Tavily Web Search Adapter
 */
import { SearchProvider } from "../interfaces";
import { SearchAgentResult } from "../../types/results";
import { WebSearchInput } from "../../types/tools";
export declare class TavilySearchAdapter implements SearchProvider {
    readonly name = "Tavily";
    private apiKey;
    constructor();
    search(input: WebSearchInput): Promise<SearchAgentResult>;
}
//# sourceMappingURL=search.adapter.d.ts.map