import { ref, markRaw, reactive } from 'vue';
import { useI18n } from '@/composables/i18n/useI18n';
import Toast from '@/components/ui/UiToast.vue';

// ID incrémental pour les toasts
let nextId = 0;

// Liste des toasts actifs
const toasts = reactive([]);

// Service de toast amélioré avec i18n
export const useToast = () => {
  const { t } = useI18n();

  /**
   * Ajouter un toast
   * @param {Object} options Les options du toast
   * @returns {Number} L'ID du toast créé
   */
  const add = (options) => {
    const id = nextId++;
    
    const defaultOptions = {
      id,
      message: '',
      type: 'success',
      duration: 4000,
      position: 'top-right',
      dismissible: true,
      showIcon: true,
      component: markRaw(Toast)
    };
    
    // Fusionner les options par défaut avec les options fournies
    const toast = {
      ...defaultOptions,
      ...options,
      visible: true
    };
    
    // Ajouter le toast à la liste
    toasts.push(toast);
    
    // Auto-suppression après duration (si > 0)
    if (toast.duration > 0) {
      setTimeout(() => {
        remove(id);
      }, toast.duration);
    }
    
    return id;
  };
  
  /**
   * Supprimer un toast par son ID
   * @param {Number} id L'ID du toast à supprimer
   */
  const remove = (id) => {
    const index = toasts.findIndex(toast => toast.id === id);
    if (index !== -1) {
      // Animer la fermeture en mettant visible à false
      toasts[index].visible = false;
      
      // Supprimer réellement après l'animation
      setTimeout(() => {
        const indexAfterAnimation = toasts.findIndex(toast => toast.id === id);
        if (indexAfterAnimation !== -1) {
          toasts.splice(indexAfterAnimation, 1);
        }
      }, 300); // Durée de l'animation en ms
    }
  };
  
  /**
   * Créer un toast de succès
   * @param {String|Object} message Le message du toast ou la clé de traduction
   * @param {Object} options Options supplémentaires
   * @returns {Number} L'ID du toast créé
   */
  const success = (message, options = {}) => {
    // Si le message est une clé de traduction
    const finalMessage = typeof message === 'string' && message.includes('.') 
      ? t(message, options.params || {})
      : message;
      
    return add({
      message: finalMessage,
      type: 'success',
      ...options
    });
  };
  
  /**
   * Créer un toast d'erreur
   * @param {String|Object} message Le message du toast ou la clé de traduction
   * @param {Object} options Options supplémentaires
   * @returns {Number} L'ID du toast créé
   */
  const error = (message, options = {}) => {
    // Si le message est une clé de traduction
    const finalMessage = typeof message === 'string' && message.includes('.') 
      ? t(message, options.params || {})
      : message;
      
    return add({
      message: finalMessage,
      type: 'error',
      duration: 6000, // Durée plus longue pour les erreurs
      ...options
    });
  };
  
  /**
   * Créer un toast d'avertissement
   * @param {String|Object} message Le message du toast ou la clé de traduction
   * @param {Object} options Options supplémentaires
   * @returns {Number} L'ID du toast créé
   */
  const warning = (message, options = {}) => {
    // Si le message est une clé de traduction
    const finalMessage = typeof message === 'string' && message.includes('.') 
      ? t(message, options.params || {})
      : message;
      
    return add({
      message: finalMessage,
      type: 'warning',
      ...options
    });
  };
  
  /**
   * Créer un toast d'information
   * @param {String|Object} message Le message du toast ou la clé de traduction
   * @param {Object} options Options supplémentaires
   * @returns {Number} L'ID du toast créé
   */
  const info = (message, options = {}) => {
    // Si le message est une clé de traduction
    const finalMessage = typeof message === 'string' && message.includes('.') 
      ? t(message, options.params || {})
      : message;
      
    return add({
      message: finalMessage,
      type: 'info',
      ...options
    });
  };
  
  /**
   * Gérer une erreur d'API et afficher un toast approprié
   * @param {Error} error L'erreur à traiter
   * @param {String} defaultMessage Message par défaut si aucun message d'erreur n'est trouvé
   */
  const handleApiError = (error, defaultMessage = 'errors.unknownError') => {
    console.error('API Error:', error);
    
    let errorMessage = t(defaultMessage);
    
    if (error.response) {
      // Erreur de réponse de l'API
      const serverMessage = error.response.data?.detail || error.response.data?.message;
      
      if (serverMessage) {
        errorMessage = serverMessage;
      } else if (error.response.status === 401) {
        errorMessage = t('errors.unauthorized');
      } else if (error.response.status === 403) {
        errorMessage = t('errors.forbidden');
      } else if (error.response.status === 404) {
        errorMessage = t('errors.notFound');
      } else if (error.response.status === 422) {
        errorMessage = t('errors.validationFailed');
      } else if (error.response.status >= 500) {
        errorMessage = t('errors.serverError');
      }
    } else if (error.request) {
      // Erreur de requête (pas de réponse reçue)
      errorMessage = t('errors.noResponse');
    } else {
      // Autre erreur
      errorMessage = error.message || errorMessage;
    }
    
    return error({
      message: errorMessage,
      duration: 6000, // Durée plus longue pour les erreurs
    });
  };
  
  return {
    toasts,
    add,
    remove,
    success,
    error,
    warning,
    info,
    handleApiError
  };
};

// Export d'une instance unique pour toute l'application
export default useToast();