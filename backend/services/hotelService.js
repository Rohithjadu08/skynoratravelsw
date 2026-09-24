const { supabase, isSupabaseConfigured } = require("../config/supabase");

function mapHotelToResponse(hotel) {
  if (!hotel) return null;
  return {
    _id: hotel.id,
    id: hotel.id,
    name: hotel.name,
    ratings: hotel.ratings,
    location: hotel.location,
    country: hotel.country,
    price: hotel.price,
    cover: hotel.cover,
    extraimageUrl: hotel.extra_image_url || [],
    createdAt: hotel.created_at,
    updatedAt: hotel.updated_at,
    toObject: function () {
      const copy = { ...this };
      delete copy.toObject;
      return copy;
    },
  };
}

class HotelService {
  static async getAllHotels() {
    if (!isSupabaseConfigured()) {
      return [];
    }
    const { data, error } = await supabase.from("hotels").select("*");
    if (error) {
      console.error("Supabase getAllHotels error:", error.message);
      return [];
    }
    return (data || []).map(mapHotelToResponse);
  }

  static async getHotelById(id) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const { data, error } = await supabase.from("hotels").select("*").eq("id", id).maybeSingle();
    if (error && error.code !== "PGRST116") {
      console.error("Supabase getHotelById error:", error.message);
    }
    return mapHotelToResponse(data);
  }
}

module.exports = HotelService;
