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

import { GoogleGenAI } from "@google/genai";
import { getGeminiTools } from "./tools";
import {
  addMessageToSession, buildGeminiMessageHistory, logToolCall, updateConstraints,
} from "./memory";
import { extractConstraints } from "./intent";
import { ConversationSession, ToolCallRecord } from "../types/session";
import { ProviderRegistry } from "../providers/interfaces";
import { FlightAgent } from "../agents/flight.agent";
import { HotelAgent } from "../agents/hotel.agent";
import { WeatherAgent } from "../agents/weather.agent";
import { CurrencyAgent } from "../agents/currency.agent";
import { DestinationAgent } from "../agents/destination.agent";
import { RestaurantAgent } from "../agents/restaurant.agent";
import { TransportAgent } from "../agents/transport.agent";
import { BudgetAgent } from "../agents/budget.agent";
import { SearchAgent } from "../agents/search.agent";

const SYSTEM_PROMPT = `You are SkyNora, an expert AI travel planning assistant. You help users plan complete trips including flights, hotels, restaurants, transport, attractions, weather, currency, and budget.

## Critical Rules You Must Always Follow

1. **NEVER INVENT FACTS**: You must NEVER state any price, schedule, flight time, hotel rate, exchange rate, restaurant rating, weather forecast, or opening hours from your training data. Every such fact MUST come from a tool call result. If you don't have tool data for a claim, say "I don't have live data on that — let me search" and call the appropriate tool.

2. **ALWAYS SOURCE YOUR FACTS**: When you present data from tool calls, briefly note the source (e.g., "According to live flight data from Amadeus..." or "Based on current exchange rates...").

3. **FAIL GRACEFULLY**: If a tool returns unavailable data, tell the user clearly: "I wasn't able to retrieve live [flights/hotels/weather] data right now. Here's what I can tell you..." — never substitute a guess.

4. **DETERMINISTIC MATH**: When you need to calculate totals, always use the tool-returned numbers. Do not attempt mental arithmetic on currency conversions — use get_exchange_rate tool first.

5. **BE SPECIFIC AND HELPFUL**: Give specific, actionable recommendations. If the user has dietary restrictions or preferences, actively filter for them using restaurant dietary options.

## Response Style
- Be warm, enthusiastic, and expert
- Structure long responses with clear sections (✈️ Flights, 🏨 Hotels, 🍽 Food, etc.)
- Always mention the data source inline (e.g., "₹18,500 per person (Amadeus, just fetched)")
- For budgets, always use the Calculation Engine output — say "total estimated cost: ₹X"
- Proactively suggest things the user didn't ask about (visa, weather, dietary options)

## Current Date: ${new Date().toISOString().split("T")[0]}
`;

export interface OrchestratorResponse {
  message: string;
  session: ConversationSession;
  toolCallsUsed: ToolCallRecord[];
}

export class TravelOrchestrator {
  private ai: GoogleGenAI;
  private agents: {
    flight: FlightAgent;
    hotel: HotelAgent;
    weather: WeatherAgent;
    currency: CurrencyAgent;
    destination: DestinationAgent;
    restaurant: RestaurantAgent;
    transport: TransportAgent;
    budget: BudgetAgent;
    search: SearchAgent;
  };

  constructor(providers: ProviderRegistry) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set — cannot initialise Travel Orchestrator");
    }
    this.ai = new GoogleGenAI({ apiKey });

    this.agents = {
      flight: new FlightAgent(providers),
      hotel: new HotelAgent(providers),
      weather: new WeatherAgent(providers),
      currency: new CurrencyAgent(providers),
      destination: new DestinationAgent(providers),
      restaurant: new RestaurantAgent(providers),
      transport: new TransportAgent(providers),
      budget: new BudgetAgent(providers),
      search: new SearchAgent(providers),
    };
  }

  async chat(
    userMessage: string,
    session: ConversationSession
  ): Promise<OrchestratorResponse> {
    // Add user message to session
    let currentSession = updateConstraints(session, extractConstraints(userMessage));
    currentSession = addMessageToSession(currentSession, "user", userMessage);
    const toolCallsUsed: ToolCallRecord[] = [];

    // Build message history for Gemini
    const history = buildGeminiMessageHistory(currentSession);
    const geminiTools = getGeminiTools();
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const contents: any[] = history.map((h) => ({
      role: h.role,
      parts: h.parts,
    }));

    let response;
    try {
      response = await this.ai.models.generateContent({
        model: modelName,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ functionDeclarations: geminiTools }],
        },
        contents,
      });
    } catch (apiErr: any) {
      // Fallback model if gemini-2.5-flash is unavailable on key tier
      console.warn(`[Gemini] Error with model ${modelName}:`, apiErr.message);
      response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ functionDeclarations: geminiTools }],
        },
        contents,
      });
    }

    let loopCount = 0;
    const maxLoops = 5;

    while (response.functionCalls && response.functionCalls.length > 0 && loopCount < maxLoops) {
      loopCount++;
      const functionCalls = response.functionCalls;
      const modelParts: any[] = [];
      const functionResponseParts: any[] = [];

      for (const call of functionCalls) {
        const toolName = call.name || "unknown_tool";
        const startTime = Date.now();
        let toolOutput: unknown;
        let status: ToolCallRecord["status"] = "success";
        let errorMessage: string | undefined;

        try {
          toolOutput = await this.executeTool(toolName, (call.args || {}) as Record<string, unknown>);
        } catch (err: unknown) {
          status = "error";
          errorMessage = err instanceof Error ? err.message : String(err);
          toolOutput = {
            available: false,
            reason: errorMessage,
            attemptedAt: new Date().toISOString(),
          };
        }

        const durationMs = Date.now() - startTime;
        const outputObj = toolOutput as Record<string, unknown>;

        const record: ToolCallRecord = {
          id: call.id || `call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          toolName,
          input: (call.args || {}) as Record<string, unknown>,
          output: outputObj,
          provider: (outputObj?.label as Record<string, string>)?.source ?? undefined,
          retrievedAt: new Date().toISOString(),
          durationMs,
          status: outputObj?.available === false ? "unavailable" : status,
          errorMessage,
        };

        toolCallsUsed.push(record);
        currentSession = logToolCall(currentSession, record);

        modelParts.push({
          functionCall: {
            name: call.name,
            args: call.args || {},
          },
        });

        functionResponseParts.push({
          functionResponse: {
            name: call.name,
            response: { output: toolOutput },
          },
        });
      }

      contents.push({ role: "model", parts: modelParts });
      contents.push({ role: "user", parts: functionResponseParts });

      try {
        response = await this.ai.models.generateContent({
          model: modelName,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            tools: [{ functionDeclarations: geminiTools }],
          },
          contents,
        });
      } catch (loopErr: any) {
        console.warn(`[Gemini Loop] Error:`, loopErr.message);
        break;
      }
    }

    const finalText = response.text || "I have prepared your travel details based on live data.";
    currentSession = addMessageToSession(currentSession, "assistant", finalText, toolCallsUsed);

    return {
      message: finalText,
      session: currentSession,
      toolCallsUsed,
    };
  }

  private async executeTool(
    toolName: string,
    input: Record<string, unknown>
  ): Promise<unknown> {
    switch (toolName) {
      case "search_flights":
        return this.agents.flight.search(input);
      case "search_hotels":
        return this.agents.hotel.search(input);
      case "get_weather":
        return this.agents.weather.getForecast(input);
      case "get_exchange_rate":
        return this.agents.currency.getRate(input);
      case "search_attractions":
        return this.agents.destination.searchAttractions(input);
      case "search_restaurants":
        return this.agents.restaurant.search(input);
      case "get_transport_directions":
        return this.agents.transport.getDirections(input);
      case "search_travel_info":
        return this.agents.search.search(input);
      default:
        return { available: false, reason: `Unknown tool: ${toolName}`, attemptedAt: new Date().toISOString() };
    }
  }
}
