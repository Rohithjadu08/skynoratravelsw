/** Deterministic itinerary composer. It schedules only supplied, sourced data. */
import { ItineraryAgentResult, Attraction, Restaurant, TransportOption } from "../types/results";
export interface ItineraryInput {
    startDate: string;
    days: number;
    attractions: Attraction[];
    restaurants: Restaurant[];
    transport?: TransportOption[];
    currency: string;
}
export declare class ItineraryAgent {
    build(input: ItineraryInput): ItineraryAgentResult;
}
//# sourceMappingURL=itinerary.agent.d.ts.map