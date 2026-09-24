-- Migration: 001_initial_schema.sql
-- Description: Create initial tables, relationships, enums, indexes, and constraints for SKYNORA TRAVELS.

-- Enable pgcrypto extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    phone TEXT,
    mobile_number TEXT,
    refresh_tokens TEXT[] DEFAULT '{}',
    preferences JSONB DEFAULT '{}'::jsonb,
    saved_itineraries JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hotels Table
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    ratings NUMERIC(3, 2) DEFAULT 0,
    location TEXT NOT NULL,
    country TEXT NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0,
    cover TEXT NOT NULL,
    extra_image_url TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Flights Table
CREATE TABLE IF NOT EXISTS public.flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    duration TEXT NOT NULL,
    fare NUMERIC(10, 2) NOT NULL,
    stops TEXT,
    departure TEXT,
    arrival TEXT,
    flight_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Booked Hotels Table
CREATE TABLE IF NOT EXISTS public.booked_hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    country TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    cover TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Booked Flights Table
CREATE TABLE IF NOT EXISTS public.booked_flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    flight_id UUID REFERENCES public.flights(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    duration TEXT,
    fare NUMERIC(10, 2) NOT NULL,
    stops TEXT,
    departure TEXT,
    arrival TEXT,
    seat_number TEXT,
    travel_date TEXT,
    booking_status TEXT DEFAULT 'CONFIRMED' CHECK (booking_status IN ('HELD', 'CONFIRMED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Flight Seat Inventory Table
CREATE TABLE IF NOT EXISTS public.flight_seat_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID NOT NULL REFERENCES public.flights(id) ON DELETE CASCADE,
    travel_date TEXT NOT NULL,
    seat_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'HELD', 'BOOKED')),
    held_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    hold_expires_at TIMESTAMPTZ,
    booking_id UUID REFERENCES public.booked_flights(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_flight_date_seat UNIQUE (flight_id, travel_date, seat_number)
);

-- 7. AI Sessions Table
CREATE TABLE IF NOT EXISTS public.ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    constraints JSONB DEFAULT '{}'::jsonb,
    trip_plan JSONB,
    messages JSONB DEFAULT '[]'::jsonb,
    tool_call_log JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile_number);
CREATE INDEX IF NOT EXISTS idx_hotels_location ON public.hotels(location);
CREATE INDEX IF NOT EXISTS idx_flights_dep_arr ON public.flights(departure, arrival);
CREATE INDEX IF NOT EXISTS idx_booked_hotels_user ON public.booked_hotels(user_id);
CREATE INDEX IF NOT EXISTS idx_booked_flights_user ON public.booked_flights(user_id);
CREATE INDEX IF NOT EXISTS idx_seat_inventory_flight_date ON public.flight_seat_inventory(flight_id, travel_date);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON public.ai_sessions(user_id);

