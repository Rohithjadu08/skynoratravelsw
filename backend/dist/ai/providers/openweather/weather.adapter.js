"use strict";
/**
 * OpenWeatherMap Adapter
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenWeatherAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 1800 }); // 30 min cache
class OpenWeatherAdapter {
    constructor() {
        this.name = "OpenWeatherMap";
        this.apiKey = process.env.OPENWEATHER_API_KEY;
    }
    async getForecast(input) {
        const cacheKey = `weather:${input.location}:${input.units}`;
        const cached = cache.get(cacheKey);
        if (cached)
            return cached;
        const retrievedAt = new Date().toISOString();
        try {
            const res = await axios_1.default.get("https://api.openweathermap.org/data/2.5/forecast", {
                params: { q: input.location, appid: this.apiKey, units: input.units ?? "metric", cnt: 40 },
            });
            // Group 3-hour forecasts by day
            const byDay = {};
            for (const item of res.data.list) {
                const date = item.dt_txt.split(" ")[0];
                const main = item.main;
                const weather = item.weather[0];
                if (!byDay[date])
                    byDay[date] = { min: Infinity, max: -Infinity, conditions: [], humidity: [], pop: [] };
                byDay[date].min = Math.min(byDay[date].min, main.temp_min);
                byDay[date].max = Math.max(byDay[date].max, main.temp_max);
                byDay[date].conditions.push(weather.description);
                byDay[date].humidity.push(main.humidity);
                byDay[date].pop.push(item.pop * 100);
            }
            const unit = input.units === "imperial" ? "F" : "C";
            const forecast = Object.entries(byDay).slice(0, 7).map(([date, d]) => ({
                date,
                minTemp: Math.round(d.min),
                maxTemp: Math.round(d.max),
                unit: unit,
                condition: d.conditions[Math.floor(d.conditions.length / 2)],
                precipitationChance: Math.round(Math.max(...d.pop)),
                humidity: Math.round(d.humidity.reduce((a, b) => a + b, 0) / d.humidity.length),
                icon: "01d",
            }));
            const result = {
                available: true,
                label: { dataType: "live", source: "OpenWeatherMap API", retrievedAt },
                location: input.location,
                forecast,
            };
            cache.set(cacheKey, result);
            return result;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { available: false, reason: `OpenWeatherMap error: ${message}`, provider: "OpenWeatherMap", attemptedAt: retrievedAt };
        }
    }
}
exports.OpenWeatherAdapter = OpenWeatherAdapter;
//# sourceMappingURL=weather.adapter.js.map