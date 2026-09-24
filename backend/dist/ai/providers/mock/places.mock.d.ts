/**
 * Mock Places Provider — handles attractions, restaurants, and directions.
 */
import { PlacesProvider } from "../interfaces";
import { DestinationAgentResult, RestaurantAgentResult, TransportAgentResult } from "../../types/results";
import { PlacesSearchInput, RestaurantSearchInput, TransportInput } from "../../types/tools";
export declare class MockPlacesProvider implements PlacesProvider {
    readonly name = "MockPlacesProvider";
    searchAttractions(input: PlacesSearchInput): Promise<DestinationAgentResult>;
    searchRestaurants(input: RestaurantSearchInput): Promise<RestaurantAgentResult>;
    getDirections(input: TransportInput): Promise<TransportAgentResult>;
}
//# sourceMappingURL=places.mock.d.ts.map