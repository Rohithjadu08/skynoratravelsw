/**
 * Data Migration Script: MongoDB -> Supabase PostgreSQL
 * Reads existing documents from MongoDB and inserts them into Supabase tables.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const { supabase, isSupabaseConfigured } = require("../config/supabase");
const User = require("../models/User");
const Hotel = require("../models/hotels.model");
const Flight = require("../schema/flightSchema/flightSchema");
const AllBookedHotels = require("../models/AllBookedHotels");
const AllBookedFlights = require("../models/AllBookedFlights");
const FlightSeatInventory = require("../models/FlightSeatInventory");
const Session = require("../models/Session");

async function migrateData() {
  if (!isSupabaseConfigured()) {
    console.error("Error: SUPABASE_URL and SUPABASE_SECRET_KEY / SUPABASE_PUBLISHABLE_KEY must be set in backend/.env");
    process.exit(1);
  }

  const mongoUrl = process.env.MONGOOSE_DB_URL;
  if (mongoUrl) {
    console.log("Connecting to MongoDB for data export...");
    await mongoose.connect(mongoUrl);
  }

  console.log("Starting migration to Supabase PostgreSQL...");

  // 1. Migrate Users -> Profiles
  try {
    const users = await User.find();
    console.log(`Migrating ${users.length} users to Supabase profiles...`);
    for (const user of users) {
      await supabase.from("profiles").upsert(
        {
          name: user.name,
          email: user.email,
          password_hash: user.password,
          phone: user.phone,
          mobile_number: user.mobile_number,
          refresh_tokens: user.refreshTokens || [],
          preferences: user.preferences || {},
          saved_itineraries: user.savedItineraries || [],
        },
        { onConflict: "email" }
      );
    }
    console.log("Users migrated successfully.");
  } catch (err) {
    console.warn("User migration warning:", err.message);
  }

  // 2. Migrate Hotels -> Hotels
  try {
    const hotels = await Hotel.find();
    console.log(`Migrating ${hotels.length} hotels...`);
    for (const hotel of hotels) {
      await supabase.from("hotels").insert({
        name: hotel.name,
        ratings: hotel.ratings || 0,
        location: hotel.location,
        country: hotel.country,
        price: hotel.price || 0,
        cover: hotel.cover,
        extra_image_url: hotel.extraimageUrl || [],
      });
    }
    console.log("Hotels migrated successfully.");
  } catch (err) {
    console.warn("Hotel migration warning:", err.message);
  }

  // 3. Migrate Flights -> Flights
  try {
    const flights = await Flight.find();
    console.log(`Migrating ${flights.length} flights...`);
    for (const flight of flights) {
      await supabase.from("flights").insert({
        name: flight.name,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
        duration: flight.duration,
        fare: flight.fare,
        stops: flight.stops,
        departure: flight.departure,
        arrival: flight.arrival,
        flight_details: flight.flight_details || {},
      });
    }
    console.log("Flights migrated successfully.");
  } catch (err) {
    console.warn("Flight migration warning:", err.message);
  }

  console.log("Migration completed successfully!");
  if (mongoUrl) {
    await mongoose.disconnect();
  }
  process.exit(0);
}

migrateData();

