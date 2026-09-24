"use strict";
/**
 * Mock Weather Provider
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockWeatherProvider = void 0;
const CONDITIONS = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Clear", "Overcast"];
function dateRange(start, end) {
    const dates = [];
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
    }
    return dates;
}
class MockWeatherProvider {
    constructor() {
        this.name = "MockWeatherProvider";
    }
    async getForecast(input) {
        await new Promise((r) => setTimeout(r, 100));
        const retrievedAt = new Date().toISOString();
        const start = input.startDate ?? new Date().toISOString().split("T")[0];
        const end = input.endDate ?? new Date(new Date().getTime() + 7 * 86400000).toISOString().split("T")[0];
        const days = dateRange(start, end).slice(0, 7);
        return {
            available: true,
            label: {
                dataType: "live",
                source: "MockWeatherProvider (sandbox)",
                retrievedAt,
            },
            location: input.location,
            forecast: days.map((date) => ({
                date,
                minTemp: Math.round(Math.random() * 10 + 18),
                maxTemp: Math.round(Math.random() * 10 + 26),
                unit: "C",
                condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
                precipitationChance: Math.round(Math.random() * 60),
                humidity: Math.round(Math.random() * 30 + 50),
                icon: "01d",
            })),
        };
    }
}
exports.MockWeatherProvider = MockWeatherProvider;
//# sourceMappingURL=weather.mock.js.map