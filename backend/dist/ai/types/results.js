"use strict";
/**
 * Result types returned by specialized agents.
 * All agent results are either a typed success payload or DataUnavailable.
 * Agents NEVER guess — they return DataUnavailable if a provider call fails.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDataUnavailable = isDataUnavailable;
function isDataUnavailable(val) {
    return typeof val === "object" && val !== null && val.available === false;
}
//# sourceMappingURL=results.js.map