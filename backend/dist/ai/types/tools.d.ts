/**
 * Zod schemas for all tool inputs and outputs.
 * These are the ONLY way agents communicate with the outside world.
 * Validation is enforced at runtime — no unvalidated data reaches the LLM or the user.
 */
import { z } from "zod";
export declare const MoneySchema: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodString;
}, z.core.$strip>;
export declare const DataLabelSchema: z.ZodObject<{
    dataType: z.ZodEnum<{
        ai_recommended: "ai_recommended";
        estimated: "estimated";
        live: "live";
    }>;
    source: z.ZodOptional<z.ZodString>;
    retrievedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const FlightSearchInputSchema: z.ZodObject<{
    origin: z.ZodString;
    destination: z.ZodString;
    departureDate: z.ZodString;
    returnDate: z.ZodOptional<z.ZodString>;
    adults: z.ZodDefault<z.ZodNumber>;
    cabinClass: z.ZodDefault<z.ZodEnum<{
        BUSINESS: "BUSINESS";
        ECONOMY: "ECONOMY";
        FIRST: "FIRST";
        PREMIUM_ECONOMY: "PREMIUM_ECONOMY";
    }>>;
    maxResults: z.ZodDefault<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
    }, z.core.$strip>>;
    nonstopOnly: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const FlightSearchOutputSchema: z.ZodObject<{
    available: z.ZodLiteral<true>;
    label: z.ZodObject<{
        dataType: z.ZodEnum<{
            ai_recommended: "ai_recommended";
            estimated: "estimated";
            live: "live";
        }>;
        source: z.ZodOptional<z.ZodString>;
        retrievedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    flights: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodObject<{
            dataType: z.ZodEnum<{
                ai_recommended: "ai_recommended";
                estimated: "estimated";
                live: "live";
            }>;
            source: z.ZodOptional<z.ZodString>;
            retrievedAt: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        airline: z.ZodString;
        flightNumber: z.ZodString;
        origin: z.ZodString;
        destination: z.ZodString;
        departureAt: z.ZodString;
        arrivalAt: z.ZodString;
        durationMinutes: z.ZodNumber;
        stops: z.ZodNumber;
        price: z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>;
        cabinClass: z.ZodString;
        seatsAvailable: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    searchParams: z.ZodObject<{
        origin: z.ZodString;
        destination: z.ZodString;
        departureDate: z.ZodString;
        returnDate: z.ZodOptional<z.ZodString>;
        adults: z.ZodDefault<z.ZodNumber>;
        cabinClass: z.ZodDefault<z.ZodEnum<{
            BUSINESS: "BUSINESS";
            ECONOMY: "ECONOMY";
            FIRST: "FIRST";
            PREMIUM_ECONOMY: "PREMIUM_ECONOMY";
        }>>;
        maxResults: z.ZodDefault<z.ZodNumber>;
        maxPrice: z.ZodOptional<z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>>;
        nonstopOnly: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const HotelSearchInputSchema: z.ZodObject<{
    cityCode: z.ZodString;
    checkIn: z.ZodString;
    checkOut: z.ZodString;
    adults: z.ZodDefault<z.ZodNumber>;
    rooms: z.ZodDefault<z.ZodNumber>;
    minStars: z.ZodOptional<z.ZodNumber>;
    maxPricePerNight: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
    }, z.core.$strip>>;
    maxResults: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const HotelSearchOutputSchema: z.ZodObject<{
    available: z.ZodLiteral<true>;
    label: z.ZodObject<{
        dataType: z.ZodEnum<{
            ai_recommended: "ai_recommended";
            estimated: "estimated";
            live: "live";
        }>;
        source: z.ZodOptional<z.ZodString>;
        retrievedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    hotels: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodObject<{
            dataType: z.ZodEnum<{
                ai_recommended: "ai_recommended";
                estimated: "estimated";
                live: "live";
            }>;
            source: z.ZodOptional<z.ZodString>;
            retrievedAt: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        name: z.ZodString;
        address: z.ZodString;
        stars: z.ZodNumber;
        rating: z.ZodOptional<z.ZodNumber>;
        pricePerNight: z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>;
        totalPrice: z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>;
        amenities: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    searchParams: z.ZodObject<{
        cityCode: z.ZodString;
        checkIn: z.ZodString;
        checkOut: z.ZodString;
        adults: z.ZodDefault<z.ZodNumber>;
        rooms: z.ZodDefault<z.ZodNumber>;
        minStars: z.ZodOptional<z.ZodNumber>;
        maxPricePerNight: z.ZodOptional<z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>>;
        maxResults: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const WeatherInputSchema: z.ZodObject<{
    location: z.ZodString;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    units: z.ZodDefault<z.ZodEnum<{
        imperial: "imperial";
        metric: "metric";
    }>>;
}, z.core.$strip>;
export declare const WeatherOutputSchema: z.ZodObject<{
    available: z.ZodLiteral<true>;
    label: z.ZodObject<{
        dataType: z.ZodEnum<{
            ai_recommended: "ai_recommended";
            estimated: "estimated";
            live: "live";
        }>;
        source: z.ZodOptional<z.ZodString>;
        retrievedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    location: z.ZodString;
    forecast: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        minTemp: z.ZodNumber;
        maxTemp: z.ZodNumber;
        unit: z.ZodEnum<{
            C: "C";
            F: "F";
        }>;
        condition: z.ZodString;
        precipitationChance: z.ZodNumber;
        humidity: z.ZodNumber;
        icon: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const CurrencyInputSchema: z.ZodObject<{
    fromCurrency: z.ZodString;
    toCurrency: z.ZodString;
    amount: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const CurrencyOutputSchema: z.ZodObject<{
    available: z.ZodLiteral<true>;
    label: z.ZodObject<{
        dataType: z.ZodEnum<{
            ai_recommended: "ai_recommended";
            estimated: "estimated";
            live: "live";
        }>;
        source: z.ZodOptional<z.ZodString>;
        retrievedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    fromCurrency: z.ZodString;
    toCurrency: z.ZodString;
    rate: z.ZodNumber;
    convertedAmount: z.ZodOptional<z.ZodNumber>;
    rateDate: z.ZodString;
}, z.core.$strip>;
export declare const PlacesSearchInputSchema: z.ZodObject<{
    location: z.ZodString;
    categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    radius: z.ZodDefault<z.ZodNumber>;
    maxResults: z.ZodDefault<z.ZodNumber>;
    openNow: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const PlacesSearchOutputSchema: z.ZodObject<{
    available: z.ZodLiteral<true>;
    label: z.ZodObject<{
        dataType: z.ZodEnum<{
            ai_recommended: "ai_recommended";
            estimated: "estimated";
            live: "live";
        }>;
        source: z.ZodOptional<z.ZodString>;
        retrievedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    places: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodObject<{
            dataType: z.ZodEnum<{
                ai_recommended: "ai_recommended";
                estimated: "estimated";
                live: "live";
            }>;
            source: z.ZodOptional<z.ZodString>;
            retrievedAt: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        name: z.ZodString;
        category: z.ZodString;
        address: z.ZodString;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
        rating: z.ZodOptional<z.ZodNumber>;
        reviewCount: z.ZodOptional<z.ZodNumber>;
        openNow: z.ZodOptional<z.ZodBoolean>;
        photoUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const RestaurantSearchInputSchema: z.ZodObject<{
    location: z.ZodString;
    cuisine: z.ZodOptional<z.ZodString>;
    dietary: z.ZodOptional<z.ZodArray<z.ZodString>>;
    radius: z.ZodDefault<z.ZodNumber>;
    maxResults: z.ZodDefault<z.ZodNumber>;
    openNow: z.ZodOptional<z.ZodBoolean>;
    minRating: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const RestaurantSearchOutputSchema: z.ZodObject<{
    available: z.ZodLiteral<true>;
    label: z.ZodObject<{
        dataType: z.ZodEnum<{
            ai_recommended: "ai_recommended";
            estimated: "estimated";
            live: "live";
        }>;
        source: z.ZodOptional<z.ZodString>;
        retrievedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    restaurants: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodObject<{
            dataType: z.ZodEnum<{
                ai_recommended: "ai_recommended";
                estimated: "estimated";
                live: "live";
            }>;
            source: z.ZodOptional<z.ZodString>;
            retrievedAt: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        name: z.ZodString;
        cuisine: z.ZodString;
        address: z.ZodString;
        rating: z.ZodOptional<z.ZodNumber>;
        priceLevel: z.ZodOptional<z.ZodNumber>;
        openNow: z.ZodOptional<z.ZodBoolean>;
        dietaryOptions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    searchParams: z.ZodObject<{
        location: z.ZodString;
        cuisine: z.ZodOptional<z.ZodString>;
        dietary: z.ZodOptional<z.ZodArray<z.ZodString>>;
        radius: z.ZodDefault<z.ZodNumber>;
        maxResults: z.ZodDefault<z.ZodNumber>;
        openNow: z.ZodOptional<z.ZodBoolean>;
        minRating: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const TransportInputSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
    mode: z.ZodDefault<z.ZodEnum<{
        bicycling: "bicycling";
        driving: "driving";
        transit: "transit";
        walking: "walking";
    }>>;
    departureTime: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const TransportOutputSchema: z.ZodObject<{
    available: z.ZodLiteral<true>;
    label: z.ZodObject<{
        dataType: z.ZodEnum<{
            ai_recommended: "ai_recommended";
            estimated: "estimated";
            live: "live";
        }>;
        source: z.ZodOptional<z.ZodString>;
        retrievedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    from: z.ZodString;
    to: z.ZodString;
    options: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodObject<{
            dataType: z.ZodEnum<{
                ai_recommended: "ai_recommended";
                estimated: "estimated";
                live: "live";
            }>;
            source: z.ZodOptional<z.ZodString>;
            retrievedAt: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        mode: z.ZodString;
        durationMinutes: z.ZodNumber;
        distanceKm: z.ZodNumber;
        cost: z.ZodOptional<z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>>;
        steps: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const WebSearchInputSchema: z.ZodObject<{
    query: z.ZodString;
    maxResults: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const WebSearchOutputSchema: z.ZodObject<{
    available: z.ZodLiteral<true>;
    label: z.ZodObject<{
        dataType: z.ZodEnum<{
            ai_recommended: "ai_recommended";
            estimated: "estimated";
            live: "live";
        }>;
        source: z.ZodOptional<z.ZodString>;
        retrievedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    query: z.ZodString;
    results: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        url: z.ZodString;
        snippet: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const DataUnavailableSchema: z.ZodObject<{
    available: z.ZodLiteral<false>;
    reason: z.ZodString;
    provider: z.ZodOptional<z.ZodString>;
    attemptedAt: z.ZodString;
}, z.core.$strip>;
export type FlightSearchInput = z.infer<typeof FlightSearchInputSchema>;
export type HotelSearchInput = z.infer<typeof HotelSearchInputSchema>;
export type WeatherInput = z.infer<typeof WeatherInputSchema>;
export type CurrencyInput = z.infer<typeof CurrencyInputSchema>;
export type PlacesSearchInput = z.infer<typeof PlacesSearchInputSchema>;
export type RestaurantSearchInput = z.infer<typeof RestaurantSearchInputSchema>;
export type TransportInput = z.infer<typeof TransportInputSchema>;
export type WebSearchInput = z.infer<typeof WebSearchInputSchema>;
//# sourceMappingURL=tools.d.ts.map