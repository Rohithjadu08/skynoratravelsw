/**
 * ExchangeRates.host Currency Adapter
 */
import { CurrencyProvider } from "../interfaces";
import { CurrencyAgentResult } from "../../types/results";
import { CurrencyInput } from "../../types/tools";
export declare class ExchangeRatesAdapter implements CurrencyProvider {
    readonly name = "ExchangeRates.host";
    private apiKey;
    constructor();
    getRate(input: CurrencyInput): Promise<CurrencyAgentResult>;
}
//# sourceMappingURL=currency.adapter.d.ts.map