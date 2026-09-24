/**
 * Mock Weather Provider
 */
import { WeatherProvider } from "../interfaces";
import { WeatherAgentResult } from "../../types/results";
import { WeatherInput } from "../../types/tools";
export declare class MockWeatherProvider implements WeatherProvider {
    readonly name = "MockWeatherProvider";
    getForecast(input: WeatherInput): Promise<WeatherAgentResult>;
}
//# sourceMappingURL=weather.mock.d.ts.map