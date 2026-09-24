/**
 * Travel Orchestrator — the core AI reasoning loop powered by Google Gemini API (@google/genai).
 *
 * Flow:
 *  1. User message arrives with session context
 *  2. Gemini reasons using getGeminiTools() definitions — decides which agents to invoke
 *  3. We execute the real tool calls (agents → providers → live APIs)
 *  4. Results (with source + retrievedAt) are returned to Gemini
 *  5. Gemini assembles the final response — it cannot hallucinate facts because
 *     it only has what the tool calls returned
 *  6. Session state is updated, response is returned to the user
 */
import { ConversationSession, ToolCallRecord } from "../types/session";
import { ProviderRegistry } from "../providers/interfaces";
export interface OrchestratorResponse {
    message: string;
    session: ConversationSession;
    toolCallsUsed: ToolCallRecord[];
}
export declare class TravelOrchestrator {
    private ai;
    private agents;
    constructor(providers: ProviderRegistry);
    chat(userMessage: string, session: ConversationSession): Promise<OrchestratorResponse>;
    private executeTool;
}
//# sourceMappingURL=orchestrator.d.ts.map