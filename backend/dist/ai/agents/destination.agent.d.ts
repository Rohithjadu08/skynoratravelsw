/**
 * Destination / Attraction Agent
 */
import { ProviderRegistry } from "../providers/interfaces";
import { DestinationAgentResult } from "../types/results";
export declare class DestinationAgent {
    private providers;
    constructor(providers: ProviderRegistry);
    searchAttractions(rawInput: unknown): Promise<DestinationAgentResult>;
}
//# sourceMappingURL=destination.agent.d.ts.map