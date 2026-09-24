/**
 * Restaurant Agent
 */
import { ProviderRegistry } from "../providers/interfaces";
import { RestaurantAgentResult } from "../types/results";
export declare class RestaurantAgent {
    private providers;
    constructor(providers: ProviderRegistry);
    search(rawInput: unknown): Promise<RestaurantAgentResult>;
}
//# sourceMappingURL=restaurant.agent.d.ts.map