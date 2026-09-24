/**
 * Budget Agent — uses Calculation Engine (no LLM math).
 */
import { ProviderRegistry } from "../providers/interfaces";
import { BudgetAgentResult } from "../types/results";
import { Money } from "../types/trip";
export interface BudgetInput {
    totalBudget: Money;
    flightsCost: Money;
    hotelsCost: Money;
    foodCost: Money;
    transportCost: Money;
    activitiesCost: Money;
    miscCost: Money;
    totalDays: number;
    adults: number;
}
export declare class BudgetAgent {
    private _providers;
    constructor(_providers: ProviderRegistry);
    calculate(input: BudgetInput): BudgetAgentResult;
}
//# sourceMappingURL=budget.agent.d.ts.map