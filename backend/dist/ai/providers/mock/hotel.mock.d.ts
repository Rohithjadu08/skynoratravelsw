/**
 * Mock Hotel Provider
 */
import { HotelProvider } from "../interfaces";
import { HotelResult } from "../../types/results";
import { HotelSearchInput } from "../../types/tools";
export declare class MockHotelProvider implements HotelProvider {
    readonly name = "MockHotelProvider";
    searchHotels(input: HotelSearchInput): Promise<HotelResult>;
}
//# sourceMappingURL=hotel.mock.d.ts.map