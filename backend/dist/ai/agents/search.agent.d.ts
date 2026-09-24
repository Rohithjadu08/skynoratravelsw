/**
 * Search Agent — for advisories, visa info, etc.
 */
import { ProviderRegistry } from "../providers/interfaces";
import { SearchAgentResult } from "../types/results";
export declare class SearchAgent {
    private providers;
    constructor(providers: ProviderRegistry);
    search(rawInput: unknown): Promise<SearchAgentResult>;
}
//# sourceMappingURL=search.agent.d.ts.map