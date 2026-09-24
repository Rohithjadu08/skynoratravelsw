/**
 * Provider Registry Factory
 * Selects real adapters when env vars are present, mock adapters otherwise.
 * Validates required keys at startup and logs what is active.
 */
import { ProviderRegistry } from "./interfaces";
export declare function createProviderRegistry(): ProviderRegistry;
export declare function getProviderRegistry(): ProviderRegistry;
//# sourceMappingURL=registry.d.ts.map