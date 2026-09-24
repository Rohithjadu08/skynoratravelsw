/**
 * Mock Flight Provider — returns realistic fake data.
 * Implements FlightProvider identically to the real Amadeus adapter.
 * Used when AMADEUS_CLIENT_ID is not set in env.
 */
import { FlightProvider } from "../interfaces";
import { FlightResult } from "../../types/results";
import { FlightSearchInput } from "../../types/tools";
export declare class MockFlightProvider implements FlightProvider {
    readonly name = "MockFlightProvider";
    searchFlights(input: FlightSearchInput): Promise<FlightResult>;
}
//# sourceMappingURL=flight.mock.d.ts.map