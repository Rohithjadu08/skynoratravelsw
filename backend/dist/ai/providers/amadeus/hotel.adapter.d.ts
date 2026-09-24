/**
 * Amadeus Hotel Adapter — real implementation.
 */
import { HotelProvider } from "../interfaces";
import { HotelResult } from "../../types/results";
import { HotelSearchInput } from "../../types/tools";
export declare class AmadeusHotelAdapter implements HotelProvider {
    readonly name = "Amadeus";
    private baseUrl;
    private clientId;
    private clientSecret;
    private accessToken;
    private tokenExpiresAt;
    constructor();
    private getAccessToken;
    searchHotels(input: HotelSearchInput): Promise<HotelResult>;
}
//# sourceMappingURL=hotel.adapter.d.ts.map