import { ref } from 'vue';
import { MarkerType } from '@vue-flow/core';
import toast from '@/composables/Toast/useToast';

/**
 * Composable pour gérer les automates (ajout, édition, suppression, sélection)
 * 
 * @param {Object} options Configuration du composable
 * @param {Ref<Array>} options.contractAutomates Liste des automates du contrat
 * @param {Ref<String|null>} options.activeAutomateId ID de l'automate actif
 * @param {Ref<Array>} options.currentNodes Nœuds de l'automate actif
 * @param {Ref<Array>} options.currentEdges Arêtes de l'automate actif
 * @param {Ref<String|null>} options.activeStateId ID de l'état actif
 * @param {Ref<String|null>} options.activeTransitionId ID de la transition active
 * @param {Ref<Array>} options.historyStack Pile d'historique pour undo/redo
 * @param {Ref<Number>} options.historyIndex Index dans la pile d'historique
 * @param {Ref<Boolean>} options.canUndo Possibilité d'annuler
 * @param {Ref<Boolean>} options.canRedo Possibilité de rétablir
 * @param {Function} options.updateNodeStyles Fonction pour mettre à jour les styles des nœuds
 * @param {Function} options.updateEdgeStyles Fonction pour mettre à jour les styles des arêtes
 * @param {Function} options.validateAutomate Fonction pour valider l'automate
 * @param {Function} options.getNodeConfig Fonction pour obtenir la configuration d'un nœud
 * @param {Function} options.getBaseNodeStyle Fonction pour obtenir le style de base d'un nœud
 * @param {Function} options.getBaseEdgeStyle Fonction pour obtenir le style de base d'une arête
 * @returns {Object} Fonctions et états pour la gestion des automates
 */
export default function useAutomate({
  contractAutomates,
  activeAutomateId,
  currentNodes,
  currentEdges,
  activeStateId,
  activeTransitionId,
  historyStack,
  historyIndex,
  canUndo,
  canRedo,
  updateNodeStyles,
  updateEdgeStyles,
  validateAutomate,
  getNodeConfig,
  getBaseNodeStyle,
  getBaseEdgeStyle
}) {
  // États pour le modal d'édition d'automate
  const showAutomateModal = ref(false);
  const editingAutomateId = ref(null);
  const editingAutomateName = ref('');
  const automateModalError = ref('');
  
  // --- Fonctions pour interagir avec les automates ---
  
  /**
   * Sélectionne un automate
   * @param {String} id ID de l'automate à sélectionner
   */
  const selectAutomate = (id) => {
    if (activeAutomateId.value === id) {
      // Si on clique sur l'automate déjà actif, on le désélectionne
      activeAutomateId.value = null;
      currentNodes.value = [];
      currentEdges.value = [];
      activeStateId.value = null;
      activeTransitionId.value = null;
      return;
    }
    
    // Si on change d'automate, on sauvegarde l'état actuel si nécessaire
    if (activeAutomateId.value) {
      saveCurrentAutomateState();
    }
    
    // Puis on charge le nouvel automate
    activeAutomateId.value = id;
    loadAutomateState(id);
    
    // Réinitialiser l'état actif
    activeStateId.value = null;
    activeTransitionId.value = null;
    
    // Réinitialiser l'historique pour le nouvel automate
    historyStack.value = [];
    historyIndex.value = -1;
    canUndo.value = false;
    canRedo.value = false;
    
    // Sauvegarder l'état initial dans l'historique
    saveToHistory();
    
    // Valider l'automate après le chargement
    validateAutomate();
    
    // Centrer le graphe
    setTimeout(() => {
      // Cette fonction sera appelée par le composant parent
      // nous émettons simplement un événement ici
    }, 100);
  };
  
  /**
   * Ouvre le modal pour ajouter un automate
   */
  const addAutomate = () => {
    // Réinitialiser les champs du modal
    editingAutomateId.value = null;
    editingAutomateName.value = '';
    automateModalError.value = '';
    
    // Afficher le modal
    showAutomateModal.value = true;
  };
  
  /**
   * Ouvre le modal pour éditer un automate
   * @param {String} id ID de l'automate à éditer
   */
  const editAutomate = (id) => {
    const automate = contractAutomates.value.find(a => a.id === id);
    if (!automate) return;
    
    // Préremplir les champs du modal
    editingAutomateId.value = id;
    editingAutomateName.value = automate.name;
    automateModalError.value = '';
    
    // Afficher le modal
    showAutomateModal.value = true;
  };
  
  /**
   * Supprime un automate
   * @param {String} id ID de l'automate à supprimer
   */
  const removeAutomate = (id) => {
    // Trouver l'index de l'automate à supprimer
    const index = contractAutomates.value.findIndex(a => a.id === id);
    if (index === -1) return;
    
    // Si on supprime l'automate actif, il faut réinitialiser l'affichage
    if (activeAutomateId.value === id) {
      activeAutomateId.value = null;
      currentNodes.value = [];
      currentEdges.value = [];
      activeStateId.value = null;
      activeTransitionId.value = null;
    }
    
    // Supprimer l'automate
    contractAutomates.value.splice(index, 1);
    
    // Si c'était le dernier automate actif, sélectionner le premier disponible
    if (contractAutomates.value.length > 0 && !activeAutomateId.value) {
      selectAutomate(contractAutomates.value[0].id);
    }
    
    toast.success('Clause supprimé avec succès');
  };
  
  /**
   * Confirme l'ajout ou la modification d'un automate
   */
  const confirmAutomateEdit = () => {
    // Validation
    if (!editingAutomateName.value.trim()) {
      automateModalError.value = 'Le nom de l\'automate ne peut pas être vide';
      return;
    }
    
    // Vérifier si le nom existe déjà (sauf pour l'automate en cours d'édition)
    const nameExists = contractAutomates.value.some(a => 
      a.name.toLowerCase() === editingAutomateName.value.trim().toLowerCase() && 
      a.id !== editingAutomateId.value
    );
    
    if (nameExists) {
      automateModalError.value = 'Une clause avec ce nom existe déjà';
      return;
    }
    
    if (editingAutomateId.value) {
      // Modification d'un automate existant
      const automate = contractAutomates.value.find(a => a.id === editingAutomateId.value);
      if (automate) {
        automate.name = editingAutomateName.value.trim();
        toast.success(`Automate "${automate.name}" modifié avec succès`);
      }
    } else {
      // Création d'un nouvel automate
      const newId = generateNewAutomateId();
      const newAutomate = {
        id: newId,
        name: editingAutomateName.value.trim(),
        states: [
          { 
            id: 'state-1', 
            label: 'État Initial', 
            position: { x: 100, y: 150 },
            ...getNodeConfig('initial')
          },
          { 
            id: 'state-2', 
            label: 'État Final', 
            position: { x: 300, y: 150 },
            ...getNodeConfig('final')
          }
        ],
        transitions: [
          { 
            id: 'edge-1', 
            source: 'state-1', 
            target: 'state-2', 
            label: 'terminer', 
            markerEnd: MarkerType.ArrowClosed
          }
        ]
      };
      
      contractAutomates.value.push(newAutomate);
      toast.success(`Clause "${newAutomate.name}" créé avec succès`);
      
      // Sélectionner le nouvel automate
      selectAutomate(newId);
    }
    
    // Fermer le modal
    showAutomateModal.value = false;
  };
  
  /**
   * Génère un nouvel ID pour un automate
   * @returns {String} Nouvel ID
   */
  const generateNewAutomateId = () => {
    if (contractAutomates.value.length === 0) {
      return '01';
    }
    
    // Trouver l'ID maximum et incrémenter
    const maxId = Math.max(...contractAutomates.value.map(a => parseInt(a.id)));
    return String(maxId + 1).padStart(2, '0');
  };
  
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
      nodes: JSON.parse(JSON.stringify(currentNodes.value)),
      edges: JSON.parse(JSON.stringify(currentEdges.value)),
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
   * Sauvegarde l'état de l'automate actif
   */
  const saveCurrentAutomateState = () => {
    if (!activeAutomateId.value) return;
    
    const automate = contractAutomates.value.find(a => a.id === activeAutomateId.value);
    
    if (!automate) return;
    
    // Convertir les nœuds en états
    automate.states = currentNodes.value.map(node => {
      // Déterminer le type de nœud
      let type = 'standard';
      if (node.type === 'initialState') type = 'initial';
      if (node.type === 'finalState') type = 'final';
      
      return {
        id: node.id,
        label: node.data.label,
        position: { x: node.position.x, y: node.position.y },
        type,
        sourcePosition: node.sourcePosition,
        targetPosition: node.targetPosition,
      };
    });
    
    // Sauvegarder les transitions
    automate.transitions = currentEdges.value.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      markerEnd: edge.markerEnd,
      conditions: edge.conditions || [],
      automataDependencies: edge.automataDependencies || null

    }));
  };
  
  /**
   * Charge l'état d'un automate
   * @param {String} automateId ID de l'automate à charger
   */
  const loadAutomateState = (automateId) => {
    const automate = contractAutomates.value.find(a => a.id === automateId);
    
    if (!automate) {
      currentNodes.value = [];
      currentEdges.value = [];
      return;
    }
    
    // Convertir les états en nœuds pour VueFlow
    currentNodes.value = automate.states.map(state => {
      // Déterminer le type de nœud en fonction des connexions
      let nodeType = 'standard';
      if (automate.transitions.some(t => t.target === state.id) && 
          !automate.transitions.some(t => t.source === state.id)) {
        nodeType = 'final';
      } else if (!automate.transitions.some(t => t.target === state.id) && 
                 automate.transitions.some(t => t.source === state.id)) {
        nodeType = 'initial';
      }
      
      // Utiliser le type explicite s'il est défini
      if (state.type) nodeType = state.type;
      
      const config = getNodeConfig(nodeType);
      
      return {
        id: state.id,
        position: state.position || { x: 50 + Math.random() * 400, y: 50 + Math.random() * 300 },
        data: { label: state.label },
        ...config,
        style: getBaseNodeStyle(),
      };
    });
    
    // Charger les transitions
    currentEdges.value = automate.transitions.map(transition => ({
      ...transition,
      id: transition.id,
      source: transition.source,
      target: transition.target,
      label: transition.label,
      markerEnd: MarkerType.ArrowClosed,
      style: getBaseEdgeStyle(),
      conditions: transition.conditions || [] ,
      automataDependencies: transition.automataDependencies || null
    }));
    
    // Mettre à jour les styles si une transition est active
    updateEdgeStyles(activeTransitionId.value);
  };
  
  /**
   * Annule la dernière action
   */
  const undo = () => {
    if (historyIndex.value > 0) {
      historyIndex.value--;
      const previousState = historyStack.value[historyIndex.value];
      
      currentNodes.value = previousState.nodes;
      currentEdges.value = previousState.edges;
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
   * Rétablit la dernière action annulée
   */
  const redo = () => {
    if (historyIndex.value < historyStack.value.length - 1) {
      historyIndex.value++;
      const nextState = historyStack.value[historyIndex.value];
      
      currentNodes.value = nextState.nodes;
      currentEdges.value = nextState.edges;
      activeStateId.value = nextState.activeStateId;
      activeTransitionId.value = nextState.activeTransitionId;
      
      // Mettre à jour la possibilité d'annuler/rétablir
      canUndo.value = historyIndex.value > 0;
      canRedo.value = historyIndex.value < historyStack.value.length - 1;
      
      updateNodeStyles(activeStateId.value);
      updateEdgeStyles(activeTransitionId.value);
    }
  };
  
  // Calculer le nom de l'automate actif
  const activeAutomateName = () => {
    const automate = contractAutomates.value.find(a => a.id === activeAutomateId.value);
    return automate?.name || '';
  };

  return {
    // États
    showAutomateModal,
    editingAutomateId,
    editingAutomateName,
    automateModalError,
    
    // Méthodes pour la gestion des automates
    selectAutomate,
    addAutomate,
    editAutomate,
    removeAutomate,
    confirmAutomateEdit,
    
    // Méthodes pour l'historique
    saveToHistory,
    saveCurrentAutomateState,
    loadAutomateState,
    undo,
    redo,
    
    // Getters
    activeAutomateName
  };
}