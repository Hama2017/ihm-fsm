import toast from '@/composables/Toast/useToast';
import { useI18n } from '@/composables/i18n/useI18n';

/**
 * Service pour gérer les erreurs de l'application
 * - Centralise la gestion des erreurs
 * - Traduit les codes d'erreur API en messages localisés
 * - Affiche les erreurs via le système de toast
 */
export const ErrorService = {
  /**
   * Gère une erreur d'API en extrayant le code d'erreur et en l'affichant
   * @param {Error} error - L'erreur Axios retournée par l'API
   * @param {String} defaultMessage - Code du message par défaut à utiliser si aucun code spécifique n'est trouvé
   * @param {Boolean} showToast - Si true, affiche automatiquement un toast d'erreur
   * @returns {String} Le message d'erreur traduit
   */
  handleApiError(error, defaultMessage = 'errors.general.internal_error', showToast = true) {
    const { t } = useI18n();
    let errorMessage = '';
    let errorCode = '';
    
    // Extraire le code d'erreur et le message
    if (error.response && error.response.data) {
      const { code, message } = error.response.data;
      
      // Utiliser le code d'erreur s'il existe
      if (code) {
        errorCode = code;
        // Vérifier si le code existe dans nos traductions
        const translationPath = `errors.${code}`;
        errorMessage = t(translationPath);
      } 
      // Sinon utiliser le message renvoyé par l'API
      else if (message) {
        errorMessage = message;
      }
    }
    
    // Si aucun message spécifique n'est trouvé, utiliser le code HTTP
    if (!errorMessage && error.response) {
      switch (error.response.status) {
        case 400:
          errorCode = 'general.bad_request';
          errorMessage = t('errors.general.bad_request');
          break;
        case 401:
          errorCode = 'general.unauthorized';
          errorMessage = t('errors.general.unauthorized');
          break;
        case 403:
          errorCode = 'general.forbidden';
          errorMessage = t('errors.general.forbidden');
          break;
        case 404:
          errorCode = 'general.not_found';
          errorMessage = t('errors.general.not_found');
          break;
        case 409:
          errorCode = 'general.conflict';
          errorMessage = t('errors.general.conflict');
          break;
        case 500:
          errorCode = 'general.internal_error';
          errorMessage = t('errors.general.internal_error');
          break;
        default:
          errorCode = 'general.internal_error';
          errorMessage = t('errors.general.internal_error');
      }
    }
    
    // Si c'est une erreur réseau (pas de réponse du serveur)
    if (error.request && !error.response) {
      errorCode = 'general.network_error';
      errorMessage = t('errors.general.network_error');
    }
    
    // Si c'est une autre erreur JavaScript
    if (!errorMessage) {
      errorCode = defaultMessage;
      errorMessage = t(defaultMessage);
    }
    
    // Afficher le toast si demandé
    if (showToast) {
      toast.error(errorMessage);
    }
    
    // Log l'erreur en développement
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', error);
      console.error('Error Code:', errorCode);
      console.error('Error Message:', errorMessage);
    }
    
    return {
      code: errorCode,
      message: errorMessage
    };
  },
  
  /**
   * Gère une erreur de validation (erreur de formulaire)
   * @param {Object} validationErrors - Erreurs de validation
   * @param {Boolean} showToast - Si true, affiche automatiquement un toast d'erreur
   * @returns {Object} Les messages d'erreur par champ
   */
  handleValidationError(validationErrors, showToast = true) {
    const { t } = useI18n();
    const formattedErrors = {};
    
    // Si nous avons un objet d'erreurs de validation complexe
    if (typeof validationErrors === 'object' && validationErrors !== null) {
      // Parcourir toutes les erreurs et les formater
      Object.keys(validationErrors).forEach(field => {
        const fieldError = validationErrors[field];
        
        if (Array.isArray(fieldError)) {
          formattedErrors[field] = fieldError[0];
        } else {
          formattedErrors[field] = fieldError;
        }
      });
      
      // Afficher la première erreur si demandé
      if (showToast && Object.keys(formattedErrors).length > 0) {
        const firstField = Object.keys(formattedErrors)[0];
        toast.error(formattedErrors[firstField]);
      }
    } else {
      // Si c'est une erreur simple, l'afficher directement
      const errorMessage = t('errors.general.validation_failed');
      
      if (showToast) {
        toast.error(errorMessage);
      }
      
      formattedErrors._global = errorMessage;
    }
    
    return formattedErrors;
  },
  
  /**
   * Gère une erreur générique (non API)
   * @param {Error|String} error - L'erreur à gérer
   * @param {String} defaultMessage - Code du message par défaut
   * @param {Boolean} showToast - Si true, affiche automatiquement un toast d'erreur
   * @returns {String} Le message d'erreur
   */
  handleGenericError(error, defaultMessage = 'errors.general.internal_error', showToast = true) {
    const { t } = useI18n();
    let errorMessage = '';
    
    // Déterminer le message d'erreur
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      // Vérifier si la chaîne est un code d'erreur que nous pouvons traduire
      if (error.startsWith('errors.')) {
        errorMessage = t(error);
      } else {
        errorMessage = error;
      }
    } else {
      errorMessage = t(defaultMessage);
    }
    
    // Afficher le toast si demandé
    if (showToast) {
      toast.error(errorMessage);
    }
    
    // Log l'erreur en développement
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error:', error);
    }
    
    return errorMessage;
  }
};

export default ErrorService;