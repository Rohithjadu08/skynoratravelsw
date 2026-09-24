/**
 * Tool definitions passed to Claude's tools array.
 * These are the structured function signatures Claude uses to decide which agent to call.
 * The LLM reasons about WHICH tool to call; the agents actually execute it.
 */
import Anthropic from "@anthropic-ai/sdk";
export declare const TRAVEL_TOOLS: Anthropic.Tool[];
import { FunctionDeclaration } from "@google/genai";
export declare function getGeminiTools(): FunctionDeclaration[];
//# sourceMappingURL=tools.d.ts.map