"use strict";
/**
 * Budget Agent — uses Calculation Engine (no LLM math).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetAgent = void 0;
const calculator_1 = require("../engine/calculator");
class BudgetAgent {
    constructor(_providers) {
        this._providers = _providers;
    }
    calculate(input) {
        const label = {
            dataType: "estimated",
            source: "Calculation Engine",
            retrievedAt: new Date().toISOString(),
        };
        try {
            const summary = (0, calculator_1.buildBudgetSummary)({ ...input, label });
            const warnings = (0, calculator_1.checkBudgetOverruns)([
                { category: "Flights", amount: input.flightsCost, budget: { amount: input.totalBudget.amount * 0.4, currency: input.totalBudget.currency } },
                { category: "Hotels", amount: input.hotelsCost, budget: { amount: input.totalBudget.amount * 0.3, currency: input.totalBudget.currency } },
            ]);
            return {
                available: true,
                label,
                totalBudget: summary.totalBudget,
                breakdown: summary.breakdown,
                totalEstimated: summary.totalSpent,
                remaining: summary.remaining,
                perPersonPerDay: summary.perPersonPerDay,
                warnings,
            };
        }
        catch (err) {
            return {
                available: false,
                reason: err instanceof Error ? err.message : "Budget calculation failed",
                provider: "CalculationEngine",
                attemptedAt: new Date().toISOString(),
            };
        }
    }
}
exports.BudgetAgent = BudgetAgent;
//# sourceMappingURL=budget.agent.js.map