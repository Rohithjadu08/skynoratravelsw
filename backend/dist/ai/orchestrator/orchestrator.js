"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelOrchestrator = void 0;
const genai_1 = require("@google/genai");
const tools_1 = require("./tools");
const memory_1 = require("./memory");
const intent_1 = require("./intent");
const flight_agent_1 = require("../agents/flight.agent");
const hotel_agent_1 = require("../agents/hotel.agent");
const weather_agent_1 = require("../agents/weather.agent");
const currency_agent_1 = require("../agents/currency.agent");
const destination_agent_1 = require("../agents/destination.agent");
const restaurant_agent_1 = require("../agents/restaurant.agent");
const transport_agent_1 = require("../agents/transport.agent");
const budget_agent_1 = require("../agents/budget.agent");
const search_agent_1 = require("../agents/search.agent");
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
class TravelOrchestrator {
    constructor(providers) {
        const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set — cannot initialise Travel Orchestrator");
        }
        this.ai = new genai_1.GoogleGenAI({ apiKey });
        this.agents = {
            flight: new flight_agent_1.FlightAgent(providers),
            hotel: new hotel_agent_1.HotelAgent(providers),
            weather: new weather_agent_1.WeatherAgent(providers),
            currency: new currency_agent_1.CurrencyAgent(providers),
            destination: new destination_agent_1.DestinationAgent(providers),
            restaurant: new restaurant_agent_1.RestaurantAgent(providers),
            transport: new transport_agent_1.TransportAgent(providers),
            budget: new budget_agent_1.BudgetAgent(providers),
            search: new search_agent_1.SearchAgent(providers),
        };
    }
    async chat(userMessage, session) {
        // Add user message to session
        let currentSession = (0, memory_1.updateConstraints)(session, (0, intent_1.extractConstraints)(userMessage));
        currentSession = (0, memory_1.addMessageToSession)(currentSession, "user", userMessage);
        const toolCallsUsed = [];
        // Build message history for Gemini
        const history = (0, memory_1.buildGeminiMessageHistory)(currentSession);
        const geminiTools = (0, tools_1.getGeminiTools)();
        const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        const contents = history.map((h) => ({
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
        }
        catch (apiErr) {
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
            const modelParts = [];
            const functionResponseParts = [];
            for (const call of functionCalls) {
                const toolName = call.name || "unknown_tool";
                const startTime = Date.now();
                let toolOutput;
                let status = "success";
                let errorMessage;
                try {
                    toolOutput = await this.executeTool(toolName, (call.args || {}));
                }
                catch (err) {
                    status = "error";
                    errorMessage = err instanceof Error ? err.message : String(err);
                    toolOutput = {
                        available: false,
                        reason: errorMessage,
                        attemptedAt: new Date().toISOString(),
                    };
                }
                const durationMs = Date.now() - startTime;
                const outputObj = toolOutput;
                const record = {
                    id: call.id || `call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    toolName,
                    input: (call.args || {}),
                    output: outputObj,
                    provider: outputObj?.label?.source ?? undefined,
                    retrievedAt: new Date().toISOString(),
                    durationMs,
                    status: outputObj?.available === false ? "unavailable" : status,
                    errorMessage,
                };
                toolCallsUsed.push(record);
                currentSession = (0, memory_1.logToolCall)(currentSession, record);
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
            }
            catch (loopErr) {
                console.warn(`[Gemini Loop] Error:`, loopErr.message);
                break;
            }
        }
        const finalText = response.text || "I have prepared your travel details based on live data.";
        currentSession = (0, memory_1.addMessageToSession)(currentSession, "assistant", finalText, toolCallsUsed);
        return {
            message: finalText,
            session: currentSession,
            toolCallsUsed,
        };
    }
    async executeTool(toolName, input) {
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
exports.TravelOrchestrator = TravelOrchestrator;
//# sourceMappingURL=orchestrator.js.map