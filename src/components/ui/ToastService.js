import { ref, markRaw, reactive } from 'vue';
import Toast from '@/components/ui/Toast.vue';

// ID incrémental pour les toasts
let nextId = 0;

// Liste des toasts actifs
const toasts = reactive([]);

// Service de toast
export const useToast = () => {
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
      duration: 3000,
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
   * @param {String} message Le message du toast
   * @param {Object} options Options supplémentaires
   * @returns {Number} L'ID du toast créé
   */
  const success = (message, options = {}) => {
    return add({
      message,
      type: 'success',
      ...options
    });
  };
  
  /**
   * Créer un toast d'erreur
   * @param {String} message Le message du toast
   * @param {Object} options Options supplémentaires
   * @returns {Number} L'ID du toast créé
   */
  const error = (message, options = {}) => {
    return add({
      message,
      type: 'error',
      ...options
    });
  };
  
  /**
   * Créer un toast d'avertissement
   * @param {String} message Le message du toast
   * @param {Object} options Options supplémentaires
   * @returns {Number} L'ID du toast créé
   */
  const warning = (message, options = {}) => {
    return add({
      message,
      type: 'warning',
      ...options
    });
  };
  
  /**
   * Créer un toast d'information
   * @param {String} message Le message du toast
   * @param {Object} options Options supplémentaires
   * @returns {Number} L'ID du toast créé
   */
  const info = (message, options = {}) => {
    return add({
      message,
      type: 'info',
      ...options
    });
  };
  
  return {
    toasts,
    add,
    remove,
    success,
    error,
    warning,
    info
  };
};

// Export d'une instance unique pour toute l'application
export default useToast();