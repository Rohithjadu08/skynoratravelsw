"use strict";
/**
 * Calculation Engine — Vitest Unit Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const calculator_1 = require("./calculator");
(0, vitest_1.describe)("convertCurrency", () => {
    (0, vitest_1.it)("converts INR to KRW", () => {
        const result = (0, calculator_1.convertCurrency)({ amount: 100000, currency: "INR" }, "KRW", 16.2);
        (0, vitest_1.expect)(result.amount).toBe(1620000);
        (0, vitest_1.expect)(result.currency).toBe("KRW");
    });
    (0, vitest_1.it)("returns same if already target currency", () => {
        const m = { amount: 5000, currency: "INR" };
        (0, vitest_1.expect)((0, calculator_1.convertCurrency)(m, "INR", 1)).toEqual(m);
    });
});
(0, vitest_1.describe)("sumMoney", () => {
    (0, vitest_1.it)("sums same-currency amounts", () => {
        const amounts = [
            { amount: 10000, currency: "INR" },
            { amount: 5000, currency: "INR" },
            { amount: 3000, currency: "INR" },
        ];
        (0, vitest_1.expect)((0, calculator_1.sumMoney)(amounts, "INR")).toEqual({ amount: 18000, currency: "INR" });
    });
    (0, vitest_1.it)("converts and sums mixed currencies", () => {
        const amounts = [
            { amount: 100, currency: "USD" },
            { amount: 50000, currency: "INR" },
        ];
        const rates = { "USD:INR": 83.5 };
        const result = (0, calculator_1.sumMoney)(amounts, "INR", rates);
        (0, vitest_1.expect)(result.amount).toBeCloseTo(58350, 0);
        (0, vitest_1.expect)(result.currency).toBe("INR");
    });
    (0, vitest_1.it)("throws when rate is missing", () => {
        const amounts = [
            { amount: 100, currency: "USD" },
            { amount: 50000, currency: "INR" },
        ];
        (0, vitest_1.expect)(() => (0, calculator_1.sumMoney)(amounts, "INR", {})).toThrow("No exchange rate");
    });
});
(0, vitest_1.describe)("addMoney", () => {
    (0, vitest_1.it)("adds two same-currency values", () => {
        (0, vitest_1.expect)((0, calculator_1.addMoney)({ amount: 100, currency: "INR" }, { amount: 200, currency: "INR" })).toEqual({ amount: 300, currency: "INR" });
    });
    (0, vitest_1.it)("throws on currency mismatch", () => {
        (0, vitest_1.expect)(() => (0, calculator_1.addMoney)({ amount: 100, currency: "INR" }, { amount: 100, currency: "USD" })).toThrow("Currency mismatch");
    });
});
(0, vitest_1.describe)("subtractMoney", () => {
    (0, vitest_1.it)("calculates remaining budget", () => {
        const budget = { amount: 100000, currency: "INR" };
        const spent = { amount: 35000, currency: "INR" };
        (0, vitest_1.expect)((0, calculator_1.subtractMoney)(budget, spent)).toEqual({ amount: 65000, currency: "INR" });
    });
    (0, vitest_1.it)("returns negative when over budget", () => {
        const result = (0, calculator_1.subtractMoney)({ amount: 1000, currency: "INR" }, { amount: 1500, currency: "INR" });
        (0, vitest_1.expect)(result.amount).toBe(-500);
    });
});
(0, vitest_1.describe)("multiplyMoney", () => {
    (0, vitest_1.it)("multiplies amount by factor", () => {
        (0, vitest_1.expect)((0, calculator_1.multiplyMoney)({ amount: 5000, currency: "INR" }, 3)).toEqual({ amount: 15000, currency: "INR" });
    });
    (0, vitest_1.it)("rounds to 2 decimal places", () => {
        const result = (0, calculator_1.multiplyMoney)({ amount: 100, currency: "USD" }, 3.333);
        (0, vitest_1.expect)(result.amount).toBe(333.3);
    });
});
(0, vitest_1.describe)("calcFlightCost", () => {
    const mockFlight = (price, currency = "INR") => ({
        id: "F1", label: { dataType: "live" }, airline: "AI",
        flightNumber: "AI101", origin: "MAA", destination: "ICN",
        departureAt: "2025-01-01T06:00:00Z", arrivalAt: "2025-01-01T14:00:00Z",
        durationMinutes: 480, stops: 0, price: { amount: price, currency },
        cabinClass: "economy",
    });
    (0, vitest_1.it)("calculates total flight cost for 2 adults", () => {
        const result = (0, calculator_1.calcFlightCost)([mockFlight(20000)], 2);
        (0, vitest_1.expect)(result.amount).toBe(40000);
    });
    (0, vitest_1.it)("returns zero for empty flights array", () => {
        (0, vitest_1.expect)((0, calculator_1.calcFlightCost)([], 2)).toEqual((0, calculator_1.zeroCurrency)("INR"));
    });
    (0, vitest_1.it)("sums multiple flight legs", () => {
        // outbound + return
        const result = (0, calculator_1.calcFlightCost)([mockFlight(20000), mockFlight(18000)], 1);
        (0, vitest_1.expect)(result.amount).toBe(38000);
    });
});
(0, vitest_1.describe)("calcHotelCost", () => {
    const mockHotel = (price) => ({
        id: "H1", label: { dataType: "live" }, name: "Test Hotel",
        address: "Seoul", stars: 4, pricePerNight: { amount: price, currency: "INR" },
        checkIn: "2025-01-01", checkOut: "2025-01-07",
    });
    (0, vitest_1.it)("calculates cost for 7 nights 1 room", () => {
        (0, vitest_1.expect)((0, calculator_1.calcHotelCost)(mockHotel(3000), 7, 1)).toEqual({ amount: 21000, currency: "INR" });
    });
    (0, vitest_1.it)("calculates cost for 5 nights 2 rooms", () => {
        (0, vitest_1.expect)((0, calculator_1.calcHotelCost)(mockHotel(3000), 5, 2)).toEqual({ amount: 30000, currency: "INR" });
    });
});
(0, vitest_1.describe)("calcNights", () => {
    (0, vitest_1.it)("calculates 7 nights", () => {
        (0, vitest_1.expect)((0, calculator_1.calcNights)("2025-01-01", "2025-01-08")).toBe(7);
    });
    (0, vitest_1.it)("returns at least 1 night", () => {
        (0, vitest_1.expect)((0, calculator_1.calcNights)("2025-01-01", "2025-01-01")).toBe(1);
    });
});
(0, vitest_1.describe)("buildBudgetSummary", () => {
    const label = { dataType: "live", source: "test", retrievedAt: new Date().toISOString() };
    const cur = "INR";
    (0, vitest_1.it)("calculates correct remaining and per-person-per-day", () => {
        const summary = (0, calculator_1.buildBudgetSummary)({
            label,
            totalBudget: { amount: 100000, currency: cur },
            flightsCost: { amount: 40000, currency: cur },
            hotelsCost: { amount: 25000, currency: cur },
            foodCost: { amount: 10000, currency: cur },
            transportCost: { amount: 5000, currency: cur },
            activitiesCost: { amount: 8000, currency: cur },
            miscCost: { amount: 2000, currency: cur },
            totalDays: 7,
            adults: 1,
        });
        (0, vitest_1.expect)(summary.totalSpent.amount).toBe(90000);
        (0, vitest_1.expect)(summary.remaining.amount).toBe(10000);
        (0, vitest_1.expect)(summary.perPersonPerDay.amount).toBeCloseTo(12857.14, 0);
    });
});
(0, vitest_1.describe)("formatDuration", () => {
    (0, vitest_1.it)("formats hours and minutes", () => (0, vitest_1.expect)((0, calculator_1.formatDuration)(150)).toBe("2h 30m"));
    (0, vitest_1.it)("formats only hours", () => (0, vitest_1.expect)((0, calculator_1.formatDuration)(120)).toBe("2h"));
    (0, vitest_1.it)("formats only minutes", () => (0, vitest_1.expect)((0, calculator_1.formatDuration)(45)).toBe("45m"));
});
(0, vitest_1.describe)("sumMinutes", () => {
    (0, vitest_1.it)("sums durations", () => (0, vitest_1.expect)((0, calculator_1.sumMinutes)([30, 60, 90])).toBe(180));
    (0, vitest_1.it)("handles empty array", () => (0, vitest_1.expect)((0, calculator_1.sumMinutes)([])).toBe(0));
});
(0, vitest_1.describe)("checkBudgetOverruns", () => {
    (0, vitest_1.it)("flags critical overspend", () => {
        const warnings = (0, calculator_1.checkBudgetOverruns)([{
                category: "flights",
                amount: { amount: 80000, currency: "INR" },
                budget: { amount: 40000, currency: "INR" },
            }]);
        (0, vitest_1.expect)(warnings).toHaveLength(1);
        (0, vitest_1.expect)(warnings[0].severity).toBe("critical");
    });
    (0, vitest_1.it)("does not flag when under budget", () => {
        const warnings = (0, calculator_1.checkBudgetOverruns)([{
                category: "flights",
                amount: { amount: 30000, currency: "INR" },
                budget: { amount: 40000, currency: "INR" },
            }]);
        (0, vitest_1.expect)(warnings).toHaveLength(0);
    });
});
//# sourceMappingURL=calculator.test.js.map