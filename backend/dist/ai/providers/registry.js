"use strict";
/**
 * Provider Registry Factory
 * Selects real adapters when env vars are present, mock adapters otherwise.
 * Validates required keys at startup and logs what is active.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProviderRegistry = createProviderRegistry;
exports.getProviderRegistry = getProviderRegistry;
const flight_mock_1 = require("./mock/flight.mock");
const hotel_mock_1 = require("./mock/hotel.mock");
const weather_mock_1 = require("./mock/weather.mock");
const currency_mock_1 = require("./mock/currency.mock");
const places_mock_1 = require("./mock/places.mock");
const search_mock_1 = require("./mock/search.mock");
const flight_adapter_1 = require("./amadeus/flight.adapter");
const hotel_adapter_1 = require("./amadeus/hotel.adapter");
const weather_adapter_1 = require("./openweather/weather.adapter");
const currency_adapter_1 = require("./exchangerates/currency.adapter");
const places_adapter_1 = require("./google/places.adapter");
const search_adapter_1 = require("./tavily/search.adapter");
function hasAmadeus() {
    return !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}
function createProviderRegistry() {
    const flights = hasAmadeus() ? new flight_adapter_1.AmadeusFlightAdapter() : new flight_mock_1.MockFlightProvider();
    const hotels = hasAmadeus() ? new hotel_adapter_1.AmadeusHotelAdapter() : new hotel_mock_1.MockHotelProvider();
    const weather = process.env.OPENWEATHER_API_KEY ? new weather_adapter_1.OpenWeatherAdapter() : new weather_mock_1.MockWeatherProvider();
    const currency = process.env.EXCHANGE_RATES_API_KEY ? new currency_adapter_1.ExchangeRatesAdapter() : new currency_mock_1.MockCurrencyProvider();
    const places = process.env.GOOGLE_MAPS_API_KEY ? new places_adapter_1.GooglePlacesAdapter() : new places_mock_1.MockPlacesProvider();
    const search = process.env.TAVILY_API_KEY ? new search_adapter_1.TavilySearchAdapter() : new search_mock_1.MockSearchProvider();
    console.log(`[Providers] flights=${flights.name} hotels=${hotels.name} weather=${weather.name} currency=${currency.name} places=${places.name} search=${search.name}`);
    return { flights, hotels, weather, currency, places, search };
}
/** Singleton registry — created once at server startup */
let _registry = null;
function getProviderRegistry() {
    if (!_registry) {
        _registry = createProviderRegistry();
    }
    return _registry;
}
//# sourceMappingURL=registry.js.map