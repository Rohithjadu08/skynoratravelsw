/**
 * Google Places Adapter — attractions, restaurants, and directions.
 */
import { PlacesProvider } from "../interfaces";
import { DestinationAgentResult, RestaurantAgentResult, TransportAgentResult } from "../../types/results";
import { PlacesSearchInput, RestaurantSearchInput, TransportInput } from "../../types/tools";
export declare class GooglePlacesAdapter implements PlacesProvider {
    readonly name = "Google Places";
    private apiKey;
    constructor();
    searchAttractions(input: PlacesSearchInput): Promise<DestinationAgentResult>;
    searchRestaurants(input: RestaurantSearchInput): Promise<RestaurantAgentResult>;
    getDirections(input: TransportInput): Promise<TransportAgentResult>;
}
//# sourceMappingURL=places.adapter.d.ts.map