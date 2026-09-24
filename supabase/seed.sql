-- Supabase Seed Data for SKYNORA TRAVELS
-- Initial Hotels Data
INSERT INTO public.hotels (name, ratings, location, country, price, cover, extra_image_url)
VALUES
(
    'Sky Nora Luxury Resort',
    5.0,
    'Goa',
    'India',
    8500.00,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
    ]
),
(
    'Taj Mahal Palace',
    5.0,
    'Mumbai',
    'India',
    18000.00,
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
    ]
),
(
    'The Oberoi Grand',
    4.8,
    'Kolkata',
    'India',
    12000.00,
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
    ARRAY[]::TEXT[]
),
(
    'Radisson Blu Resort',
    4.5,
    'Udaipur',
    'India',
    9500.00,
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80',
    ARRAY[]::TEXT[]
)
ON CONFLICT DO NOTHING;

-- Initial Flights Data
INSERT INTO public.flights (name, departure_time, arrival_time, duration, fare, stops, departure, arrival, flight_details)
VALUES
(
    'IndiGo',
    '06:00',
    '08:15',
    '02 h 15 m',
    5400.00,
    'Non stop',
    'Delhi',
    'Mumbai',
    '{"baggage": "ADULT", "checkin": "15 Kgs (1 piece only)", "cabin": "7 Kgs (1 piece only)"}'::jsonb
),
(
    'Air India',
    '14:30',
    '17:45',
    '03 h 15 m',
    6800.00,
    'Non stop',
    'Delhi',
    'Bengaluru',
    '{"baggage": "ADULT", "checkin": "25 Kgs (1 piece only)", "cabin": "8 Kgs (1 piece only)"}'::jsonb
),
(
    'SpiceJet',
    '18:20',
    '20:30',
    '02 h 10 m',
    4900.00,
    'Non stop',
    'Mumbai',
    'Goa',
    '{"baggage": "ADULT", "checkin": "15 Kgs (1 piece only)", "cabin": "7 Kgs (1 piece only)"}'::jsonb
),
(
    'Vistara',
    '09:15',
    '11:45',
    '02 h 30 m',
    7500.00,
    'Non stop',
    'Bengaluru',
    'Delhi',
    '{"baggage": "ADULT", "checkin": "15 Kgs (1 piece only)", "cabin": "7 Kgs (1 piece only)"}'::jsonb
)
ON CONFLICT DO NOTHING;

