import { ref } from 'vue';
import { useVueFlow, MarkerType } from '@vue-flow/core';
import toast from '@/composables/Toast/useToast';

/**
 * Composable pour gérer tout ce qui est relatif aux transitions (edges) dans l'éditeur de contrat
 * 
 * @param {Object} options Configuration du composable
 * @param {Ref<Array>} options.nodes Référence aux nœuds actuels
 * @param {Ref<Array>} options.edges Référence aux arêtes actuelles
 * @param {Ref<String|null>} options.activeTransitionId ID de la transition actuellement sélectionnée
 * @param {Function} options.saveToHistory Fonction pour sauvegarder l'état dans l'historique
 * @param {Function} options.validateAutomate Fonction pour valider l'automate
 * @param {Function} options.detectCycle Fonction pour détecter les cycles dans l'automate
 * @param {Function} options.getBaseEdgeStyle Fonction pour obtenir le style de base des arêtes
 * @param {Function} options.getSelectedEdgeStyle Fonction pour obtenir le style d'une arête sélectionnée
 * @returns {Object} Fonctions et états pour la gestion des transitions
 */
export default function useTransition({
  nodes,
  edges,
  activeTransitionId,
  saveToHistory,
  validateAutomate,
  detectCycle,
  getBaseEdgeStyle,
  getSelectedEdgeStyle
}) {
  // --- Récupérer les méthodes de VueFlow ---
  const {  addSelectedEdges    , 
    removeSelectedEdges, 
    findEdge  } = useVueFlow();

  // --- États pour les modals ---
  const showAddTransitionModal = ref(false);
  const showEditTransitionModal = ref(false);
  const showRemoveTransitionModal = ref(false);
  const showInvertTransitionModal = ref(false);
  const showEdgeUpdateModal = ref(false);
  const editingTransition = ref({ id: '', source: '', target: '', function: '' });
  const invertingTransition = ref({ id: '', source: '', target: '', label: '' });
  const removeTransitionId = ref(null);
  const editTransitionError = ref('');
  
  // --- États pour la mise à jour des arêtes ---
  const edgeUpdateData = ref(null);
  const edgeUpdateSourceName = ref('');
  const edgeUpdateTargetName = ref('');

  // --- État pour le menu contextuel ---
  const edgeContextMenu = ref({ 
    visible: false, 
    x: 0, 
    y: 0, 
    targetId: null 
  });

  // --- Méthodes pour les styles ---
  /**
   * Mise à jour des styles des arêtes selon l'élément sélectionné
   * @param {String|null} selectedId - ID de l'élément sélectionné
   */
  const updateEdgeStyles = (selectedId) => {
    edges.value.forEach(edge => {
      edge.style = edge.id === selectedId 
        ? getSelectedEdgeStyle() 
        : getBaseEdgeStyle();
    });
  };

  // --- Méthodes pour les modals ---
  /**
   * Ouvre le modal d'ajout de transition
   */
  const openAddTransitionModal = () => {
    // Réinitialiser les champs
    editingTransition.value = { id: '', source: '', target: '', function: '' };
    editTransitionError.value = '';
    showAddTransitionModal.value = true;
  };


  /**
   * Ouvre le modal d'édition de transition
   * @param {Object} edge - Transition à éditer
   */
  const openEditTransitionModal = (edge) => {
    editingTransition.value = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      function: edge.label // Le label est utilisé comme fonction
    };
    editTransitionError.value = '';
    showEditTransitionModal.value = true;
  };

  /**
   * Ouvre le modal de suppression de transition
   * @param {String} edgeId - ID de la transition à supprimer
   */
  const openRemoveTransitionModal = (edgeId) => {
    removeTransitionId.value = edgeId;
    showRemoveTransitionModal.value = true;
  };

  /**
   * Ouvre le modal d'inversion de transition
   * @param {Object} edge - Transition à inverser
   */
  const openInvertTransitionModal = (edge) => {
    invertingTransition.value = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label
    };
    showInvertTransitionModal.value = true;
  };

  // --- Méthodes pour la manipulation des transitions ---
  /**
   * Ajoute une nouvelle transition
   * @param {Object} transition - Informations sur la transition à ajouter
   * @returns {Object} Résultat de l'opération
   */
  const addTransition = (transition) => {
    try {
      // Sauvegarder l'état actuel dans l'historique avant d'ajouter une transition
      saveToHistory();
      
      // Vérification que les données nécessaires sont présentes
      if (!transition.source || !transition.target || !transition.label) {
        return { success: false, message: 'Données de transition incomplètes' };
      }
      
      // Verifier si c'est une transition avec lui-même
      if (transition.source === transition.target) {
        return { success: false, message: 'Impossible de créer une transition sur le même état' };
      }
      
      // Vérifier si une transition avec le même source et target existe déjà
      const existingTransition = edges.value.find(
        edge => edge.source === transition.source && edge.target === transition.target
      );
      
      if (existingTransition) {
        return { success: false, message: 'Cette transition existe déjà' };
      }
      
      // Ajouter la nouvelle transition au graphe
      const newTransition = {
        id: transition.id || `edge-${Date.now()}`,
        source: transition.source,
        target: transition.target,
        label: transition.label,
        markerEnd: MarkerType.ArrowClosed,
        style: getBaseEdgeStyle()
      };
      
      edges.value.push(newTransition);
      
      // Vérifier si l'ajout crée un cycle
      if (detectCycle()) {
        // Supprimer la transition ajoutée
        edges.value = edges.value.filter(edge => edge.id !== newTransition.id);
        validateAutomate();
        return { success: false, message: 'Impossible de créer une transition : Automate Cyclique' };
      }
      
      // Valider l'automate après l'ajout
      validateAutomate();
      
      return { success: true, message: 'Transition ajoutée avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transition:', error);
      return { success: false, message: 'Erreur lors de l\'ajout de la transition' };
    }
  };

  /**
   * Modifie une transition existante
   * @param {Object} transition - Informations sur la transition à modifier
   * @returns {Object} Résultat de l'opération
   */
  const editTransition = (transition) => {
    try {
      // Sauvegarder l'état actuel dans l'historique avant de modifier une transition
      saveToHistory();
      
      // Trouver la transition à modifier
      const index = edges.value.findIndex(edge => edge.id === transition.id);
      if (index === -1) {
        return { success: false, message: 'Transition non trouvée' };
      }
      
      // Vérifier si la modification crée un doublon
      const isDuplicate = edges.value.some(
        edge => edge.source === transition.source && 
               edge.target === transition.target && 
               edge.id !== transition.id
      );
      
      if (isDuplicate) {
        return { success: false, message: 'Cette transition existe déjà' };
      }
      
      // Sauvegarder l'ancienne transition pour la restaurer en cas de cycle
      const oldTransition = { ...edges.value[index] };
      
      // Mise à jour de la transition
      edges.value[index] = {
        ...edges.value[index],
        id: transition.id,
        source: transition.source,
        target: transition.target,
        label: transition.label
      };
      
      // Force la réactivité en créant un nouveau tableau
      edges.value = [...edges.value];
      
      // Vérifier si la modification crée un cycle
      if (detectCycle()) {
        // Restaurer l'ancienne transition
        edges.value[index] = oldTransition;
        edges.value = [...edges.value];
        validateAutomate();
        return { success: false, message: 'Impossible de modifier la transition : Automate Cyclique' };
      }
      
      // Valider l'automate après la modification
      validateAutomate();
      
      return { success: true, message: 'Transition modifiée avec succès' };
    } catch (error) {
      console.error('Erreur lors de la modification de la transition:', error);
      return { success: false, message: 'Erreur lors de la modification de la transition' };
    }
  };

  /**
   * Supprime une transition
   * @param {String} id - ID de la transition à supprimer
   * @returns {Object} Résultat de l'opération
   */
  const removeTransition = (id) => {
    try {
      // Sauvegarder l'état actuel dans l'historique avant de supprimer une transition
      saveToHistory();
      
      // Vérifier si l'ID est valide
      if (!id) {
        return { success: false, message: 'ID de transition invalide' };
      }
      
      // Trouver l'index de la transition à supprimer
      const index = edges.value.findIndex(edge => edge.id === id);
      if (index === -1) {
        return { success: false, message: 'Transition non trouvée' };
      }
      
      // Supprimer la transition
      edges.value.splice(index, 1);
      
      // Si c'était la transition active, la désélectionner
      if (activeTransitionId.value === id) {
        activeTransitionId.value = null;
      }
      
      // Valider l'automate après la suppression
      validateAutomate();
      
      return { success: true, message: 'Transition supprimée avec succès' };
    } catch (error) {
      console.error('Erreur lors de la suppression de la transition:', error);
      return { success: false, message: 'Erreur lors de la suppression de la transition' };
    }
  };

  /**
   * Inverse le sens d'une transition
   * @param {Object} transition - Transition à inverser
   * @returns {Object} Résultat de l'opération
   */
  const invertTransition = (transition) => {
    try {
      // Sauvegarder l'état actuel dans l'historique avant de modifier une transition
      saveToHistory();
      
      // Vérifier si la connexion inversée existe déjà
      const connectionExists = edges.value.some(
        edge => edge.source === transition.target && 
               edge.target === transition.source
      );
      
      if (connectionExists) {
        return { success: false, message: 'Une transition dans ce sens existe déjà' };
      }
      
      // Copie des edges actuelles
      const updatedEdges = [...edges.value];
      
      // Trouver l'index de la transition à modifier
      const index = updatedEdges.findIndex(edge => edge.id === transition.id);
      if (index === -1) {
        return { success: false, message: 'Transition non trouvée' };
      }
      
      // Créer une nouvelle edge avec source et target inversés, mais conserver l'id et les autres propriétés
      const invertedEdge = {
        ...updatedEdges[index],
        id: updatedEdges[index].id, // Conserver le même ID
        source: transition.target,
        target: transition.source
      };
      
      // Remplacer l'ancienne edge par la nouvelle
      updatedEdges[index] = invertedEdge;
      
      // Mettre à jour le tableau complet (pour garantir la réactivité)
      edges.value = updatedEdges;
      
      // Vérifier si l'inversion crée un cycle
      if (detectCycle()) {
        // Restaurer l'ancienne transition (retour à l'état avant la modification)
        const oldTransition = {
          ...invertedEdge,
          source: transition.source,
          target: transition.target
        };
        edges.value[index] = oldTransition;
        edges.value = [...edges.value]; // Force la réactivité
        validateAutomate();
        return { success: false, message: 'Impossible d\'inverser la transition : créerait un automate cyclique' };
      }
      
      // Valider l'automate après la modification
      validateAutomate();
      
      return { success: true, message: 'Transition inversée avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'inversion de la transition:', error);
      return { success: false, message: 'Erreur lors de l\'inversion' };
    }
  };

  /**
   * Sélectionne ou désélectionne une transition
   * @param {String} id - ID de la transition à sélectionner/désélectionner
   */
  const selectTransition = (id) => {
    // Si la transition est déjà sélectionnée, la désélectionner
    if (activeTransitionId.value === id) {
      activeTransitionId.value = null;
      updateEdgeStyles(null);
      // Utiliser les méthodes non dépréciées
      removeSelectedEdges(edges.value.filter(e => e.id === id));
    } else {
      // Sinon, sélectionner la nouvelle transition
      activeTransitionId.value = id;
      updateEdgeStyles(id);
      
      // Sélectionner l'arête dans VueFlow si id n'est pas null
      if (id) {
        const edge = edges.value.find(e => e.id === id);
        if (edge) {
          // D'abord désélectionner les éléments précédents si nécessaire
          if (activeTransitionId.value) {
            const oldEdges = edges.value.filter(e => e.id === activeTransitionId.value);
            if (oldEdges.length) {
              removeSelectedEdges(oldEdges);
            }
          }
          // Ajouter la nouvelle sélection avec la méthode non dépréciée
          addSelectedEdges([edge]);
        }
      }
    }
  };

  /**
   * Gère la mise à jour d'une arête par glisser-déposer
   * @param {Object} params - Paramètres de mise à jour
   */
  const handleEdgeUpdate = ({ oldEdge, newConnection }) => {
    // Récupérer les noms des états source et cible pour le dialogue
    const sourceNode = nodes.value.find(node => node.id === newConnection.source);
    const targetNode = nodes.value.find(node => node.id === newConnection.target);
    const sourceName = sourceNode ? sourceNode.data.label : newConnection.source;
    const targetName = targetNode ? targetNode.data.label : newConnection.target;
    
    // Stocker les données pour la confirmation
    edgeUpdateData.value = { oldEdge, newConnection };
    edgeUpdateSourceName.value = sourceName;
    edgeUpdateTargetName.value = targetName;
    
    // Ouvrir le modal de confirmation
    showEdgeUpdateModal.value = true;
  };

  /**
   * Confirme la mise à jour d'une arête
   * @returns {Object} Résultat de l'opération
   */
  const confirmEdgeUpdate = () => {
    // Sauvegarder l'état actuel dans l'historique
    saveToHistory();
    
    const { oldEdge, newConnection } = edgeUpdateData.value;
    
    // Supprimer l'ancienne connexion
    edges.value = edges.value.filter(e => e.id !== oldEdge.id);
    
    // Ajouter la nouvelle connexion avec le même label
    const updatedEdge = {
      ...oldEdge,
      id: `edge-${Date.now()}`,
      source: newConnection.source,
      target: newConnection.target,
    };
    
    edges.value.push(updatedEdge);
    
    // Vérifier si la modification crée un cycle
    if (detectCycle()) {
      // Restaurer l'ancienne connexion
      edges.value = edges.value.filter(e => e.id !== updatedEdge.id);
      edges.value.push(oldEdge);
      validateAutomate();
      showEdgeUpdateModal.value = false;
      return { success: false, message: 'Impossible de modifier la transition : Automate Cyclique' };
    }
    
    // Valider l'automate après la modification
    validateAutomate();
    
    // Fermer le modal
    showEdgeUpdateModal.value = false;
    return { success: true, message: 'Transition mise à jour' };
  };

  /**
   * Confirme l'ajout d'une transition depuis le modal
   * @returns {Object} Résultat de l'opération
   */
  const confirmAddTransition = () => {
    try {
      // Vérifier si tous les champs sont remplis
      if (!editingTransition.value.source || !editingTransition.value.target || !editingTransition.value.function) {
        editTransitionError.value = 'Tous les champs sont requis';
        return { success: false };
      }
      
      const result = addTransition({
        source: editingTransition.value.source,
        target: editingTransition.value.target,
        label: editingTransition.value.function
      });
      
      if (result.success) {
        showAddTransitionModal.value = false;
        return { success: true, message: 'Transition ajoutée avec succès' };
      } else {
        editTransitionError.value = result.message;
        return result;
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transition:', error);
      editTransitionError.value = 'Une erreur s\'est produite';
      return { success: false, message: 'Une erreur s\'est produite' };
    }
  };

  /**
   * Confirme l'édition d'une transition depuis le modal
   * @returns {Object} Résultat de l'opération
   */
  const confirmEditTransition = () => {
    try {
      // Vérifier si tous les champs sont remplis
      if (!editingTransition.value.source || !editingTransition.value.target || !editingTransition.value.function) {
        editTransitionError.value = 'Tous les champs sont requis';
        return { success: false };
      }
      
      // Vérifier si cette connexion existe déjà (sauf pour la transition en cours d'édition)
      const duplicateExists = edges.value.some(
        edge => edge.source === editingTransition.value.source && 
               edge.target === editingTransition.value.target && 
               edge.id !== editingTransition.value.id
      );
      
      if (duplicateExists) {
        editTransitionError.value = 'Cette transition existe déjà';
        return { success: false };
      }
      
      const result = editTransition({
        id: editingTransition.value.id,
        source: editingTransition.value.source,
        target: editingTransition.value.target,
        label: editingTransition.value.function
      });
      
      if (result.success) {
        showEditTransitionModal.value = false;
        return { success: true, message: 'Transition modifiée avec succès' };
      } else {
        editTransitionError.value = result.message;
        return result;
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la transition:', error);
      editTransitionError.value = 'Une erreur s\'est produite';
      return { success: false, message: 'Une erreur s\'est produite' };
    }
  };

  /**
   * Confirme la suppression d'une transition depuis le modal
   * @returns {Object} Résultat de l'opération
   */
  const confirmRemoveTransition = () => {
    try {
      if (!removeTransitionId.value) {
        return { success: false, message: 'ID de transition manquant' };
      }
      
      const result = removeTransition(removeTransitionId.value);
      
      if (result.success) {
        showRemoveTransitionModal.value = false;
        removeTransitionId.value = null;
        return { success: true, message: 'Transition supprimée avec succès' };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la transition:', error);
      return { success: false, message: 'Erreur lors de la suppression' };
    }
  };

  /**
   * Confirme l'inversion d'une transition depuis le modal
   * @returns {Object} Résultat de l'opération
   */
  const confirmInvertTransition = () => {
    try {
      if (!invertingTransition.value.id) {
        return { success: false, message: 'Données de transition incomplètes' };
      }
      
      const result = invertTransition(invertingTransition.value);
      
      if (result.success) {
        showInvertTransitionModal.value = false;
        return { success: true, message: 'Transition inversée avec succès' };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Erreur lors de l\'inversion de la transition:', error);
      return { success: false, message: 'Erreur lors de l\'inversion' };
    }
  };

  /**
   * Gère la connexion de deux nœuds avec une arête
   * @param {Object} params - Paramètres de connexion
   * @returns {Object} Résultat de l'opération
   */
  const handleConnectNodes = ({ source, target }) => {
    if (source === target) {
      return { success: false, message: 'Impossible de connecter un état à lui-même' }
    }
    if (edges.value.some(e => e.source === source && e.target === target)) {
      return { success: false, message: 'Cette transition existe déjà' }
    }
  
    const sourceNode = nodes.value.find(n => n.id === source)
    const targetNode = nodes.value.find(n => n.id === target)
    return {
      success: true,
      source,
      target,
      sourceName: sourceNode?.data.label || source,
      targetName: targetNode?.data.label || target
    }
  }

  /**
   * Gère le clic sur une arête dans VueFlow
   * @param {Object} params - Paramètres de l'événement
   */
  const onEdgeClick = (params) => {
    const { edge } = params;
    selectTransition(edge.id);
  };

  // --- Méthodes pour le menu contextuel ---
  /**
   * Gestionnaire pour le clic droit sur une transition
   * @param {Object} params - Informations sur l'événement
   */
  const onEdgeContextMenu = ({ event, edge }) => {
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
   * Récupère le libellé d'une transition par son ID
   * @param {String} edgeId - ID de la transition
   * @returns {String} Libellé de la transition
   */
  const getEdgeLabelById = (edgeId) => {
    const edge = edges.value.find(e => e.id === edgeId);
    return edge ? edge.label : 'Transition';
  };

  /**
   * Sélectionne/désélectionne une transition depuis le menu contextuel
   */
  const selectTransitionFromContext = () => {
    const edgeId = edgeContextMenu.value.targetId;
    if (edgeId) {
      selectTransition(edgeId);
    }
    edgeContextMenu.value.visible = false;
  };

  /**
   * Édite une transition depuis le menu contextuel
   */
  const editTransitionFromContext = () => {
    const edgeId = edgeContextMenu.value.targetId;
    if (edgeId) {
      const edge = edges.value.find(e => e.id === edgeId);
      if (edge) {
        openEditTransitionModal(edge);
      }
    }
    edgeContextMenu.value.visible = false;
  };

  /**
   * Supprime une transition depuis le menu contextuel
   */
  const deleteTransitionFromContext = () => {
    const edgeId = edgeContextMenu.value.targetId;
    if (edgeId) {
      openRemoveTransitionModal(edgeId);
    }
    edgeContextMenu.value.visible = false;
  };

  /**
   * Inverse une transition depuis le menu contextuel
   */
  const invertTransitionFromContext = () => {
    const edgeId = edgeContextMenu.value.targetId;
    if (edgeId) {
      const edge = edges.value.find(e => e.id === edgeId);
      if (edge) {
        openInvertTransitionModal(edge);
      }
    }
    edgeContextMenu.value.visible = false;
  };

  /**
   * Masque le menu contextuel
   */
  const hideContextMenu = () => {
    edgeContextMenu.value.visible = false;
  };

  return {
    // États pour les modals
    showAddTransitionModal,
    showEditTransitionModal,
    showRemoveTransitionModal,
    showInvertTransitionModal,
    showEdgeUpdateModal,
    editingTransition,
    invertingTransition,
    removeTransitionId,
    editTransitionError,
    
    // États pour la mise à jour des arêtes
    edgeUpdateData,
    edgeUpdateSourceName,
    edgeUpdateTargetName,
    
    // État pour le menu contextuel
    edgeContextMenu,
    
    // Méthodes pour les styles
    updateEdgeStyles,
    
    // Méthodes pour les modals
    openAddTransitionModal,
    openEditTransitionModal,
    openRemoveTransitionModal,
    openInvertTransitionModal,
    
    // Méthodes pour la manipulation des transitions
    addTransition,
    editTransition,
    removeTransition,
    invertTransition,
    selectTransition,
    
    // Méthodes pour les mises à jour
    handleEdgeUpdate,
    confirmEdgeUpdate,
    
    // Méthodes pour les actions depuis le modal
    confirmAddTransition,
    confirmEditTransition,
    confirmRemoveTransition,
    confirmInvertTransition,
    
    // Méthodes pour les interactions avec VueFlow
    handleConnectNodes,
    onEdgeClick,
    
    // Méthodes pour le menu contextuel
    onEdgeContextMenu,
    getEdgeLabelById,
    selectTransitionFromContext,
    editTransitionFromContext,
    deleteTransitionFromContext,
    invertTransitionFromContext,
    hideContextMenu
  };




  
}