/**
 * Lightweight, deterministic constraint extraction.
 *
 * This intentionally only captures values explicitly stated by the traveller.
 * It does not infer airport codes, dates, prices, or destinations from model
 * knowledge; providers and the orchestrator remain responsible for those.
 */
import { Constraint } from "../types/trip";
export declare function extractConstraints(message: string): Partial<Constraint>;
//# sourceMappingURL=intent.d.ts.map