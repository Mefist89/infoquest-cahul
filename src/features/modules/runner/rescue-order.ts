/** All recovery actions are required; changing the password must come first. */
export function evaluateRescueOrder(chosen: readonly string[], required: readonly string[]) {
  const complete = required.length === 5
    && new Set(required).size === required.length
    && chosen.length === required.length
    && new Set(chosen).size === chosen.length
    && required.every(id => chosen.includes(id));
  const passed = complete && chosen[0] === "password";
  return { passed, correct: passed ? required.length : 0, total: required.length };
}
