import toast from '@/composables/Toast/useToast';
import { useI18n } from '@/composables/i18n/useI18n';

/**
 * Service pour gérer les erreurs de l'application
 * - Centralise la gestion des erreurs
 * - Utilise le système de toast pour afficher les erreurs
 * - Intègre l'internationalisation des messages d'erreur
 */
export const ErrorService = {
  /**
   * Gérer une erreur API
   * @param {Error} error L'erreur à traiter
   * @param {String} defaultMessage Message par défaut si aucun message d'erreur spécifique n'est trouvé
   * @param {boolean} logError Si true, enregistre l'erreur dans la console
   */
  handleApiError(error, defaultMessage = 'errors.unknownError', logError = true) {
    if (logError) {
      console.error('API Error:', error);
    }
    
    const { t } = useI18n();
    let errorMessage = t(defaultMessage);
    let errorDetails = null;
    
    // Déterminer le message d'erreur approprié
    if (error.response) {
      // Structure de l'erreur API
      const apiError = error.response.data;
      
      // Extraire le message d'erreur spécifique
      if (apiError?.detail) {
        if (typeof apiError.detail === 'string') {
          errorMessage = apiError.detail;
        } else if (apiError.detail?.code) {
          // Utiliser le code d'erreur pour obtenir une traduction
          const errorCode = `errors.${apiError.detail.code}`;
          errorMessage = t(errorCode, apiError.detail.params || {});
          errorDetails = apiError.detail.message;
        }
      } else if (apiError?.message) {
        errorMessage = apiError.message;
      }
      
      // Si aucun message spécifique n'est trouvé, utiliser un message basé sur le code HTTP
      if (errorMessage === t(defaultMessage)) {
        switch (error.response.status) {
          case 400:
            errorMessage = t('errors.badRequest');
            break;
          case 401:
            errorMessage = t('errors.unauthorized');
            break;
          case 403:
            errorMessage = t('errors.forbidden');
            break;
          case 404:
            errorMessage = t('errors.notFound');
            break;
          case 409:
            errorMessage = t('errors.conflict');
            break;
          case 422:
            errorMessage = t('errors.validationFailed');
            break;
          case 429:
            errorMessage = t('errors.tooManyRequests');
            break;
          case 500:
            errorMessage = t('errors.serverError');
            break;
          case 503:
            errorMessage = t('errors.serviceUnavailable');
            break;
          default:
            if (error.response.status >= 500) {
              errorMessage = t('errors.serverError');
            } else if (error.response.status >= 400) {
              errorMessage = t('errors.clientError');
            }
        }
      }
    } else if (error.request) {
      // La requête a été envoyée mais aucune réponse n'a été reçue
      errorMessage = t('errors.noResponse');
    } else if (error.message) {
      // Erreur lors de la configuration de la requête
      errorMessage = error.message;
    }
    
    // Afficher le toast d'erreur
    toast.error(errorMessage, {
      duration: 6000, // Durée plus longue pour les erreurs
      ...(errorDetails && { description: errorDetails }) // Ajouter les détails si disponibles
    });
    
    // Retourner le message d'erreur au cas où le code appelant voudrait le traiter
    return errorMessage;
  },
  
  /**
   * Gérer une erreur de validation de formulaire
   * @param {Object} validationErrors Objet contenant les erreurs de validation
   * @param {String} defaultMessage Message par défaut si aucun message d'erreur spécifique n'est trouvé
   */
  handleValidationError(validationErrors, defaultMessage = 'errors.validationFailed') {
    const { t } = useI18n();
    
    // Si nous avons un objet d'erreurs de validation complexe
    if (typeof validationErrors === 'object' && validationErrors !== null) {
      // Récupérer le premier message d'erreur
      const firstField = Object.keys(validationErrors)[0];
      if (firstField && validationErrors[firstField]) {
        let errorMessage = Array.isArray(validationErrors[firstField])
          ? validationErrors[firstField][0]
          : validationErrors[firstField];
          
        toast.error(errorMessage);
        return errorMessage;
      }
    }
    
    // Fallback sur le message par défaut
    const errorMessage = t(defaultMessage);
    toast.error(errorMessage);
    return errorMessage;
  },
  
  /**
   * Gérer une erreur générique
   * @param {Error|String} error L'erreur à traiter
   * @param {String} defaultMessage Message par défaut si aucun message d'erreur spécifique n'est trouvé
   * @param {boolean} logError Si true, enregistre l'erreur dans la console
   */
  handleError(error, defaultMessage = 'errors.unknownError', logError = true) {
    if (logError) {
      console.error('Error:', error);
    }
    
    const { t } = useI18n();
    let errorMessage = '';
    
    if (error instanceof Error) {
      errorMessage = error.message || t(defaultMessage);
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = t(defaultMessage);
    }
    
    toast.error(errorMessage);
    return errorMessage;
  },
  
  /**
   * Gère les différents types d'erreurs possibles
   * @param {Error|Object|String} error L'erreur à traiter
   * @param {String} defaultMessage Message par défaut
   * @param {boolean} logError Si true, enregistre l'erreur dans la console
   */
  handle(error, defaultMessage = 'errors.unknownError', logError = true) {
    // Si c'est une erreur API (avec response ou request)
    if (error && (error.response || error.request)) {
      return this.handleApiError(error, defaultMessage, logError);
    }
    
    // Si c'est une erreur de validation
    if (error && typeof error === 'object' && !Array.isArray(error) && !(error instanceof Error)) {
      return this.handleValidationError(error, defaultMessage);
    }
    
    // Sinon, c'est une erreur générique
    return this.handleError(error, defaultMessage, logError);
  }
};

export default ErrorService;