import { ref } from 'vue';
import { useVueFlow } from '@vue-flow/core';

/**
 * Composable pour gérer les états (nœuds) de l'automate
 * 
 * @param {Ref<Array>} nodes - Référence aux nœuds actuels
 * @param {Ref<Array>} edges - Référence aux arêtes actuelles
 * @param {Ref<String|null>} activeStateId - ID de l'état actif
 * @param {Object} history - Objet historique issu de useHistory
 * @param {Function} validateAutomate - Fonction pour valider l'automate
 * @param {Function} getNodeConfig - Fonction pour obtenir la configuration d'un nœud
 * @param {Function} getBaseNodeStyle - Fonction pour obtenir le style de base d'un nœud
 * @param {Function} getSelectedNodeStyle - Fonction pour obtenir le style d'un nœud sélectionné
 * @returns {Object} - Fonctions et états pour la gestion des états
 */
export default function useStateManager(
  nodes, 
  edges, 
  activeStateId, 
  history, 
  validateAutomate, 
  getNodeConfig, 
  getBaseNodeStyle,
  getSelectedNodeStyle
) {
  // États pour les modals
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

  // Récupérer les méthodes de VueFlow
  const { findNode, setSelectedElements } = useVueFlow();

  /**
   * Met à jour les styles des nœuds
   */
  const updateNodeStyles = (selectedId) => {
    nodes.value.forEach(node => {
      node.style = node.id === selectedId 
        ? getSelectedNodeStyle()
        : getBaseNodeStyle();
    });
  };

  /**
   * Vérifie si un nom d'état existe déjà
   */
  const stateNameExists = (name, excludeId = null) => {
    return nodes.value.some(node => 
      node.data.label.toLowerCase() === name.toLowerCase() && 
      node.id !== excludeId
    );
  };

  /**
   * Vérifie si un état est utilisé dans des transitions
   */
  const checkIfStateUsedInEdges = (stateId) => {
    return edges.value.some(edge => edge.source === stateId || edge.target === stateId);
  };

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
        return { success: false, message: 'État non trouvé' };
      }
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du modal d\'édition:', error);
      return { success: false, message: 'Impossible d\'éditer cet état' };
    }
  };

  /**
   * Ouvre le modal de suppression d'état
   */
  const openRemoveStateModal = (id) => {
    try {
      removeStateId.value = id;
      stateUsedInEdges.value = checkIfStateUsedInEdges(id);
      showRemoveStateModal.value = true;
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du modal de suppression:', error);
      return { success: false, message: 'Impossible de supprimer cet état' };
    }
  };

  /**
   * Ajoute un nouvel état
   */
  const addState = (state) => {
    // Sauvegarder l'état actuel dans l'historique avant d'ajouter un état
    history.saveToHistory();
    
    // Générer une position aléatoire dans une zone visible
    const randomPosition = {
      x: 50 + Math.random() * 400, // Entre 50 et 450 px
      y: 50 + Math.random() * 300, // Entre 50 et 350 px
    };
    
    // Ajouter le nouvel état comme nœud standard
    nodes.value.push({
      id: state.id,
      position: randomPosition,
      data: { label: state.libelle },
      ...getNodeConfig(state.type),
      style: getBaseNodeStyle(),
    });
    
    // Valider l'automate après l'ajout
    validateAutomate();
    
    return { success: true, message: 'État ajouté avec succès' };
  };

  /**
   * Modifie un état existant
   */
  const editState = ({ id, libelle }) => {
    // Sauvegarder l'état actuel dans l'historique avant de modifier un état
    history.saveToHistory();
    
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
   */
  const removeState = (id) => {
    // Sauvegarder l'état actuel dans l'historique avant de supprimer un état
    history.saveToHistory();
    
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
   */
  const selectState = (stateId) => {
    // Si l'état est déjà sélectionné, le désélectionner
    if (activeStateId.value === stateId) {
      // Désélectionner
      activeStateId.value = null;
      updateNodeStyles(null);
      setSelectedElements({ nodes: [], edges: [] });
    } else {
      // Sélectionner le nouvel état
      activeStateId.value = stateId;
      updateNodeStyles(stateId);
      
      // Sélectionner le nœud dans VueFlow si stateId n'est pas null
      if (stateId) {
        const node = findNode(stateId);
        if (node) {
          setSelectedElements({ nodes: [node], edges: [] });
        }
      }
    }
  };

  /**
   * Confirme l'ajout d'un état depuis le modal
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

  return {
    // États
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
    
    // Méthodes
    updateNodeStyles,
    stateNameExists,
    checkIfStateUsedInEdges,
    openAddStateModal,
    openEditStateModal,
    openRemoveStateModal,
    addState,
    editState,
    removeState,
    selectState,
    confirmAddState,
    confirmEditState,
    confirmRemoveState,
    addInitialState,
    addStandardState,
    addFinalState
  };
}