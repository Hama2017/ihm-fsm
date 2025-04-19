import { ref } from 'vue';
import { useVueFlow, MarkerType } from '@vue-flow/core';

/**
 * Composable pour gérer les transitions (arêtes) de l'automate
 * 
 * @param {Ref<Array>} nodes - Référence aux nœuds actuels
 * @param {Ref<Array>} edges - Référence aux arêtes actuelles
 * @param {Ref<String|null>} activeTransitionId - ID de la transition active
 * @param {Object} history - Objet historique issu de useHistory
 * @param {Function} validateAutomate - Fonction pour valider l'automate
 * @param {Function} detectCycle - Fonction pour détecter les cycles
 * @param {Function} getBaseEdgeStyle - Fonction pour obtenir le style de base d'une arête
 * @param {Function} getSelectedEdgeStyle - Fonction pour obtenir le style d'une arête sélectionnée
 * @returns {Object} - Fonctions et états pour la gestion des transitions
 */
export default function useTransitionManager(
  nodes, 
  edges, 
  activeTransitionId, 
  history, 
  validateAutomate, 
  detectCycle,
  getBaseEdgeStyle,
  getSelectedEdgeStyle
) {
  // États pour les modals
  const showEditTransitionModal = ref(false);
  const showRemoveTransitionModal = ref(false);
  const showInvertTransitionModal = ref(false);
  const editingTransition = ref({ id: '', source: '', target: '', function: '' });
  const invertingTransition = ref({ id: '', source: '', target: '', label: '' });
  const removeTransitionId = ref(null);
  const editTransitionError = ref('');
  
  // Variables pour la mise à jour des arêtes par drag & drop
  const edgeUpdateData = ref(null);
  const edgeUpdateSourceName = ref('');
  const edgeUpdateTargetName = ref('');
  const showEdgeUpdateModal = ref(false);

  // Récupérer les méthodes de VueFlow
  const { setSelectedElements } = useVueFlow();

  /**
   * Met à jour les styles des arêtes
   */
  const updateEdgeStyles = (selectedId) => {
    edges.value.forEach(edge => {
      edge.style = edge.id === selectedId 
        ? getSelectedEdgeStyle() 
        : getBaseEdgeStyle();
    });
  };

  /**
   * Ouvre le modal d'édition de transition
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
   */
  const openRemoveTransitionModal = (edgeId) => {
    removeTransitionId.value = edgeId;
    showRemoveTransitionModal.value = true;
  };

  /**
   * Ouvre le modal d'inversion de transition
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

  /**
   * Ajoute une nouvelle transition
   */
  const addTransition = (transition) => {
    try {
      // Sauvegarder l'état actuel dans l'historique
      history.saveToHistory();
      
      // Vérification que les données nécessaires sont présentes
      if (!transition.source || !transition.target || !transition.label) {
        return { success: false, message: 'Données de transition incomplètes' };
      }
      
      // Vérifier si c'est une transition avec lui-même
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
   */
  const editTransition = (transition) => {
    try {
      // Sauvegarder l'état actuel dans l'historique
      history.saveToHistory();
      
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
   */
  const removeTransition = (id) => {
    try {
      // Sauvegarder l'état actuel dans l'historique
      history.saveToHistory();
      
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
   */
  const invertTransition = (transition) => {
    try {
      // Sauvegarder l'état actuel dans l'historique
      history.saveToHistory();
      
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
        edges.value = history.historyStack.value[history.historyIndex.value].edges;
        validateAutomate();
        return { success: false, message: 'Impossible d\'inverser la transition : créerait un automate cyclique' };
      }
      
      // Valider l'automate après la modification
      validateAutomate();
      
      // Si la transition était sélectionnée, on la maintient sélectionnée
      if (activeTransitionId.value === transition.id) {
        updateEdgeStyles(activeTransitionId.value);
      }
      
      return { success: true, message: 'Transition inversée avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'inversion de la transition:', error);
      return { success: false, message: 'Erreur lors de l\'inversion' };
    }
  };

  /**
   * Sélectionne ou désélectionne une transition
   */
  const selectTransition = (id) => {
    // Si la transition est déjà sélectionnée, la désélectionner
    if (activeTransitionId.value === id) {
      activeTransitionId.value = null;
      updateEdgeStyles(null);
      setSelectedElements({ nodes: [], edges: [] });
    } else {
      // Sinon, sélectionner la nouvelle transition
      activeTransitionId.value = id;
      updateEdgeStyles(id);
      
      // Sélectionner l'arête dans VueFlow si id n'est pas null
      if (id) {
        const edge = edges.value.find(e => e.id === id);
        if (edge) {
          setSelectedElements({ nodes: [], edges: [edge] });
        }
      }
    }
  };

  /**
   * Gère la mise à jour d'une arête par glisser-déposer
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
   */
  const confirmEdgeUpdate = () => {
    // Sauvegarder l'état actuel dans l'historique
    history.saveToHistory();
    
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
   * Confirme l'édition d'une transition depuis le modal
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
   * Gère le clic sur une arête dans VueFlow
   */
  const handleEdgeClick = (params) => {
    const { edge } = params;
    selectTransition(edge.id);
  };

  /**
   * Gère la connexion de deux nœuds avec une arête
   */
  const handleConnectNodes = ({ source, target }) => {
    // Éviter les connexions d'un nœud à lui-même
    if (source === target) {
      return { success: false, message: 'Impossible de connecter un état à lui-même' };
    }
    
    // Vérifier si cette connexion existe déjà
    const connectionExists = edges.value.some(
      edge => edge.source === source && edge.target === target
    );
    
    if (connectionExists) {
      return { success: false, message: 'Cette transition existe déjà' };
    }
    
    // Récupérer les noms des états source et cible pour le dialogue
    const sourceNode = nodes.value.find(node => node.id === source);
    const targetNode = nodes.value.find(node => node.id === target);
    const sourceName = sourceNode ? sourceNode.data.label : source;
    const targetName = targetNode ? targetNode.data.label : target;
    
    // Retourner les informations pour ouvrir le modal dans le composant parent
    return { 
      success: true, 
      source, 
      target, 
      sourceName, 
      targetName 
    };
  };

  return {
    // États
    showEditTransitionModal,
    showRemoveTransitionModal,
    showInvertTransitionModal,
    showEdgeUpdateModal,
    editingTransition,
    invertingTransition,
    removeTransitionId,
    editTransitionError,
    edgeUpdateData,
    edgeUpdateSourceName,
    edgeUpdateTargetName,
    
    // Méthodes
    updateEdgeStyles,
    openEditTransitionModal,
    openRemoveTransitionModal,
    openInvertTransitionModal,
    addTransition,
    editTransition,
    removeTransition,
    invertTransition,
    selectTransition,
    handleEdgeUpdate,
    confirmEdgeUpdate,
    confirmEditTransition,
    confirmRemoveTransition,
    confirmInvertTransition,
    handleEdgeClick,
    handleConnectNodes
  };
}