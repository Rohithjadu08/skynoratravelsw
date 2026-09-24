/**
 * Flight Agent — searches for flights using FlightProvider.
 * Never invents prices or schedules. Returns FlightResult with provenance.
 */
import { ProviderRegistry } from "../providers/interfaces";
import { FlightResult } from "../types/results";
import { FlightSearchInput } from "../types/tools";
export declare class FlightAgent {
    private providers;
    constructor(providers: ProviderRegistry);
    search(rawInput: unknown): Promise<FlightResult>;
    searchWithFallback(input: FlightSearchInput): Promise<FlightResult>;
}
//# sourceMappingURL=flight.agent.d.ts.map