const { supabase, isSupabaseConfigured } = require("../config/supabase");

function mapProfileToUser(profile) {
  if (!profile) return null;
  return {
    _id: profile.id,
    id: profile.id,
    name: profile.name,
    email: profile.email,
    password: profile.password_hash,
    phone: profile.phone || profile.mobile_number,
    mobile_number: profile.mobile_number || profile.phone,
    refreshTokens: profile.refresh_tokens || [],
    preferences: profile.preferences || {},
    savedItineraries: profile.saved_itineraries || [],
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    toJSON: function () {
      const copy = { ...this };
      delete copy.password;
      delete copy.refreshTokens;
      delete copy.toJSON;
      return copy;
    },
  };
}

class UserService {
  static async findByIdentifier(identifier) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`email.eq.${identifier},phone.eq.${identifier},mobile_number.eq.${identifier}`)
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase findByIdentifier error:", error.message);
    }
    return mapProfileToUser(data);
  }

  static async findById(id) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase findById error:", error.message);
    }
    return mapProfileToUser(data);
  }

  static async createUser({ name, email, passwordHash, phone, mobile_number }) {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured in environment variables.");
    }
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        name,
        email,
        password_hash: passwordHash,
        phone: phone || mobile_number,
        mobile_number: mobile_number || phone,
        refresh_tokens: [],
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase createUser error:", error.message);
      throw new Error(error.message);
    }
    return mapProfileToUser(data);
  }

  static async updateUser(id, updateFields) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const fieldsToUpdate = {};
    if (updateFields.name !== undefined) fieldsToUpdate.name = updateFields.name;
    if (updateFields.email !== undefined) fieldsToUpdate.email = updateFields.email;
    if (updateFields.phone !== undefined) fieldsToUpdate.phone = updateFields.phone;
    if (updateFields.mobile_number !== undefined) fieldsToUpdate.mobile_number = updateFields.mobile_number;
    if (updateFields.preferences !== undefined) fieldsToUpdate.preferences = updateFields.preferences;
    fieldsToUpdate.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(fieldsToUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase updateUser error:", error.message);
    }
    return mapProfileToUser(data);
  }

  static async addRefreshToken(id, refreshToken) {
    const user = await this.findById(id);
    if (!user) return;

    const refreshTokens = user.refreshTokens || [];
    refreshTokens.push(refreshToken);

    if (isSupabaseConfigured()) {
      await supabase
        .from("profiles")
        .update({ refresh_tokens: refreshTokens })
        .eq("id", id);
    }
  }

  static async removeRefreshToken(id, refreshToken) {
    const user = await this.findById(id);
    if (!user) return;

    const refreshTokens = (user.refreshTokens || []).filter((t) => t !== refreshToken);

    if (isSupabaseConfigured()) {
      await supabase
        .from("profiles")
        .update({ refresh_tokens: refreshTokens })
        .eq("id", id);
    }
  }
}

module.exports = UserService;
