const { supabase, isSupabaseConfigured } = require("../config/supabase");
const FlightService = require("./flightService");

function mapHotelBooking(b) {
  if (!b) return null;
  return {
    _id: b.id,
    id: b.id,
    user: b.user_id,
    hotel: b.hotel_id,
    name: b.name,
    location: b.location,
    country: b.country,
    price: b.price,
    cover: b.cover,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  };
}

function mapFlightBooking(b) {
  if (!b) return null;
  return {
    _id: b.id,
    id: b.id,
    user: b.user_id,
    flight: b.flight_id,
    name: b.name,
    departure_time: b.departure_time,
    arrival_time: b.arrival_time,
    duration: b.duration,
    fare: b.fare,
    stops: b.stops,
    departure: b.departure,
    arrival: b.arrival,
    seatNumber: b.seat_number,
    travelDate: b.travel_date,
    bookingStatus: b.booking_status || "CONFIRMED",
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  };
}

class BookingService {
  // --- HOTEL BOOKINGS ---
  static async getUserHotelBookings(userId) {
    if (!isSupabaseConfigured()) {
      return [];
    }
    const { data, error } = await supabase
      .from("booked_hotels")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase getUserHotelBookings error:", error.message);
      return [];
    }
    return (data || []).map(mapHotelBooking);
  }

  static async getHotelBookingById(userId, bookingId) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const { data, error } = await supabase
      .from("booked_hotels")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase getHotelBookingById error:", error.message);
    }
    return mapHotelBooking(data);
  }

  static async createHotelBooking(userId, bookingData) {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured in environment variables.");
    }
    const { data, error } = await supabase
      .from("booked_hotels")
      .insert({
        user_id: userId,
        hotel_id: bookingData.hotelId || bookingData.hotel || null,
        name: bookingData.name,
        location: bookingData.location,
        country: bookingData.country || "India",
        price: bookingData.price,
        cover: bookingData.cover || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase createHotelBooking error:", error.message);
      throw new Error(error.message);
    }
    return mapHotelBooking(data);
  }

  static async cancelHotelBooking(userId, bookingId) {
    if (!isSupabaseConfigured()) {
      return false;
    }
    const { data, error } = await supabase
      .from("booked_hotels")
      .delete()
      .eq("id", bookingId)
      .eq("user_id", userId)
      .select();

    if (error) {
      console.error("Supabase cancelHotelBooking error:", error.message);
      return false;
    }
    return data && data.length > 0;
  }

  // --- FLIGHT BOOKINGS ---
  static async getUserFlightBookings(userId) {
    if (!isSupabaseConfigured()) {
      return [];
    }
    const { data, error } = await supabase
      .from("booked_flights")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase getUserFlightBookings error:", error.message);
      return [];
    }
    return (data || []).map(mapFlightBooking);
  }

  static async getFlightBookingById(userId, bookingId) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const { data, error } = await supabase
      .from("booked_flights")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase getFlightBookingById error:", error.message);
    }
    return mapFlightBooking(data);
  }

  static async createFlightBooking(userId, bookingData) {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured in environment variables.");
    }
    const { data, error } = await supabase
      .from("booked_flights")
      .insert({
        user_id: userId,
        flight_id: bookingData.flightId || bookingData._id || null,
        name: bookingData.name,
        departure_time: bookingData.departure_time,
        arrival_time: bookingData.arrival_time,
        duration: bookingData.duration,
        fare: bookingData.fare,
        stops: bookingData.stops,
        departure: bookingData.departure,
        arrival: bookingData.arrival,
        seat_number: bookingData.seatNumber || null,
        travel_date: bookingData.travelDate || null,
        booking_status: bookingData.bookingStatus || "CONFIRMED",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase createFlightBooking error:", error.message);
      throw new Error(error.message);
    }
    return mapFlightBooking(data);
  }

  static async holdSeat(userId, flightId, travelDate, seatNumber) {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured in environment variables.");
    }
    const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { data: existingSeat } = await supabase
      .from("flight_seat_inventory")
      .select("*")
      .eq("flight_id", flightId)
      .eq("travel_date", travelDate)
      .eq("seat_number", seatNumber)
      .maybeSingle();

    if (!existingSeat) {
      const { data: newSeat, error } = await supabase
        .from("flight_seat_inventory")
        .insert({
          flight_id: flightId,
          travel_date: travelDate,
          seat_number: seatNumber,
          status: "HELD",
          held_by: userId,
          hold_expires_at: holdExpiresAt,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return {
        _id: newSeat.id,
        id: newSeat.id,
        flight: newSeat.flight_id,
        travelDate: newSeat.travel_date,
        seatNumber: newSeat.seat_number,
        status: newSeat.status,
        heldBy: newSeat.held_by,
        holdExpiresAt: newSeat.hold_expires_at,
      };
    } else if (
      existingSeat.status === "AVAILABLE" ||
      (existingSeat.status === "HELD" && existingSeat.hold_expires_at && new Date(existingSeat.hold_expires_at) <= new Date())
    ) {
      const { data: updatedSeat, error } = await supabase
        .from("flight_seat_inventory")
        .update({
          status: "HELD",
          held_by: userId,
          hold_expires_at: holdExpiresAt,
        })
        .eq("id", existingSeat.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return {
        _id: updatedSeat.id,
        id: updatedSeat.id,
        flight: updatedSeat.flight_id,
        travelDate: updatedSeat.travel_date,
        seatNumber: updatedSeat.seat_number,
        status: updatedSeat.status,
        heldBy: updatedSeat.held_by,
        holdExpiresAt: updatedSeat.hold_expires_at,
      };
    } else if (existingSeat.status === "HELD") {
      if (existingSeat.held_by !== userId) {
        throw new Error(`Seat ${seatNumber} is currently held by another user`);
      }
      return {
        _id: existingSeat.id,
        id: existingSeat.id,
        flight: existingSeat.flight_id,
        travelDate: existingSeat.travel_date,
        seatNumber: existingSeat.seat_number,
        status: existingSeat.status,
        heldBy: existingSeat.held_by,
        holdExpiresAt: existingSeat.hold_expires_at,
      };
    } else if (existingSeat.status === "BOOKED") {
      throw new Error(`Seat ${seatNumber} is already booked`);
    }
  }

  static async confirmFlightBooking(userId, flightId, travelDate, seatNumber, fare) {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured in environment variables.");
    }
    const flight = await FlightService.getFlightById(flightId);
    if (!flight) {
      throw new Error("Flight not found");
    }

    const { data: seat } = await supabase
      .from("flight_seat_inventory")
      .select("*")
      .eq("flight_id", flightId)
      .eq("travel_date", travelDate)
      .eq("seat_number", seatNumber)
      .eq("status", "HELD")
      .eq("held_by", userId)
      .maybeSingle();

    if (!seat) {
      throw new Error("Seat is not held by you or has expired");
    }

    const { data: booking, error: bookingErr } = await supabase
      .from("booked_flights")
      .insert({
        user_id: userId,
        flight_id: flightId,
        name: flight.name,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
        duration: flight.duration,
        fare: fare || flight.fare,
        stops: flight.stops,
        departure: flight.departure,
        arrival: flight.arrival,
        seat_number: seatNumber,
        travel_date: travelDate,
        booking_status: "CONFIRMED",
      })
      .select()
      .single();

    if (bookingErr) throw new Error(bookingErr.message);

    await supabase
      .from("flight_seat_inventory")
      .update({
        status: "BOOKED",
        hold_expires_at: null,
        booking_id: booking.id,
      })
      .eq("id", seat.id);

    return { booking: mapFlightBooking(booking), seat };
  }

  static async cancelFlightBooking(userId, bookingId) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const { data: booking } = await supabase
      .from("booked_flights")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!booking) return null;

    const { data: updatedBooking, error } = await supabase
      .from("booked_flights")
      .update({ booking_status: "CANCELLED" })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) return null;

    if (booking.seat_number && booking.travel_date) {
      await supabase
        .from("flight_seat_inventory")
        .update({
          status: "AVAILABLE",
          held_by: null,
          hold_expires_at: null,
          booking_id: null,
        })
        .eq("flight_id", booking.flight_id)
        .eq("travel_date", booking.travel_date)
        .eq("seat_number", booking.seat_number);
    }

    return mapFlightBooking(updatedBooking);
  }
}

module.exports = BookingService;
