import { ref } from 'vue';

/**
 * Composable permettant de gérer facilement un état de toggle
 * @param {boolean} initialState - État initial (par défaut: false)
 * @returns {Object} - Méthodes et valeurs pour la gestion du toggle
 */
export function useToggle(initialState = false) {
  const state = ref(initialState);

  // Inverser l'état
  const toggle = () => {
    state.value = !state.value;
  };

  // Définir l'état à true
  const setTrue = () => {
    state.value = true;
  };

  // Définir l'état à false
  const setFalse = () => {
    state.value = false;
  };

  return {
    state,
    toggle,
    setTrue,
    setFalse
  };
}

export default useToggle;