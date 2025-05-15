import { ref, computed } from 'vue';
import { useVueFlow } from '@vue-flow/core';
import toast from '@/composables/Toast/useToast';

/**
 * Composable pour gérer tout ce qui est relatif aux états (nodes) dans l'éditeur de contrat
 * 
 * @param {Object} options Configuration du composable
 * @param {Ref<Array>} options.nodes Référence aux nœuds actuels
 * @param {Ref<Array>} options.edges Référence aux arêtes actuelles
 * @param {Ref<String|null>} options.activeStateId ID de l'état actuellement sélectionné
 * @param {Function} options.saveToHistory Fonction pour sauvegarder l'état dans l'historique
 * @param {Function} options.validateAutomate Fonction pour valider l'automate
 * @param {Function} options.getBaseNodeStyle Fonction pour obtenir le style de base des nœuds
 * @param {Function} options.getSelectedNodeStyle Fonction pour obtenir le style d'un nœud sélectionné
 * @param {Function} options.getNodeConfig Fonction pour obtenir la configuration d'un nœud selon son type
 * @returns {Object} Fonctions et états pour la gestion des états
 */
export default function useState({
  nodes,
  edges,
  activeStateId,
  saveToHistory,
  validateAutomate,
  getBaseNodeStyle,
  getSelectedNodeStyle,
  getNodeConfig
}) {
  // --- Récupérer les méthodes de VueFlow ---
  const { findNode, addSelectedNodes, removeSelectedNodes } = useVueFlow();

  // --- États pour les modals ---
  const showAddStateModal = ref(false);
  const showEditStateModal = ref(false);
  const showRemoveStateModal = ref(false);
  const newStateName = ref('');
  const newStateType = ref('standard');
  const editStateName = ref('');
  const editStateId = ref(null);
  const removeStateId = ref(null);
  const addStateError = ref('');
  const editStateError = ref('');
  const stateUsedInEdges = ref(false);

  // --- États pour le menu contextuel ---
  const contextMenu = ref({ 
    visible: false, 
    x: 0, 
    y: 0, 
    targetId: null 
  });

  // --- Méthodes pour les styles ---
  /**
   * Mise à jour des styles des nœuds selon l'élément sélectionné
   * @param {String|null} selectedId - ID de l'élément sélectionné
   */
  const updateNodeStyles = (selectedId) => {
    nodes.value.forEach(node => {
      node.style = node.id === selectedId 
        ? getSelectedNodeStyle()
        : getBaseNodeStyle();
    });
  };

  // --- Méthodes utilitaires ---
  /**
   * Vérifie si un nom d'état existe déjà
   * @param {String} name - Nom à vérifier
   * @param {String|null} excludeId - ID à exclure de la vérification (pour l'édition)
   * @returns {Boolean} True si le nom existe déjà
   */
  const stateNameExists = (name, excludeId = null) => {
    return nodes.value.some(node => 
      node.data.label.toLowerCase() === name.toLowerCase() && 
      node.id !== excludeId
    );
  };

  /**
   * Vérifie si un état est utilisé dans des transitions
   * @param {String} stateId - ID de l'état à vérifier
   * @returns {Boolean} True si l'état est référencé dans une transition
   */
  const checkIfStateUsedInEdges = (stateId) => {
    return edges.value.some(edge => edge.source === stateId || edge.target === stateId);
  };

  // --- Méthodes pour les modals ---
  /**
   * Ouvre le modal d'ajout d'état
   */
  const openAddStateModal = () => {
    newStateName.value = '';
    newStateType.value = 'standard';
    addStateError.value = '';
    showAddStateModal.value = true;
  };

  /**
   * Ouvre le modal d'édition d'état
   * @param {String} id - ID de l'état à éditer
   */
  const openEditStateModal = (id) => {
    try {
      const node = nodes.value.find(n => n.id === id);
      if (node) {
        editStateId.value = id;
        editStateName.value = node.data.label;
        editStateError.value = '';
        showEditStateModal.value = true;
      } else {
        console.error('État non trouvé:', id);
        toast.error('État non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du modal d\'édition:', error);
      toast.error('Impossible d\'éditer cet état');
    }
  };

  /**
   * Ouvre le modal de suppression d'état
   * @param {String} id - ID de l'état à supprimer
   */
  const openRemoveStateModal = (id) => {
    try {
      removeStateId.value = id;
      stateUsedInEdges.value = checkIfStateUsedInEdges(id);
      showRemoveStateModal.value = true;
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du modal de suppression:', error);
      toast.error('Impossible de supprimer cet état');
    }
  };

  // --- Méthodes pour la manipulation des états ---
  /**
   * Ajoute un nouvel état
   * @param {Object} state - Informations sur l'état à ajouter
   * @returns {Object} Résultat de l'opération
   */
  const addState = (state) => {
    // Sauvegarder l'état actuel dans l'historique avant d'ajouter un état
    saveToHistory();
    
    // Générer une position aléatoire dans une zone visible
    const randomPosition = {
      x: 50 + Math.random() * 400, // Entre 50 et 450 px
      y: 50 + Math.random() * 300, // Entre 50 et 350 px
    };
    
    // Ajouter le nouvel état comme nœud
    nodes.value.push({
      id: state.id,
      position: randomPosition,
      data: { label: state.libelle },
      ...getNodeConfig(state.type || 'standard'),
      style: getBaseNodeStyle(),
    });
    
    // Valider l'automate après l'ajout
    validateAutomate();
    
    return { success: true, message: 'État ajouté avec succès' };
  };

  /**
   * Modifie un état existant
   * @param {Object} state - Informations sur l'état à modifier
   * @returns {Object} Résultat de l'opération
   */
  const editState = ({ id, libelle }) => {
    // Sauvegarder l'état actuel dans l'historique avant de modifier un état
    saveToHistory();
    
    const node = nodes.value.find(n => n.id === id);
    if (node) {
      node.data.label = libelle;
      
      // Valider l'automate après la modification
      validateAutomate();
      
      return { success: true, message: 'État modifié avec succès' };
    }
    
    return { success: false, message: 'État non trouvé' };
  };

  /**
   * Supprime un état
   * @param {String} id - ID de l'état à supprimer
   * @returns {Object} Résultat de l'opération
   */
  const removeState = (id) => {
    // Sauvegarder l'état actuel dans l'historique avant de supprimer un état
    saveToHistory();
    
    // Supprimer le nœud
    nodes.value = nodes.value.filter(n => n.id !== id);
    
    // Si le nœud supprimé était sélectionné, désélectionner
    if (activeStateId.value === id) {
      activeStateId.value = null;
    }
    
    // Supprimer également les connexions associées
    edges.value = edges.value.filter(e => e.source !== id && e.target !== id);
    
    // Valider l'automate après la suppression
    validateAutomate();
    
    return { success: true, message: 'État supprimé avec succès' };
  };

  /**
   * Sélectionne ou désélectionne un état
   * @param {String} stateId - ID de l'état à sélectionner/désélectionner
   */
  const selectState = (stateId) => {
    // Si l'état est déjà sélectionné, le désélectionner
    if (activeStateId.value === stateId) {
      // Désélectionner
      activeStateId.value = null;
      updateNodeStyles(null);
      removeSelectedNodes(nodes.value.filter(n => n.id === stateId));
    } else {
      // Sélectionner le nouvel état
      activeStateId.value = stateId;
      updateNodeStyles(stateId);
      
      // Sélectionner le nœud dans VueFlow si stateId n'est pas null
      if (stateId) {
        const node = findNode(stateId);
        if (node) {
          addSelectedNodes([node]);
        }
      }
    }
  };

  // --- Méthodes pour les actions depuis le modal ---
  /**
   * Confirme l'ajout d'un état depuis le modal
   * @returns {Object} Résultat de l'opération
   */
  const confirmAddState = () => {
    try {
      if (!newStateName.value || !newStateName.value.trim()) {
        addStateError.value = 'Le nom de l\'état ne peut pas être vide!';
        return { success: false };
      }
      
      if (stateNameExists(newStateName.value)) {
        addStateError.value = 'Un état avec ce nom existe déjà!';
        return { success: false };
      }
      
      const newId = `state-${Date.now()}`;
      const result = addState({ 
        id: newId, 
        libelle: newStateName.value.trim(), 
        type: newStateType.value 
      });
      
      if (result.success) {
        showAddStateModal.value = false;
        return { success: true, message: 'État ajouté avec succès' };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'état:', error);
      addStateError.value = 'Une erreur s\'est produite lors de l\'ajout';
      return { success: false, message: 'Une erreur s\'est produite lors de l\'ajout' };
    }
  };

  /**
   * Confirme la modification d'un état depuis le modal
   * @returns {Object} Résultat de l'opération
   */
  const confirmEditState = () => {
    try {
      if (!editStateName.value || !editStateName.value.trim()) {
        editStateError.value = 'Le nom de l\'état ne peut pas être vide!';
        return { success: false };
      }
      
      if (stateNameExists(editStateName.value, editStateId.value)) {
        editStateError.value = 'Un état avec ce nom existe déjà!';
        return { success: false };
      }
      
      const result = editState({ 
        id: editStateId.value, 
        libelle: editStateName.value.trim() 
      });
      
      if (result.success) {
        showEditStateModal.value = false;
        return { success: true, message: 'État modifié avec succès' };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Erreur lors de la modification de l\'état:', error);
      editStateError.value = 'Une erreur s\'est produite lors de la modification';
      return { success: false, message: 'Une erreur s\'est produite lors de la modification' };
    }
  };

  /**
   * Confirme la suppression d'un état depuis le modal
   * @returns {Object} Résultat de l'opération
   */
  const confirmRemoveState = () => {
    try {
      const result = removeState(removeStateId.value);
      if (result.success) {
        showRemoveStateModal.value = false;
        return { success: true, message: 'État supprimé avec succès' };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'état:', error);
      return { success: false, message: 'Erreur lors de la suppression de l\'état' };
    }
  };

  /**
   * Ajoute un état initial
   * @returns {Object} Résultat de l'opération
   */
  const addInitialState = () => {
    const id = `state-${Date.now()}`;
    const newState = {
      id,
      libelle: 'État Initial',
      type: 'initial'
    };
    
    return addState(newState);
  };

  /**
   * Ajoute un état standard
   * @returns {Object} Résultat de l'opération
   */
  const addStandardState = () => {
    const id = `state-${Date.now()}`;
    const newState = {
      id,
      libelle: 'Nouvel État',
      type: 'standard'
    };
    
    return addState(newState);
  };

  /**
   * Ajoute un état final
   * @returns {Object} Résultat de l'opération
   */
  const addFinalState = () => {
    const id = `state-${Date.now()}`;
    const newState = {
      id,
      libelle: 'État Final',
      type: 'final'
    };
    
    return addState(newState);
  };

  /**
   * Gestionnaire pour le clic droit sur un nœud
   * @param {Object} params - Informations sur l'événement
   */
  const onNodeRightClick = ({ event, node }) => {
    event.preventDefault();
    contextMenu.value = {
      visible: true,
      x: event.clientX,
      y: event.clientY,
      targetId: node.id
    };
  };

  /**
   * Récupère le libellé d'un nœud par son ID
   * @param {String} nodeId - ID du nœud
   * @returns {String} Libellé du nœud
   */
  const getNodeLabelById = (nodeId) => {
    const node = nodes.value.find(n => n.id === nodeId);
    return node ? node.data.label : 'État';
  };

  /**
   * Sélectionne/désélectionne un état depuis le menu contextuel
   */
  const selectStateFromContext = () => {
    const nodeId = contextMenu.value.targetId;
    if (nodeId) {
      selectState(nodeId);
    }
    contextMenu.value.visible = false;
  };

  /**
   * Édite un état depuis le menu contextuel
   */
  const editStateFromContext = () => {
    openEditStateModal(contextMenu.value.targetId);
    contextMenu.value.visible = false;
  };

  /**
   * Supprime un état depuis le menu contextuel
   */
  const deleteStateFromContext = () => {
    openRemoveStateModal(contextMenu.value.targetId);
    contextMenu.value.visible = false;
  };

  /**
   * Masque le menu contextuel
   */
  const hideContextMenu = () => {
    contextMenu.value.visible = false;
  };

  return {
    // États pour les modals
    showAddStateModal,
    showEditStateModal,
    showRemoveStateModal,
    newStateName,
    newStateType,
    editStateName,
    editStateId,
    removeStateId,
    addStateError,
    editStateError,
    stateUsedInEdges,
    
    // État pour le menu contextuel
    contextMenu,
    
    // Méthodes pour les styles
    updateNodeStyles,
    
    // Méthodes utilitaires
    stateNameExists,
    checkIfStateUsedInEdges,
    
    // Méthodes pour les modals
    openAddStateModal,
    openEditStateModal,
    openRemoveStateModal,
    
    // Méthodes pour la manipulation des états
    addState,
    editState,
    removeState,
    selectState,
    
    // Méthodes pour les actions depuis le modal
    confirmAddState,
    confirmEditState,
    confirmRemoveState,
    
    // Méthodes pour l'ajout de types d'états spécifiques
    addInitialState,
    addStandardState,
    addFinalState,
    
    // Méthodes pour le menu contextuel
    onNodeRightClick,
    getNodeLabelById,
    selectStateFromContext,
    editStateFromContext,
    deleteStateFromContext,
    hideContextMenu
  };
}