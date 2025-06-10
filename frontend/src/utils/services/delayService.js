/**
 * Utilitaire pour assurer un délai minimum pour les opérations asynchrones
 */

/**
 * Crée une promesse qui se résout après un délai spécifié
 * @param {number} ms - Délai en millisecondes
 * @returns {Promise} Une promesse qui se résout après le délai
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wrapper pour une promesse qui assure un délai minimum avant sa résolution
 * @param {Promise} promise - La promesse à wrapper
 * @param {number} minDelay - Délai minimum en millisecondes
 * @returns {Promise} Une promesse qui se résout avec le résultat de la promesse d'origine
 *                   mais après au moins le délai minimum spécifié
 */
export async function withMinDelay(promise, minDelay = 1000) {
  // Démarrer un timer
  const timer = delay(minDelay);
  
  // Attendre que la promesse se résolve
  const result = await promise;
  
  // Attendre que le délai minimum soit écoulé
  await timer;
  
  // Retourner le résultat
  return result;
}

export default {
  withMinDelay
};