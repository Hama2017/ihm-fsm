import { ref, computed } from 'vue';

/**
 * Composable pour gérer l'historique des modifications (undo/redo)
 * 
 * @param {Ref<Array>} nodes - Référence aux nœuds actuels
 * @param {Ref<Array>} edges - Référence aux arêtes actuelles
 * @param {Ref<String|null>} activeStateId - ID de l'état actif
 * @param {Ref<String|null>} activeTransitionId - ID de la transition active
 * @param {Function} updateNodeStyles - Fonction pour mettre à jour les styles des nœuds
 * @param {Function} updateEdgeStyles - Fonction pour mettre à jour les styles des arêtes
 * @returns {Object} - Fonctions et états pour la gestion de l'historique
 */
export default function useHistory(
  nodes, 
  edges, 
  activeStateId, 
  activeTransitionId,
  updateNodeStyles,
  updateEdgeStyles
) {
  const historyStack = ref([]);
  const historyIndex = ref(-1);
  const canUndo = ref(false);
  const canRedo = ref(false);
  const isSaved = ref(true);

  /**
   * Sauvegarde l'état actuel dans l'historique
   */
  const saveToHistory = () => {
    // Tronquer l'historique si on est dans un état intermédiaire
    if (historyIndex.value < historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, historyIndex.value + 1);
    }
    
    // Sauvegarder l'état actuel dans l'historique
    const currentState = {
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      edges: JSON.parse(JSON.stringify(edges.value)),
      activeStateId: activeStateId.value,
      activeTransitionId: activeTransitionId.value
    };
    
    historyStack.value.push(currentState);
    historyIndex.value = historyStack.value.length - 1;
    
    // Mettre à jour la possibilité d'annuler/rétablir
    canUndo.value = historyIndex.value > 0;
    canRedo.value = historyIndex.value < historyStack.value.length - 1;
    
    // Indiquer que des modifications ont été apportées
    isSaved.value = false;
  };

  /**
   * Annule la dernière action
   */
  const undo = () => {
    if (historyIndex.value > 0) {
      historyIndex.value--;
      const previousState = historyStack.value[historyIndex.value];
      
      nodes.value = previousState.nodes;
      edges.value = previousState.edges;
      activeStateId.value = previousState.activeStateId;
      activeTransitionId.value = previousState.activeTransitionId;
      
      // Mettre à jour la possibilité d'annuler/rétablir
      canUndo.value = historyIndex.value > 0;
      canRedo.value = historyIndex.value < historyStack.value.length - 1;
      
      updateNodeStyles(activeStateId.value);
      updateEdgeStyles(activeTransitionId.value);
    }
  };

  /**
   * Rétablit l'action annulée
   */
  const redo = () => {
    if (historyIndex.value < historyStack.value.length - 1) {
      historyIndex.value++;
      const nextState = historyStack.value[historyIndex.value];
      
      nodes.value = nextState.nodes;
      edges.value = nextState.edges;
      activeStateId.value = nextState.activeStateId;
      activeTransitionId.value = nextState.activeTransitionId;
      
      // Mettre à jour la possibilité d'annuler/rétablir
      canUndo.value = historyIndex.value > 0;
      canRedo.value = historyIndex.value < historyStack.value.length - 1;
      
      updateNodeStyles(activeStateId.value);
      updateEdgeStyles(activeTransitionId.value);
    }
  };

  /**
   * Réinitialise l'historique
   */
  const resetHistory = () => {
    historyStack.value = [];
    historyIndex.value = -1;
    canUndo.value = false;
    canRedo.value = false;
    
    // Sauvegarder l'état initial dans l'historique
    saveToHistory();
  };

  /**
   * Marque l'état actuel comme sauvegardé
   */
  const markAsSaved = () => {
    isSaved.value = true;
  };

  return {
    historyStack,
    historyIndex,
    canUndo,
    canRedo,
    isSaved,
    saveToHistory,
    undo,
    redo,
    resetHistory,
    markAsSaved
  };
}