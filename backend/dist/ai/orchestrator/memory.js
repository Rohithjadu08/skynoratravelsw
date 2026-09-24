"use strict";
/**
 * Orchestrator Memory — manages the serialisable TripPlan and session state.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewSession = createNewSession;
exports.addMessageToSession = addMessageToSession;
exports.updateConstraints = updateConstraints;
exports.logToolCall = logToolCall;
exports.buildMessageHistory = buildMessageHistory;
exports.buildGeminiMessageHistory = buildGeminiMessageHistory;
function createNewSession(userId) {
    const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    return {
        id,
        userId,
        createdAt: now,
        updatedAt: now,
        constraints: {},
        messages: [],
        toolCallLog: [],
        metadata: {
            totalTokensUsed: 0,
            totalToolCalls: 0,
            status: "active",
        },
    };
}
function addMessageToSession(session, role, content, toolCalls) {
    const msg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role,
        content,
        timestamp: new Date().toISOString(),
        toolCalls,
    };
    return {
        ...session,
        updatedAt: new Date().toISOString(),
        messages: [...session.messages.slice(-49), msg], // keep last 50
    };
}
function updateConstraints(session, partial) {
    const constraints = { ...session.constraints, ...partial };
    return {
        ...session,
        updatedAt: new Date().toISOString(),
        constraints,
        tripPlan: session.tripPlan
            ? { ...session.tripPlan, constraints, updatedAt: new Date().toISOString(), status: "modified" }
            : createTripPlan(session, constraints),
    };
}
function createTripPlan(session, constraints) {
    const now = new Date().toISOString();
    return { id: `trip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, userId: session.userId, sessionId: session.id, createdAt: now, updatedAt: now, constraints, flights: [], hotels: [], itinerary: [], status: "planning" };
}
function logToolCall(session, record) {
    return {
        ...session,
        toolCallLog: [...session.toolCallLog, record],
        metadata: {
            ...session.metadata,
            totalToolCalls: session.metadata.totalToolCalls + 1,
        },
    };
}
/** Build the Anthropic-format message history from session messages */
function buildMessageHistory(session) {
    return session.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-20) // last 20 turns for context window management
        .map((m) => ({ role: m.role, content: m.content }));
}
/** Build the Gemini-format message history from session messages */
function buildGeminiMessageHistory(session) {
    return session.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-20)
        .map((m) => ({
        role: (m.role === "assistant" ? "model" : "user"),
        parts: [{ text: m.content || "" }],
    }));
}
//# sourceMappingURL=memory.js.map