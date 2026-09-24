-- Migration: 002_row_level_security.sql
-- Description: Enable Row Level Security (RLS) and define access control policies.

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booked_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booked_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_seat_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;

-- 1. Hotels Policy: Public read access
CREATE POLICY "Public read hotels" 
ON public.hotels 
FOR SELECT 
USING (true);

-- 2. Flights Policy: Public read access
CREATE POLICY "Public read flights" 
ON public.flights 
FOR SELECT 
USING (true);

-- 3. Profiles Policies: User self-management
CREATE POLICY "Users view own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users update own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Users insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

-- 4. Booked Hotels Policies: User self-management
CREATE POLICY "Users view own hotel bookings" 
ON public.booked_hotels 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users insert own hotel bookings" 
ON public.booked_hotels 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own hotel bookings" 
ON public.booked_hotels 
FOR DELETE 
USING (user_id = auth.uid());

-- 5. Booked Flights Policies: User self-management
CREATE POLICY "Users view own flight bookings" 
ON public.booked_flights 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users insert own flight bookings" 
ON public.booked_flights 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own flight bookings" 
ON public.booked_flights 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users delete own flight bookings" 
ON public.booked_flights 
FOR DELETE 
USING (user_id = auth.uid());

-- 6. Flight Seat Inventory Policies: Public read, user-held seat management
CREATE POLICY "Public view seat inventory" 
ON public.flight_seat_inventory 
FOR SELECT 
USING (true);

CREATE POLICY "Users manage held seats" 
ON public.flight_seat_inventory 
FOR ALL 
USING (held_by = auth.uid());

-- 7. AI Sessions Policies: User self-management
CREATE POLICY "Users manage own AI sessions" 
ON public.ai_sessions 
FOR ALL 
USING (user_id = auth.uid());

