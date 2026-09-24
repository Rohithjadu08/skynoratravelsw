"use strict";
/**
 * Weather Agent
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherAgent = void 0;
const tools_1 = require("../types/tools");
class WeatherAgent {
    constructor(providers) {
        this.providers = providers;
    }
    async getForecast(rawInput) {
        const input = tools_1.WeatherInputSchema.parse(rawInput);
        return this.providers.weather.getForecast(input);
    }
}
exports.WeatherAgent = WeatherAgent;
//# sourceMappingURL=weather.agent.js.map