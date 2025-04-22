import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useVueFlow } from '@vue-flow/core';

/**
 * Composable pour gérer le menu contextuel des nœuds
 * 
 * @param {Object} options Configuration du composable
 * @param {Ref<Array>} options.currentNodes Nœuds de l'automate actif
 * @param {Ref<String|null>} options.activeStateId ID de l'état actif
 * @param {Function} options.updateNodeStyles Fonction pour mettre à jour les styles des nœuds
 * @param {Function} options.openEditStateModal Fonction pour ouvrir le modal d'édition d'état
 * @param {Function} options.openRemoveStateModal Fonction pour ouvrir le modal de suppression d'état
 * @returns {Object} Fonctions et états pour la gestion du menu contextuel des nœuds
 */
export default function useNodeContextMenu({
  currentNodes,
  activeStateId,
  updateNodeStyles,
  openEditStateModal,
  openRemoveStateModal
}) {
  // Récupérer les méthodes de VueFlow
  const { addSelectedNodes, removeSelectedNodes, findNode } = useVueFlow();
  
  // État réactif pour le menu contextuel
  const contextMenu = ref({ 
    visible: false, 
    x: 0, 
    y: 0, 
    targetId: null 
  });
  
  // Gestionnaire pour le clic droit sur un nœud dans VueFlow
  const onNodeRightClick = ({ event, node }) => {
    event.preventDefault();
    contextMenu.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      targetId: node.id
    };
  };
  
  // Récupérer le libellé d'un nœud par son ID
  const getNodeLabelById = (nodeId) => {
    const node = currentNodes.value.find(n => n.id === nodeId);
    return node ? node.data.label : 'État';
  };
  
  // Sélectionner ou désélectionner un état depuis le menu contextuel
  const selectStateFromContext = () => {
    const nodeId = contextMenu.value.targetId;
    if (nodeId) {
      if (activeStateId.value === nodeId) {
        // Désélectionner si déjà actif
        activeStateId.value = null;
        updateNodeStyles(null);
        // Utiliser removeSelectedNodes au lieu de setSelectedElements
        removeSelectedNodes(currentNodes.value.filter(n => n.id === nodeId));
      } else {
        // Sinon sélectionner
        activeStateId.value = nodeId;
        updateNodeStyles(nodeId);
        const node = findNode(nodeId);
        if (node) {
          // Utiliser addSelectedNodes au lieu de setSelectedElements
          addSelectedNodes([node]);
        }
      }
    }
    contextMenu.value.visible = false;
  };
  
  // Modifier un état depuis le menu contextuel
  const editStateFromContext = () => {
    openEditStateModal(contextMenu.value.targetId);
    contextMenu.value.visible = false;
  };
  
  // Supprimer un état depuis le menu contextuel
  const deleteStateFromContext = () => {
    openRemoveStateModal(contextMenu.value.targetId);
    contextMenu.value.visible = false;
  };
  
  // Masquer le menu contextuel
  const hideContextMenu = () => {
    contextMenu.value.visible = false;
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
    contextMenu,
    
    // Méthodes
    onNodeRightClick,
    getNodeLabelById,
    selectStateFromContext,
    editStateFromContext,
    deleteStateFromContext,
    hideContextMenu
  };
}