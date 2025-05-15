/**
 * Convertit les clés camelCase → snake_case (non récursif)
 * Exemple : firstName → first_name
 */
export function toSnakeCase(obj) {
  const result = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

/**
 * Convertit les clés snake_case → camelCase (non récursif)
 * Exemple : first_name → firstName
 */
export function toCamelCase(obj) {
  const result = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}
