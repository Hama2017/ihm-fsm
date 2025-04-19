import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useVueFlow } from '@vue-flow/core';

/**
 * Composable pour gérer le menu contextuel des arêtes
 * 
 * @param {Object} options Configuration du composable
 * @param {Ref<Array>} options.currentNodes Nœuds de l'automate actif
 * @param {Ref<Array>} options.currentEdges Arêtes de l'automate actif
 * @param {Ref<String|null>} options.activeTransitionId ID de la transition active
 * @param {Function} options.updateEdgeStyles Fonction pour mettre à jour les styles des arêtes
 * @param {Function} options.openEditTransitionModal Fonction pour ouvrir le modal d'édition de transition
 * @param {Function} options.openRemoveTransitionModal Fonction pour ouvrir le modal de suppression de transition
 * @param {Function} options.openInvertTransitionModal Fonction pour ouvrir le modal d'inversion de transition
 * @returns {Object} Fonctions et états pour la gestion du menu contextuel des arêtes
 */
export default function useEdgeContextMenu({
  currentNodes,
  currentEdges,
  activeTransitionId,
  updateEdgeStyles,
  openEditTransitionModal,
  openRemoveTransitionModal,
  openInvertTransitionModal
}) {
  // Récupérer les méthodes de VueFlow
  const { setSelectedElements } = useVueFlow();
  
  // État réactif pour le menu contextuel
  const edgeContextMenu = ref({ 
    visible: false, 
    x: 0, 
    y: 0, 
    targetId: null 
  });
  
  // Gestionnaire pour le clic droit sur une arête dans VueFlow
  const onEdgeContextMenu = ({ event, edge }) => {
    event.preventDefault();
    event.stopPropagation(); // Empêcher la propagation pour éviter que le clic soit capturé par d'autres gestionnaires
    edgeContextMenu.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      targetId: edge.id
    };
  };
  
  // Récupérer le libellé d'une arête par son ID
  const getEdgeLabelById = (edgeId) => {
    const edge = currentEdges.value.find(e => e.id === edgeId);
    return edge ? edge.label : 'Transition';
  };
  
  // Sélectionner ou désélectionner une arête depuis le menu contextuel
  const selectTransitionFromContext = () => {
    const edgeId = edgeContextMenu.value.targetId;
    if (edgeId) {
      if (activeTransitionId.value === edgeId) {
        // Désélectionner si déjà active
        activeTransitionId.value = null;
        updateEdgeStyles(null);
        setSelectedElements({ nodes: [], edges: [] });
      } else {
        // Sinon sélectionner
        activeTransitionId.value = edgeId;
        updateEdgeStyles(edgeId);
        const edge = currentEdges.value.find(e => e.id === edgeId);
        if (edge) {
          setSelectedElements({ nodes: [], edges: [edge] });
        }
      }
    }
    edgeContextMenu.value.visible = false;
  };
  
  // Modifier une arête depuis le menu contextuel
  const editTransitionFromContext = () => {
    const edgeId = edgeContextMenu.value.targetId;
    if (edgeId) {
      const edge = currentEdges.value.find(e => e.id === edgeId);
      if (edge) {
        openEditTransitionModal(edge);
      }
    }
    edgeContextMenu.value.visible = false;
  };
  
  // Supprimer une arête depuis le menu contextuel
  const deleteTransitionFromContext = () => {
    const edgeId = edgeContextMenu.value.targetId;
    if (edgeId) {
      openRemoveTransitionModal(edgeId);
    }
    edgeContextMenu.value.visible = false;
  };
  
  // Inverser une arête depuis le menu contextuel
  const invertTransitionFromContext = () => {
    const edgeId = edgeContextMenu.value.targetId;
    if (edgeId) {
      const edge = currentEdges.value.find(e => e.id === edgeId);
      if (edge) {
        openInvertTransitionModal(edge);
      }
    }
    edgeContextMenu.value.visible = false;
  };
  
  // Masquer le menu contextuel
  const hideContextMenu = () => {
    edgeContextMenu.value.visible = false;
  };
  
  // Gestionnaires d'événements pour fermer le menu contextuel
  onMounted(() => {
    window.addEventListener('click', hideContextMenu);
  });
  
  onBeforeUnmount(() => {
    window.removeEventListener('click', hideContextMenu);
  });
  
  return {
    // État
    edgeContextMenu,
    
    // Méthodes
    onEdgeContextMenu,
    getEdgeLabelById,
    selectTransitionFromContext,
    editTransitionFromContext,
    deleteTransitionFromContext,
    invertTransitionFromContext,
    hideContextMenu
  };
}