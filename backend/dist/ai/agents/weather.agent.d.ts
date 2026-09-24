/**
 * Weather Agent
 */
import { ProviderRegistry } from "../providers/interfaces";
import { WeatherAgentResult } from "../types/results";
export declare class WeatherAgent {
    private providers;
    constructor(providers: ProviderRegistry);
    getForecast(rawInput: unknown): Promise<WeatherAgentResult>;
}
//# sourceMappingURL=weather.agent.d.ts.map