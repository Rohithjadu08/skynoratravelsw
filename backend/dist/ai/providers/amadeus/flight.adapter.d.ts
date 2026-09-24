/**
 * Amadeus Flight Adapter — real implementation.
 * Only loaded when AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET are set.
 */
import { FlightProvider } from "../interfaces";
import { FlightResult } from "../../types/results";
import { FlightSearchInput } from "../../types/tools";
export declare class AmadeusFlightAdapter implements FlightProvider {
    readonly name = "Amadeus";
    private baseUrl;
    private clientId;
    private clientSecret;
    private accessToken;
    private tokenExpiresAt;
    constructor();
    private getAccessToken;
    searchFlights(input: FlightSearchInput): Promise<FlightResult>;
}
//# sourceMappingURL=flight.adapter.d.ts.map