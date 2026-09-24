"use strict";
/**
 * Calculation Engine — purely deterministic, zero LLM involvement.
 * All cost totals, currency conversions, and distance/time math go through here.
 * Every function is pure and fully testable.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCurrency = convertCurrency;
exports.sumMoney = sumMoney;
exports.addMoney = addMoney;
exports.subtractMoney = subtractMoney;
exports.multiplyMoney = multiplyMoney;
exports.zeroCurrency = zeroCurrency;
exports.calcFlightCost = calcFlightCost;
exports.calcHotelCost = calcHotelCost;
exports.calcNights = calcNights;
exports.calcItineraryCost = calcItineraryCost;
exports.buildBudgetSummary = buildBudgetSummary;
exports.sumMinutes = sumMinutes;
exports.formatDuration = formatDuration;
exports.sumDistanceKm = sumDistanceKm;
exports.checkBudgetOverruns = checkBudgetOverruns;
// ── Currency Conversion ───────────────────────────────────────────────────────
/**
 * Converts an amount from one currency to another using a known exchange rate.
 * NEVER calls an LLM — rate must come from CurrencyProvider.
 */
function convertCurrency(amount, targetCurrency, rate) {
    if (amount.currency === targetCurrency)
        return amount;
    return {
        amount: parseFloat((amount.amount * rate).toFixed(2)),
        currency: targetCurrency,
    };
}
/**
 * Converts multiple Money values to the same target currency and sums them.
 * Each amount must already be in the same currency OR rates must be provided.
 */
function sumMoney(amounts, targetCurrency, rates = {}) {
    const total = amounts.reduce((acc, m) => {
        if (m.currency === targetCurrency)
            return acc + m.amount;
        const rate = rates[`${m.currency}:${targetCurrency}`] ?? rates[m.currency];
        if (!rate)
            throw new Error(`No exchange rate provided for ${m.currency} → ${targetCurrency}`);
        return acc + m.amount * rate;
    }, 0);
    return { amount: parseFloat(total.toFixed(2)), currency: targetCurrency };
}
function addMoney(a, b) {
    if (a.currency !== b.currency) {
        throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}. Convert first.`);
    }
    return { amount: parseFloat((a.amount + b.amount).toFixed(2)), currency: a.currency };
}
function subtractMoney(a, b) {
    if (a.currency !== b.currency) {
        throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}. Convert first.`);
    }
    return { amount: parseFloat((a.amount - b.amount).toFixed(2)), currency: a.currency };
}
function multiplyMoney(m, factor) {
    return { amount: parseFloat((m.amount * factor).toFixed(2)), currency: m.currency };
}
function zeroCurrency(currency) {
    return { amount: 0, currency };
}
// ── Trip Cost Calculations ────────────────────────────────────────────────────
/** Total flight cost for all passengers */
function calcFlightCost(flights, adults) {
    if (flights.length === 0)
        return zeroCurrency("INR");
    const baseCurrency = flights[0].price.currency;
    const perPersonTotal = flights.reduce((acc, f) => {
        if (f.price.currency !== baseCurrency)
            throw new Error("Mixed flight currencies — convert first");
        return acc + f.price.amount;
    }, 0);
    return { amount: parseFloat((perPersonTotal * adults).toFixed(2)), currency: baseCurrency };
}
/** Total hotel cost for a stay (nights × rooms × pricePerNight) */
function calcHotelCost(hotel, nights, rooms = 1) {
    return { amount: parseFloat((hotel.pricePerNight.amount * nights * rooms).toFixed(2)), currency: hotel.pricePerNight.currency };
}
/** Number of nights between two ISO date strings */
function calcNights(checkIn, checkOut) {
    const a = new Date(checkIn).getTime();
    const b = new Date(checkOut).getTime();
    return Math.max(1, Math.round((b - a) / 86400000));
}
/** Day-by-day itinerary cost total */
function calcItineraryCost(days) {
    if (days.length === 0)
        return zeroCurrency("INR");
    const currency = days[0].estimatedCost.currency;
    const total = days.reduce((acc, d) => {
        if (d.estimatedCost.currency !== currency)
            throw new Error("Mixed day-plan currencies");
        return acc + d.estimatedCost.amount;
    }, 0);
    return { amount: parseFloat(total.toFixed(2)), currency };
}
function buildBudgetSummary(input) {
    const cur = input.totalBudget.currency;
    const breakdown = {
        flights: input.flightsCost,
        hotels: input.hotelsCost,
        food: input.foodCost,
        transport: input.transportCost,
        activities: input.activitiesCost,
        misc: input.miscCost,
    };
    // All must be in same currency — enforce at call site
    const totalSpentAmount = Object.values(breakdown).reduce((acc, m) => {
        if (m.currency !== cur)
            throw new Error(`Budget currency mismatch: expected ${cur}, got ${m.currency}`);
        return acc + m.amount;
    }, 0);
    const totalSpent = { amount: parseFloat(totalSpentAmount.toFixed(2)), currency: cur };
    const remaining = {
        amount: parseFloat((input.totalBudget.amount - totalSpentAmount).toFixed(2)),
        currency: cur,
    };
    const perPersonPerDay = {
        amount: input.totalDays > 0 && input.adults > 0
            ? parseFloat((totalSpentAmount / (input.totalDays * input.adults)).toFixed(2))
            : 0,
        currency: cur,
    };
    return {
        label: input.label,
        totalBudget: input.totalBudget,
        breakdown,
        totalSpent,
        remaining,
        perPersonPerDay,
    };
}
// ── Distance & Time Aggregation ───────────────────────────────────────────────
/** Sum durations in minutes */
function sumMinutes(durations) {
    return durations.reduce((a, b) => a + b, 0);
}
/** Format minutes → human-readable "2h 30m" */
function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0)
        return `${m}m`;
    if (m === 0)
        return `${h}h`;
    return `${h}h ${m}m`;
}
/** Sum distances in km */
function sumDistanceKm(distances) {
    return parseFloat(distances.reduce((a, b) => a + b, 0).toFixed(2));
}
function checkBudgetOverruns(checks) {
    return checks
        .filter((c) => c.amount.currency === c.budget.currency && c.amount.amount > c.budget.amount)
        .map((c) => {
        const over = ((c.amount.amount - c.budget.amount) / c.budget.amount) * 100;
        const severity = over > 50 ? "critical" : over > 20 ? "warning" : "info";
        return {
            category: c.category,
            message: `${c.category} cost (${c.amount.currency} ${c.amount.amount.toLocaleString()}) exceeds budget by ${over.toFixed(0)}%.`,
            severity,
        };
    });
}
//# sourceMappingURL=calculator.js.map