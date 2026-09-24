"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractConstraints = extractConstraints;
const DIETARY_TERMS = ["vegetarian", "vegan", "halal", "gluten-free"];
const INTEREST_TERMS = ["museum", "museums", "temple", "temples", "hiking", "beach", "beaches", "shopping", "nightlife", "street food", "nature"];
function extractConstraints(message) {
    const text = message.trim();
    const lower = text.toLowerCase();
    const constraints = {};
    const party = lower.match(/(?:for|with)\s+(\d+)\s+(?:adult|people|persons|travellers|travelers)/);
    if (party)
        constraints.adults = Number(party[1]);
    // Preserve only destination/origin text explicitly supplied by the traveller.
    // Airport-code resolution is deliberately deferred to a live provider.
    const route = text.match(/\bfrom\s+(.+?)\s+to\s+(.+?)(?:[,.]|\s+(?:on|for|with|budget|in)\b|$)/i);
    if (route) {
        constraints.origin = route[1].trim();
        constraints.destination = route[2].trim();
    }
    else {
        const destination = text.match(/\b(?:to|in|visit)\s+([A-Za-z][A-Za-z .'-]{1,60})(?:[,.]|\s+(?:on|for|with|budget|in)\b|$)/i);
        if (destination)
            constraints.destination = destination[1].trim();
    }
    const dates = text.match(/\b(\d{4}-\d{2}-\d{2})\b/g);
    if (dates?.[0])
        constraints.departureDate = dates[0];
    if (dates?.[1])
        constraints.returnDate = dates[1];
    const budget = lower.match(/(?:budget(?:\s+of)?|under|within)\s*(?:₹|rs\.?|inr)?\s*([\d,.]+)\s*(k|lakh|lakhs)?/i);
    if (budget) {
        let amount = Number(budget[1].replace(/,/g, ""));
        if (budget[2]?.toLowerCase() === "k")
            amount *= 1000;
        if (budget[2]?.toLowerCase().startsWith("lakh"))
            amount *= 100000;
        if (Number.isFinite(amount) && amount > 0)
            constraints.budgetTotal = { amount, currency: "INR" };
    }
    const duration = lower.match(/(?:for|a)\s+(\d+)\s*(?:day|days|night|nights)/);
    if (duration)
        constraints.tripDurationDays = Number(duration[1]);
    const dietaryRestrictions = DIETARY_TERMS.filter((term) => lower.includes(term));
    if (dietaryRestrictions.length)
        constraints.dietaryRestrictions = dietaryRestrictions;
    const interests = INTEREST_TERMS.filter((term) => lower.includes(term));
    if (interests.length)
        constraints.interests = [...new Set(interests.map((item) => item.replace(/s$/, "")))];
    if (lower.includes("public transport") || lower.includes("metro") || lower.includes("bus")) {
        constraints.transportPreferences = ["public_transport"];
    }
    if (/\b(budget|cheap|affordable)\b/.test(lower))
        constraints.travelStyle = "budget";
    if (/\b(luxury|premium|five[- ]star)\b/.test(lower))
        constraints.travelStyle = "luxury";
    if (/\b(moderate|mid[- ]range)\b/.test(lower))
        constraints.travelStyle = "moderate";
    const cabin = lower.match(/\b(economy|premium economy|business|first class)\b/);
    if (cabin) {
        const cabinMap = {
            economy: "economy", "premium economy": "premium_economy", business: "business", "first class": "first",
        };
        constraints.cabinClass = cabinMap[cabin[1]];
    }
    return constraints;
}
//# sourceMappingURL=intent.js.map