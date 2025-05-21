import { ref } from 'vue';
import { useI18n } from '@/composables/i18n/useI18n';
import { useThemeStore } from '@/stores/theme';

/**
 * Composable pour gérer les confirmations d'actions importantes
 * Utilise un modal pour demander confirmation à l'utilisateur
 */
export function useConfirmation() {
  const isModalOpen = ref(false);
  const confirmOptions = ref({});
  const { t } = useI18n();
  const themeStore = useThemeStore();
  const modalResult = ref(null);
  
  /**
   * Demander une confirmation à l'utilisateur
   * @param {Object} options Options de confirmation
   * @param {string} options.title Titre du modal
   * @param {string} options.message Message de confirmation
   * @param {string} options.confirmButtonText Texte du bouton de confirmation
   * @param {string} options.cancelButtonText Texte du bouton d'annulation
   * @param {string} options.type Type de confirmation ('info', 'success', 'warning', 'error', 'question')
   * @returns {Promise<boolean>} true si l'utilisateur confirme, false sinon
   */
  const confirm = (options) => {
    return new Promise((resolve) => {
      // Options par défaut
      const defaultOptions = {
        title: t('common.confirm'),
        message: t('common.confirmMessage'),
        confirmButtonText: t('common.yes'),
        cancelButtonText: t('common.no'),
        type: 'question'
      };
      
      // Fusionner les options par défaut avec celles fournies
      confirmOptions.value = { ...defaultOptions, ...options };
      
      // Définir la fonction de callback pour le résultat
      modalResult.value = resolve;
      
      // Ouvrir le modal
      isModalOpen.value = true;
    });
  };
  
  /**
   * Confirmer l'action
   */
  const handleConfirm = () => {
    isModalOpen.value = false;
    if (modalResult.value) {
      modalResult.value(true);
      modalResult.value = null;
    }
  };
  
  /**
   * Annuler l'action
   */
  const handleCancel = () => {
    isModalOpen.value = false;
    if (modalResult.value) {
      modalResult.value(false);
      modalResult.value = null;
    }
  };
  
  return {
    confirm,
    isModalOpen,
    confirmOptions,
    handleConfirm,
    handleCancel
  };
}

export default useConfirmation;