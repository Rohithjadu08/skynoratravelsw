const { createClient } = require("@supabase/supabase-js");
const logger = require("../utils/logger");

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    logger.info("Supabase client initialized successfully");
  } catch (err) {
    logger.error("Failed to initialize Supabase client:", err.message);
  }
} else {
  logger.warn("SUPABASE_URL or SUPABASE_KEY missing in environment. Supabase client is null.");
}

module.exports = {
  supabase,
  isSupabaseConfigured: () => !!supabase,
};

