/** Score exact positions in the five-step recovery sequence. */
export function evaluateRescueOrder(chosen: readonly string[], required: readonly string[]) {
  const complete = required.length === 5
    && new Set(required).size === required.length
    && chosen.length === required.length
    && new Set(chosen).size === chosen.length
    && required.every(id => chosen.includes(id));
  const correct = complete ? required.filter((id, position) => chosen[position] === id).length : 0;
  return { passed: complete && correct >= 4, correct, total: required.length };
}
