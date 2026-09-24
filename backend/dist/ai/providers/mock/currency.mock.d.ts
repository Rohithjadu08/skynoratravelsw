/**
 * Mock Currency Provider
 */
import { CurrencyProvider } from "../interfaces";
import { CurrencyAgentResult } from "../../types/results";
import { CurrencyInput } from "../../types/tools";
export declare class MockCurrencyProvider implements CurrencyProvider {
    readonly name = "MockCurrencyProvider";
    getRate(input: CurrencyInput): Promise<CurrencyAgentResult>;
}
//# sourceMappingURL=currency.mock.d.ts.map