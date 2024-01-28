/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (!obj) return undefined;

  const entries = Object.entries(obj);
  const swappedEntries = entries.map(entry => entry.reverse());

  return Object.fromEntries(swappedEntries);
}
