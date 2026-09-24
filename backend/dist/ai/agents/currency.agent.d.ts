/**
 * Currency Agent
 */
import { ProviderRegistry } from "../providers/interfaces";
import { CurrencyAgentResult } from "../types/results";
export declare class CurrencyAgent {
    private providers;
    constructor(providers: ProviderRegistry);
    getRate(rawInput: unknown): Promise<CurrencyAgentResult>;
}
//# sourceMappingURL=currency.agent.d.ts.map