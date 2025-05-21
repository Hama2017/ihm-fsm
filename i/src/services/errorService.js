import { useToast } from '@/composables/Toast/useToast';
import { useI18n } from '@/composables/i18n/useI18n';

/**
 * Service de gestion des erreurs avec support d'internationalisation.
 * Centralise le traitement des erreurs API et la conversion des codes d'erreur en messages localisés.
 */
const ErrorService = {
  /**
   * Gère une erreur d'API et la convertit en message localisé.
   * @param {Error} error - Erreur provenant d'une requête API
   * @param {string} defaultCode - Code de message par défaut si aucun code spécifique n'est trouvé
   * @param {boolean} showToast - Si true, affiche automatiquement un toast d'erreur
   * @returns {Object} Objet contenant le code d'erreur et le message traduit
   */
  handleApiError(error, defaultCode = 'errors.general.internal_error', showToast = true) {
    const { t } = useI18n();
    const toast = useToast();
    
    let errorCode = '';
    let errorMessage = '';
    
    // Extraire le code d'erreur de la réponse API
    if (error.response && error.response.data) {
      // Format du backend FastAPI qui renvoie les erreurs avec un champ "code"
      if (error.response.data.code) {
        errorCode = error.response.data.code;
        
        // Essayer de traduire directement le code
        const directTranslation = t(`errors.${errorCode}`);
        
        // Vérifier si la traduction existe
        if (directTranslation !== `errors.${errorCode}`) {
          errorMessage = directTranslation;
        }
      }
      // Si le backend renvoie un detail.code (cas des erreurs d'authentification)
      else if (error.response.data.detail && error.response.data.detail.code) {
        errorCode = error.response.data.detail.code;
        
        // Pour les codes d'authentification, préfixer avec "auth."
        if (!errorCode.includes('.')) {
          errorCode = `auth.${errorCode}`;
        }
        
        const authTranslation = t(`errors.${errorCode}`);
        if (authTranslation !== `errors.${errorCode}`) {
          errorMessage = authTranslation;
        }
      }
      // Si le backend renvoie un message directement
      else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      // Si le backend renvoie un detail sous forme de chaîne
      else if (typeof error.response.data.detail === 'string') {
        errorMessage = error.response.data.detail;
      }
    }
    
    // Si aucun message n'a été trouvé, utiliser le code HTTP
    if (!errorMessage) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorCode = 'general.bad_request';
            errorMessage = t('errors.general.bad_request');
            break;
          case 401:
            errorCode = 'auth.missing_token';
            errorMessage = t('errors.auth.missing_token');
            break;
          case 403:
            errorCode = 'general.forbidden';
            errorMessage = t('errors.general.forbidden');
            break;
          case 404:
            errorCode = 'general.not_found';
            errorMessage = t('errors.general.not_found');
            break;
          case 422:
            errorCode = 'general.validation_failed';
            errorMessage = t('errors.general.validation_failed');
            break;
          case 500:
            errorCode = 'general.internal_error';
            errorMessage = t('errors.general.internal_error');
            break;
          default:
            errorCode = 'general.unknown_error';
            errorMessage = t('errors.general.unknown_error');
        }
      }
      // Erreur réseau (pas de réponse du serveur)
      else if (error.request) {
        errorCode = 'general.network_error';
        errorMessage = t('errors.general.network_error');
      }
      // Autre type d'erreur
      else {
        errorCode = defaultCode;
        errorMessage = t(defaultCode);
      }
    }
    
    // Afficher le toast si demandé
    if (showToast) {
      toast.error(errorMessage);
    }
    
    // Journaliser l'erreur en développement
    if (process.env.NODE_ENV !== 'production') {
      console.error('Erreur API:', error);
      console.error('Code erreur:', errorCode);
      console.error('Message erreur:', errorMessage);
    }
    
    return {
      code: errorCode,
      message: errorMessage
    };
  },
  
  /**
   * Gère les erreurs de validation de formulaire.
   * @param {Object} errors - Erreurs de validation
   * @param {boolean} showToast - Si true, affiche un toast avec la première erreur
   * @returns {Object} Erreurs formatées par champ
   */
  handleValidationErrors(errors, showToast = true) {
    const { t } = useI18n();
    const toast = useToast();
    const formattedErrors = {};
    
    if (typeof errors === 'object' && errors !== null) {
      // Formater les erreurs par champ
      Object.keys(errors).forEach(field => {
        const fieldError = errors[field];
        
        if (Array.isArray(fieldError) && fieldError.length > 0) {
          // Prendre la première erreur pour ce champ
          formattedErrors[field] = this.getValidationMessage(fieldError[0]);
        } else if (typeof fieldError === 'string') {
          formattedErrors[field] = fieldError;
        } else if (typeof fieldError === 'object' && fieldError !== null) {
          // Si le backend renvoie un objet avec un code d'erreur
          if (fieldError.code) {
            formattedErrors[field] = t(`errors.form.${fieldError.code}`, fieldError.params || {});
          } else {
            formattedErrors[field] = JSON.stringify(fieldError);
          }
        }
      });
      
      // Afficher la première erreur en toast
      if (showToast && Object.keys(formattedErrors).length > 0) {
        const firstErrorKey = Object.keys(formattedErrors)[0];
        toast.error(formattedErrors[firstErrorKey]);
      }
    } else {
      // Si ce n'est pas un objet, utiliser un message générique
      const genericMessage = t('errors.general.validation_failed');
      formattedErrors._global = genericMessage;
      
      if (showToast) {
        toast.error(genericMessage);
      }
    }
    
    return formattedErrors;
  },
  
  /**
   * Convertit un code d'erreur de validation en message localisé.
   * @param {string|Object} error - Code d'erreur ou objet d'erreur
   * @returns {string} Message localisé
   */
  getValidationMessage(error) {
    const { t } = useI18n();
    
    if (typeof error === 'string') {
      // Vérifier si c'est un code connu
      if (error.startsWith('required')) return t('errors.form.required');
      if (error.startsWith('email')) return t('errors.form.email');
      if (error.startsWith('min')) {
        const minLength = error.split(':')[1];
        return t('errors.form.min_length', { min: minLength });
      }
      if (error.startsWith('max')) {
        const maxLength = error.split(':')[1];
        return t('errors.form.max_length', { max: maxLength });
      }
      
      // Si c'est un code inconnu, le retourner tel quel
      return error;
    }
    
    // Si c'est un objet avec un code
    if (typeof error === 'object' && error !== null && error.code) {
      return t(`errors.form.${error.code}`, error.params || {});
    }
    
    // Par défaut
    return t('errors.general.validation_failed');
  }
};

export default ErrorService;