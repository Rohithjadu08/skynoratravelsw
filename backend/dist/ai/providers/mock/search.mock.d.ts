/**
 * Mock Web Search Provider — for advisories, visa, opening hours edge cases.
 */
import { SearchProvider } from "../interfaces";
import { SearchAgentResult } from "../../types/results";
import { WebSearchInput } from "../../types/tools";
export declare class MockSearchProvider implements SearchProvider {
    readonly name = "MockSearchProvider";
    search(input: WebSearchInput): Promise<SearchAgentResult>;
}
//# sourceMappingURL=search.mock.d.ts.map