/**
 * OpenWeatherMap Adapter
 */
import { WeatherProvider } from "../interfaces";
import { WeatherAgentResult } from "../../types/results";
import { WeatherInput } from "../../types/tools";
export declare class OpenWeatherAdapter implements WeatherProvider {
    readonly name = "OpenWeatherMap";
    private apiKey;
    constructor();
    getForecast(input: WeatherInput): Promise<WeatherAgentResult>;
}
//# sourceMappingURL=weather.adapter.d.ts.map