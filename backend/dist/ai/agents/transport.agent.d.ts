/**
 * Transport Agent
 */
import { ProviderRegistry } from "../providers/interfaces";
import { TransportAgentResult } from "../types/results";
export declare class TransportAgent {
    private providers;
    constructor(providers: ProviderRegistry);
    getDirections(rawInput: unknown): Promise<TransportAgentResult>;
}
//# sourceMappingURL=transport.agent.d.ts.map