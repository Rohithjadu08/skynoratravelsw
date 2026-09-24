/**
 * AI Travel Agent API Routes
 * POST /ai/chat         — main chat endpoint (optional auth for guest & registered users)
 * GET  /ai/session/:id  — retrieve session
 * DELETE /ai/session/:id — clear session
 * POST /ai/session/new  — create new session
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const AISessionService = require("../services/aiSessionService");

// Optional auth helper: allows logged-in users to persist to profile while letting guests use AI chat seamlessly
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const customToken = req.headers.authtoken || req.headers.authToken;

  let token =
    (typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null) ||
    (typeof customToken === "string" ? customToken : null);

  // If token is wrapped in quotes from JSON.stringify
  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded.user;
      return next();
    } catch (err) {
      // If token expired/invalid, fallback to guest mode
    }
  }

  // Fallback for guest users
  const guestId = req.body.guestId || req.headers["x-guest-id"] || "00000000-0000-0000-0000-000000000000";
  req.user = { id: guestId };
  next();
};

let orchestratorInstance = null;
let providerRegistry = null;

function getOrchestrator() {
  if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return null;
  }
  if (!orchestratorInstance) {
    try {
      const { getProviderRegistry } = require("../dist/ai/providers/registry");
      const { TravelOrchestrator } = require("../dist/ai/orchestrator/orchestrator");
      providerRegistry = getProviderRegistry();
      orchestratorInstance = new TravelOrchestrator(providerRegistry);
    } catch (err) {
      console.error("[AI] Failed to load orchestrator:", err.message);
      return null;
    }
  }
  return orchestratorInstance;
}

function getOrchestratorDirect() {
  if (!orchestratorInstance) {
    try {
      require("ts-node/register");
      const { getProviderRegistry } = require("../ai/providers/registry.ts");
      const { TravelOrchestrator } = require("../ai/orchestrator/orchestrator.ts");
      providerRegistry = getProviderRegistry();
      orchestratorInstance = new TravelOrchestrator(providerRegistry);
    } catch {
      return null;
    }
  }
  return orchestratorInstance;
}

function getMemoryModule() {
  try {
    return require("../dist/ai/orchestrator/memory");
  } catch (err) {
    try {
      require("ts-node/register");
      return require("../ai/orchestrator/memory.ts");
    } catch (tsErr) {
      console.error("[AI] Failed to load memory module:", err.message, tsErr.message);
      throw tsErr;
    }
  }
}

/**
 * POST /ai/chat
 */
router.post("/chat", optionalAuth, async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ success: false, message: "message is required" });
  }

  if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      success: false,
      message: "AI service is not configured. Please add GEMINI_API_KEY to the server environment.",
      hint: "Add GEMINI_API_KEY=your_key_here to backend/.env",
    });
  }

  try {
    let session = null;

    if (sessionId) {
      session = await AISessionService.getSession(sessionId, req.user.id);
    }

    if (!session) {
      const { createNewSession } = getMemoryModule();
      session = createNewSession(req.user.id);
    }

    let orchestrator = getOrchestrator() || getOrchestratorDirect();
    if (!orchestrator) {
      return res.status(503).json({ success: false, message: "Failed to initialise AI orchestrator" });
    }

    const start = Date.now();
    const result = await orchestrator.chat(message.trim(), session);
    const durationMs = Date.now() - start;

    const updatedSession = result.session;
    let savedSession = null;
    try {
      if (session.id || session._id) {
        const targetId = session.id || session._id;
        savedSession = await AISessionService.updateSession(targetId, req.user.id, {
          constraints: updatedSession.constraints,
          tripPlan: updatedSession.tripPlan,
          messages: updatedSession.messages,
          toolCallLog: updatedSession.toolCallLog,
          metadata: updatedSession.metadata,
        });
      } else {
        savedSession = await AISessionService.createSession(req.user.id, {
          constraints: updatedSession.constraints,
          tripPlan: updatedSession.tripPlan,
          messages: updatedSession.messages,
          toolCallLog: updatedSession.toolCallLog,
          metadata: updatedSession.metadata,
        });
      }
    } catch (saveErr) {
      console.warn("Session save warning (guest session):", saveErr.message);
    }

    const activeSessionId = savedSession ? (savedSession.id || savedSession._id) : (session.id || session._id);

    return res.status(200).json({
      success: true,
      data: {
        message: result.message,
        sessionId: activeSessionId,
        toolCallsUsed: (result.toolCallsUsed || []).map((t) => ({
          tool: t.toolName,
          provider: t.provider,
          status: t.status,
          retrievedAt: t.retrievedAt,
          durationMs: t.durationMs,
        })),
        constraints: updatedSession.constraints,
        durationMs,
      },
    });
  } catch (err) {
    console.error("[AI Chat] Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "An error occurred while processing your request",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
});

/**
 * POST /ai/session/new
 */
router.post("/session/new", authMiddleware, async (req, res) => {
  try {
    const session = await AISessionService.createSession(req.user.id);
    return res.status(201).json({ success: true, data: { sessionId: session.id || session._id } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create session" });
  }
});

/**
 * GET /ai/session/:id
 */
router.get("/session/:id", authMiddleware, async (req, res) => {
  try {
    const session = await AISessionService.getSession(req.params.id, req.user.id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    return res.status(200).json({ success: true, data: session });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to retrieve session" });
  }
});

/**
 * GET /ai/sessions
 */
router.get("/sessions", authMiddleware, async (req, res) => {
  try {
    const sessions = await AISessionService.listUserSessions(req.user.id);
    return res.status(200).json({ success: true, data: sessions });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to list sessions" });
  }
});

/**
 * DELETE /ai/session/:id
 */
router.delete("/session/:id", authMiddleware, async (req, res) => {
  try {
    const session = await AISessionService.abandonSession(req.params.id, req.user.id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    return res.status(200).json({ success: true, message: "Session cleared" });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to clear session" });
  }
});

module.exports = router;
