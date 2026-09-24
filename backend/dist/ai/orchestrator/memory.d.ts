/**
 * Orchestrator Memory — manages the serialisable TripPlan and session state.
 */
import { ConversationSession, ToolCallRecord, ConversationMessage } from "../types/session";
import { Constraint } from "../types/trip";
export declare function createNewSession(userId: string): ConversationSession;
export declare function addMessageToSession(session: ConversationSession, role: ConversationMessage["role"], content: string, toolCalls?: ToolCallRecord[]): ConversationSession;
export declare function updateConstraints(session: ConversationSession, partial: Partial<Constraint>): ConversationSession;
export declare function logToolCall(session: ConversationSession, record: ToolCallRecord): ConversationSession;
/** Build the Anthropic-format message history from session messages */
export declare function buildMessageHistory(session: ConversationSession): Array<{
    role: "user" | "assistant";
    content: string;
}>;
/** Build the Gemini-format message history from session messages */
export declare function buildGeminiMessageHistory(session: ConversationSession): Array<{
    role: "user" | "model";
    parts: Array<{
        text: string;
    }>;
}>;
//# sourceMappingURL=memory.d.ts.map