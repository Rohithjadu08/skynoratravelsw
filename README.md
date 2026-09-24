# SKYNORA TRAVELS

An intelligent travel booking platform built with React, Redux Toolkit, Material UI, ExpressJS and Supabase PostgreSQL.

---

## 🏗️ System Architecture

SKYNORA TRAVELS is structured as a two-tier web application with modular service abstractions:

```
SKYNORA TRAVELS
├── frontend/             # React 17 SPA, Redux Toolkit, Material UI v5
├── backend/              # Node.js, ExpressJS v4 API server
│   ├── config/           # Supabase client initialization
│   ├── services/         # Repository/Service layer for PostgreSQL & database operations
│   ├── controllers/      # Express route handlers (Flights, Hotels)
│   ├── routes/           # Auth, Booked Flights, Booked Hotels, AI routes
│   └── scripts/          # Data migration utilities
└── supabase/             # Reproducible SQL Migrations & Seed data
    ├── migrations/       # Schema definitions (001) & RLS Policies (002)
    └── seed.sql          # Seed data for flights and hotels
```

---

## 💻 Tech Stack

- **Frontend**: React 17, Redux Toolkit, Material UI (MUI v5), React Router v6, CSS Modules
- **Backend**: ExpressJS v4, Node.js, JWT, Bcrypt, Duffel Air API, Twilio OTP
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js`)
- **Security**: Row Level Security (RLS), Helmet security headers, CORS origin protection, Express rate limiting

---

## ⚙️ Supabase Setup & Configuration

1. **Create a Supabase Project**: Head to [Supabase](https://supabase.com) and create a new project.
2. **Apply SQL Migrations**:
   Run the migration files located in `supabase/migrations/` in your Supabase SQL Editor:
   - `001_initial_schema.sql` (Creates `profiles`, `hotels`, `flights`, `booked_hotels`, `booked_flights`, `flight_seat_inventory`, `ai_sessions`)
   - `002_row_level_security.sql` (Enforces Row Level Security policies)
3. **Seed Database**:
   - Run `supabase/seed.sql` in the SQL Editor to populate sample flights and hotels.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=8080
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
JWT_SECRET_KEY=your_jwt_secret_key_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# Supabase Credentials
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_anon_key
SUPABASE_SECRET_KEY=your_supabase_service_role_secret_key

# Optional Integrations
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_SERVICE_SID=
DUFFEL_ACCESS_TOKEN=
ANTHROPIC_API_KEY=
```

### Frontend (`frontend/.env`)
```env
REACT_APP_SUPABASE_URL=https://your-supabase-project.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_anon_key
REACT_APP_ENABLE_PAYMENTS=true
```

---

## 🗄️ Database Schema

- **`profiles`**: Stores user account info, preferences, and saved itineraries.
- **`hotels`**: Catalog listings for hotels (name, ratings, location, country, price, cover image, extra gallery URLs).
- **`flights`**: Catalog listings for flights (airline name, departure/arrival times, duration, fare, stops, flight details).
- **`booked_hotels`**: Hotel reservations made by authenticated users.
- **`booked_flights`**: Flight reservations made by authenticated users with assigned seat numbers and travel dates.
- **`flight_seat_inventory`**: Real-time seat allocation, hold timers (10 min expiry), and booking status per flight/date.
- **`ai_sessions`**: AI Travel Assistant interaction sessions, constraints, and chat memory.

---

## 🔒 Authentication & Row Level Security (RLS)

- **Authentication**: JWT token-based authentication backed by the Supabase `profiles` table. Supports email/password, refresh token rotation, and OTP verification via Twilio.
- **Row Level Security (RLS)**:
  - **Public Data**: `hotels` and `flights` catalogs are publicly readable (`SELECT`).
  - **User Isolation**: `profiles`, `booked_hotels`, `booked_flights`, and `ai_sessions` enforce RLS so users can strictly access only their own records (`id = auth.uid()` / `user_id = auth.uid()`).
  - **Seat Inventory**: Publicly readable map; updates restricted to authorized seat holds.

---

## 🚀 Local Development Guide

### 1. Backend Startup
```bash
cd backend
npm install
npm run serve   # or npm dev
```
The backend API server will run on `http://localhost:8080`.

### 2. Frontend Startup
```bash
cd frontend
npm install
npm start
```
The React frontend application will open on `http://localhost:3000`.

---

## 🔄 Database Migration (MongoDB → Supabase)

If you have existing data in MongoDB and wish to migrate it into Supabase PostgreSQL:

```bash
cd backend
node scripts/migrateToSupabase.js
```

This utility reads existing documents from MongoDB collections (`users`, `hotels`, `flights`) and upserts them cleanly into Supabase PostgreSQL tables.

---

## 🚢 Deployment

1. **Backend Deployment**: Deploy the `backend/` directory to Heroku, Render, or AWS App Runner. Ensure all environment variables (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `JWT_SECRET_KEY`, etc.) are set in environment settings.
2. **Frontend Deployment**: Deploy the `frontend/` directory to Vercel or Netlify. Set `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_PUBLISHABLE_KEY` in deployment environment variables.
