/**
 * Calculation Engine — purely deterministic, zero LLM involvement.
 * All cost totals, currency conversions, and distance/time math go through here.
 * Every function is pure and fully testable.
 */
import { Money, BudgetSummary, FlightOption, HotelOption, DayPlan } from "../types/trip";
import { DataLabel } from "../types/trip";
/**
 * Converts an amount from one currency to another using a known exchange rate.
 * NEVER calls an LLM — rate must come from CurrencyProvider.
 */
export declare function convertCurrency(amount: Money, targetCurrency: string, rate: number): Money;
/**
 * Converts multiple Money values to the same target currency and sums them.
 * Each amount must already be in the same currency OR rates must be provided.
 */
export declare function sumMoney(amounts: Money[], targetCurrency: string, rates?: Record<string, number>): Money;
export declare function addMoney(a: Money, b: Money): Money;
export declare function subtractMoney(a: Money, b: Money): Money;
export declare function multiplyMoney(m: Money, factor: number): Money;
export declare function zeroCurrency(currency: string): Money;
/** Total flight cost for all passengers */
export declare function calcFlightCost(flights: FlightOption[], adults: number): Money;
/** Total hotel cost for a stay (nights × rooms × pricePerNight) */
export declare function calcHotelCost(hotel: HotelOption, nights: number, rooms?: number): Money;
/** Number of nights between two ISO date strings */
export declare function calcNights(checkIn: string, checkOut: string): number;
/** Day-by-day itinerary cost total */
export declare function calcItineraryCost(days: DayPlan[]): Money;
export interface BudgetInput {
    totalBudget: Money;
    flightsCost: Money;
    hotelsCost: Money;
    foodCost: Money;
    transportCost: Money;
    activitiesCost: Money;
    miscCost: Money;
    totalDays: number;
    adults: number;
    label: DataLabel;
}
export declare function buildBudgetSummary(input: BudgetInput): BudgetSummary;
/** Sum durations in minutes */
export declare function sumMinutes(durations: number[]): number;
/** Format minutes → human-readable "2h 30m" */
export declare function formatDuration(minutes: number): string;
/** Sum distances in km */
export declare function sumDistanceKm(distances: number[]): number;
export interface BudgetCheck {
    category: string;
    amount: Money;
    budget: Money;
}
export declare function checkBudgetOverruns(checks: BudgetCheck[]): Array<{
    category: string;
    message: string;
    severity: "info" | "warning" | "critical";
}>;
//# sourceMappingURL=calculator.d.ts.map