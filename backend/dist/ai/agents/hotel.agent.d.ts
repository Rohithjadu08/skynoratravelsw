/**
 * Hotel Agent
 */
import { ProviderRegistry } from "../providers/interfaces";
import { HotelResult } from "../types/results";
export declare class HotelAgent {
    private providers;
    constructor(providers: ProviderRegistry);
    search(rawInput: unknown): Promise<HotelResult>;
}
//# sourceMappingURL=hotel.agent.d.ts.map