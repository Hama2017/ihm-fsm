/**
 * Utilitaire pour formater les codes d'erreur afin qu'ils correspondent
 * à la structure des fichiers de traduction.
 */

/**
 * Formate un code d'erreur pour qu'il corresponde à la structure des traductions
 * @param {string} code - Code d'erreur brut à formater
 * @param {string} defaultSection - Section par défaut si aucune n'est spécifiée ('auth', 'contract', etc.)
 * @returns {string} Code d'erreur formaté
 */
export const formatErrorCode = (code, defaultSection = 'auth') => {

    console.log(`formatErrorCaaaode(${code}, ${defaultSection})`);
    
    if (!code) return `errors.${defaultSection}.unknown_error`;
    
    // Si le code est déjà complet, le retourner tel quel
    if (code.startsWith('errors.')) {
      return code;
    }
    
    // Si le code contient déjà une section (ex: 'auth.invalid_credentials')
    if (code.includes('.')) {
      return `errors.${code}`;
    }
    
    // Sinon, ajouter le préfixe et la section par défaut
    return `errors.${defaultSection}.${code}`;
  };
  
  /**
   * Extrait un code d'erreur d'une réponse API
   * @param {Error} error - Erreur API
   * @param {string} defaultCode - Code d'erreur par défaut
   * @param {string} defaultSection - Section par défaut si aucune n'est spécifiée
   * @returns {string} Code d'erreur formaté
   */
  export const extractErrorCode = (error, defaultCode = 'unknown_error', defaultSection = 'auth') => {
    let errorCode = defaultCode;
    
    if (error.response?.data) {
      // Format standard d'erreur FastAPI
      if (error.response.data.code) {
        errorCode = error.response.data.code;
      }
      // Format FastAPI avec detail contenant un code
      else if (error.response.data.detail?.code) {
        errorCode = error.response.data.detail.code;
      }
    }
    
    return formatErrorCode(errorCode, defaultSection);
  };
  
  export default {
    formatErrorCode,
    extractErrorCode
  };