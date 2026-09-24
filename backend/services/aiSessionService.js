const { supabase, isSupabaseConfigured } = require("../config/supabase");

function mapSession(s) {
  if (!s) return null;
  return {
    _id: s.id,
    id: s.id,
    userId: s.user_id,
    constraints: s.constraints || {},
    tripPlan: s.trip_plan || null,
    messages: s.messages || [],
    toolCallLog: s.tool_call_log || [],
    metadata: s.metadata || {},
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    toObject: function () {
      const copy = { ...this };
      delete copy.toObject;
      return copy;
    },
  };
}

class AISessionService {
  static async getSession(sessionId, userId) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const { data, error } = await supabase
      .from("ai_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase getSession error:", error.message);
    }
    return mapSession(data);
  }

  static async createSession(userId, sessionData = {}) {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured in environment variables.");
    }
    const { data, error } = await supabase
      .from("ai_sessions")
      .insert({
        user_id: userId,
        constraints: sessionData.constraints || {},
        trip_plan: sessionData.tripPlan || null,
        messages: sessionData.messages || [],
        tool_call_log: sessionData.toolCallLog || [],
        metadata: sessionData.metadata || { totalTokensUsed: 0, totalToolCalls: 0, status: "active" },
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase createSession error:", error.message);
      throw new Error(error.message);
    }
    return mapSession(data);
  }

  static async updateSession(sessionId, userId, updateData) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const { data, error } = await supabase
      .from("ai_sessions")
      .update({
        constraints: updateData.constraints,
        trip_plan: updateData.tripPlan,
        messages: updateData.messages,
        tool_call_log: updateData.toolCallLog,
        metadata: updateData.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Supabase updateSession error:", error.message);
    }
    return mapSession(data);
  }

  static async listUserSessions(userId) {
    if (!isSupabaseConfigured()) {
      return [];
    }
    const { data, error } = await supabase
      .from("ai_sessions")
      .select("id, metadata, constraints, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Supabase listUserSessions error:", error.message);
      return [];
    }
    return (data || []).map(mapSession);
  }

  static async abandonSession(sessionId, userId) {
    if (!isSupabaseConfigured()) {
      return null;
    }
    const { data, error } = await supabase
      .from("ai_sessions")
      .update({ metadata: { status: "abandoned" }, updated_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Supabase abandonSession error:", error.message);
    }
    return mapSession(data);
  }
}

module.exports = AISessionService;
