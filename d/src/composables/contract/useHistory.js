import { ref, computed } from 'vue';
import { useVueFlow } from '@vue-flow/core';

/**
 * Composable pour gérer l'historique des actions (undo/redo)
 * 
 * @param {Object} options Configuration du composable
 * @param {Ref<Array>} options.nodes Référence aux nœuds actuels
 * @param {Ref<Array>} options.edges Référence aux arêtes actuelles
 * @param {Ref<String|null>} options.activeStateId ID de l'état actif
 * @param {Ref<String|null>} options.activeTransitionId ID de la transition active
 * @param {Function} options.updateNodeStyles Fonction pour mettre à jour les styles des nœuds
 * @param {Function} options.updateEdgeStyles Fonction pour mettre à jour les styles des arêtes
 * @returns {Object} Fonctions et états pour la gestion de l'historique
 */
export default function useHistory({
  nodes,
  edges,
  activeStateId,
  activeTransitionId,
  updateNodeStyles,
  updateEdgeStyles
}) {
  // Récupérer les méthodes de VueFlow
  const { addSelectedNodes, removeSelectedNodes, addSelectedEdges, removeSelectedEdges, findNode } = useVueFlow();
  
  // État réactif pour la pile d'historique
  const historyStack = ref([]);
  const historyIndex = ref(-1);
  const canUndo = ref(false);
  const canRedo = ref(false);
  
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
  };
  
  /**
   * Annule la dernière action (undo)
   */
  const undo = () => {
    if (historyIndex.value > 0) {
      historyIndex.value--;
      const previousState = historyStack.value[historyIndex.value];
      
      // Restaurer l'état précédent
      nodes.value = previousState.nodes;
      edges.value = previousState.edges;
      activeStateId.value = previousState.activeStateId;
      activeTransitionId.value = previousState.activeTransitionId;
      
      // Mettre à jour la possibilité d'annuler/rétablir
      canUndo.value = historyIndex.value > 0;
      canRedo.value = historyIndex.value < historyStack.value.length - 1;
      
      // Mettre à jour les styles
      updateNodeStyles(activeStateId.value);
      updateEdgeStyles(activeTransitionId.value);
      
      // Mettre à jour la sélection dans VueFlow
      updateVueFlowSelection(previousState.activeStateId, previousState.activeTransitionId);


    }
  };
  
  /**
   * Rétablit la dernière action annulée (redo)
   */
  const redo = () => {
    if (historyIndex.value < historyStack.value.length - 1) {
      historyIndex.value++;
      const nextState = historyStack.value[historyIndex.value];
      
      // Restaurer l'état suivant
      nodes.value = nextState.nodes;
      edges.value = nextState.edges;
      activeStateId.value = nextState.activeStateId;
      activeTransitionId.value = nextState.activeTransitionId;
      
      // Mettre à jour la possibilité d'annuler/rétablir
      canUndo.value = historyIndex.value > 0;
      canRedo.value = historyIndex.value < historyStack.value.length - 1;
      
      // Mettre à jour les styles
      updateNodeStyles(activeStateId.value);
      updateEdgeStyles(activeTransitionId.value);
      
      // Mettre à jour la sélection dans VueFlow
      updateVueFlowSelection(nextState.activeStateId, nextState.activeTransitionId);


    }
  };
  
  /**
   * Réinitialise l'historique avec l'état actuel comme point de départ
   */
  const resetHistory = () => {
    historyStack.value = [{
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      edges: JSON.parse(JSON.stringify(edges.value)),
      activeStateId: activeStateId.value,
      activeTransitionId: activeTransitionId.value
    }];
    historyIndex.value = 0;
    canUndo.value = false;
    canRedo.value = false;
  };
  
  /**
   * Met à jour la sélection dans VueFlow en fonction des IDs actifs
   * @param {String|null} stateId - ID de l'état à sélectionner
   * @param {String|null} transitionId - ID de la transition à sélectionner
   */
  const updateVueFlowSelection = (stateId, transitionId) => {
    // D'abord, effacer toutes les sélections existantes
    removeSelectedNodes(nodes.value);
    removeSelectedEdges(edges.value);
    
    if (stateId) {
      const node = findNode(stateId);
      if (node) {
        addSelectedNodes([node]);
      }
    } else if (transitionId) {
      const edge = edges.value.find(e => e.id === transitionId);
      if (edge) {
        addSelectedEdges([edge]);
      }
    }
  };
  
  return {
    historyStack,
    historyIndex,
    canUndo,
    canRedo,
    saveToHistory,
    undo,
    redo,
    resetHistory
  };
}