const { supabase, isSupabaseConfigured } = require("../config/supabase");

function mapFlightToResponse(flight) {
  if (!flight) return null;
  return {
    _id: flight.id,
    id: flight.id,
    name: flight.name,
    departure_time: flight.departure_time,
    arrival_time: flight.arrival_time,
    duration: flight.duration,
    fare: flight.fare,
    stops: flight.stops,
    departure: flight.departure,
    arrival: flight.arrival,
    flight_details: flight.flight_details || {},
    createdAt: flight.created_at,
    updatedAt: flight.updated_at,
    toObject: function () {
      const copy = { ...this };
      delete copy.toObject;
      return copy;
    },
  };
}

function mapSeatToResponse(seat) {
  if (!seat) return null;
  return {
    _id: seat.id,
    id: seat.id,
    flight: seat.flight_id,
    travelDate: seat.travel_date,
    seatNumber: seat.seat_number,
    status: seat.status,
    heldBy: seat.held_by,
    holdExpiresAt: seat.hold_expires_at,
    booking: seat.booking_id,
  };
}

class FlightService {
  static async getAllFlights() {
    if (!isSupabaseConfigured()) {
      return [];
    }
    const { data, error } = await supabase.from("flights").select("*");
    if (error) {
      console.error("Supabase getAllFlights error:", error.message);
      return [];
    }
    return (data || []).map(mapFlightToResponse);
  }

  static async getFlightById(id) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const { data, error } = await supabase.from("flights").select("*").eq("id", id).maybeSingle();
    if (error && error.code !== "PGRST116") {
      console.error("Supabase getFlightById error:", error.message);
    }
    return mapFlightToResponse(data);
  }

  static async createFlight(flightData) {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured in environment variables.");
    }
    const { data, error } = await supabase
      .from("flights")
      .insert({
        name: flightData.name,
        departure_time: flightData.departure_time,
        arrival_time: flightData.arrival_time,
        duration: flightData.duration,
        fare: flightData.fare,
        stops: flightData.stops,
        departure: flightData.departure,
        arrival: flightData.arrival,
        flight_details: flightData.flight_details || {},
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase createFlight error:", error.message);
      throw new Error(error.message);
    }
    return mapFlightToResponse(data);
  }

  static async getSeats(flightId, travelDate) {
    if (!isSupabaseConfigured()) {
      return [];
    }
    const { data, error } = await supabase
      .from("flight_seat_inventory")
      .select("*")
      .eq("flight_id", flightId)
      .eq("travel_date", travelDate)
      .order("seat_number", { ascending: true });

    if (error) {
      console.error("Supabase getSeats error:", error.message);
      return [];
    }
    return (data || []).map(mapSeatToResponse);
  }
}

module.exports = FlightService;
