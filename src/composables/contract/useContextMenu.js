import { ref, onMounted, onBeforeUnmount } from 'vue';

/**
 * Composable pour gérer les menus contextuels des nœuds et des arêtes
 * 
 * @param {Ref<Array>} nodes - Référence aux nœuds actuels
 * @param {Ref<Array>} edges - Référence aux arêtes actuelles
 * @returns {Object} - Fonctions et états pour les menus contextuels
 */
export default function useContextMenu(nodes, edges) {
  // Menu contextuel pour les nœuds
  const nodeContextMenu = ref({ 
    visible: false, 
    x: 0, 
    y: 0, 
    targetId: null 
  });

  // Menu contextuel pour les arêtes
  const edgeContextMenu = ref({ 
    visible: false, 
    x: 0, 
    y: 0, 
    targetId: null 
  });

  /**
   * Gestionnaire pour le clic droit sur un nœud
   */
  const handleNodeRightClick = ({ event, node }) => {
    event.preventDefault();
    event.stopPropagation();
    nodeContextMenu.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      targetId: node.id
    };
  };

  /**
   * Gestionnaire pour le clic droit sur une arête
   */
  const handleEdgeRightClick = ({ event, edge }) => {
    event.preventDefault();
    event.stopPropagation();
    edgeContextMenu.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      targetId: edge.id
    };
  };

  /**
   * Obtient le libellé d'un nœud par son ID
   */
  const getNodeLabelById = (nodeId) => {
    const node = nodes.value.find(n => n.id === nodeId);
    return node ? node.data.label : 'État';
  };

  /**
   * Obtient le libellé d'une arête par son ID
   */
  const getEdgeLabelById = (edgeId) => {
    const edge = edges.value.find(e => e.id === edgeId);
    return edge ? edge.label : 'Transition';
  };

  /**
   * Cache les menus contextuels
   */
  const hideContextMenus = () => {
    nodeContextMenu.value.visible = false;
    edgeContextMenu.value.visible = false;
  };

  // Configuration des écouteurs d'événements pour fermer les menus contextuels
  onMounted(() => {
    window.addEventListener('click', hideContextMenus);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('click', hideContextMenus);
  });

  return {
    nodeContextMenu,
    edgeContextMenu,
    handleNodeRightClick,
    handleEdgeRightClick,
    getNodeLabelById,
    getEdgeLabelById,
    hideContextMenus
  };
}