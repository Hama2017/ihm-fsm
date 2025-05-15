/**
 * Liste centralisée des messages d'erreur par code.
 */
export const errorMessages = {
    auth_email_already_used: "Cet email est déjà utilisé.",
    invalid_credentials: "Identifiants incorrects.",
    missing_tokens: "Les jetons d'authentification sont manquants.",
    invalid_token_payload: "Le jeton est invalide.",
    invalid_token: "Jeton invalide ou expiré.",
    invalid_refresh_token: "Jeton de rafraîchissement invalide.",
    user_not_found: "Utilisateur introuvable.",
    auth_invalid_credentials: "Le mot de passe actuel est incorrect.",
    password_update_failed: "Impossible de mettre à jour le mot de passe.",
    unknown_error: "Une erreur inattendue est survenue."
  };
  
  /**
   * Convertit un code d’erreur en message utilisateur.
   * @param {string} code - Code retourné par l’API (ex: 'email_already_used')
   * @returns {string} - Message d’erreur lisible
   */
  export function getErrorMessage(code) {
    return errorMessages[code] || errorMessages.unknown_error;
  }
  