import { ref } from 'vue';
import { useVueFlow, MarkerType } from '@vue-flow/core';
import toast from '@/composables/Toast/useToast';
import useDependencyChecker from '@/composables/contract/useDependencyChecker';

/**
 * Composable pour gérer tout ce qui est relatif aux transitions (edges) dans l'éditeur de contrat
 */
export default function useTransition({
  nodes,
  edges,
  activeTransitionId,
  contractAutomates,
  activeAutomateId,
  saveToHistory,
  validateAutomate,
  detectCycle,
  getBaseEdgeStyle,
  getSelectedEdgeStyle,
  packetCondition,
  isSaved
}) {
  // --- VueFlow ---
  const { addSelectedEdges, removeSelectedEdges } = useVueFlow();

  // --- Vérificateur de dépendances ---
  const { wouldCreateCycle } = useDependencyChecker({
    contractAutomates,
    activeAutomateId
  });

  // =============================================================================
  // ÉTATS DES MODALS
  // =============================================================================
  const showAddTransitionModal = ref(false);
  const showEditTransitionModal = ref(false);
  const showRemoveTransitionModal = ref(false);
  const showInvertTransitionModal = ref(false);
  const showEdgeUpdateModal = ref(false);
  const showConditionInfoModal = ref(false);
  const showAddConditionModal = ref(false);
  const showConditionRemoveModal = ref(false);
  const showAutomataDependencyModal = ref(false);

  // ✅ NOUVEAU: États du modal de connexion
  const showConnectionModal = ref(false);
  const connectionModalData = ref({
    source: '',
    target: '',
    sourceName: '',
    targetName: ''
  });
  const connectionSelectedConditions = ref([]);
  const connectionExpandedPackages = ref({});
  const connectionModalError = ref('');

  // =============================================================================
  // VARIABLES D'ÉTAT
  // =============================================================================
  const newTransition = ref({ source: '', target: '', function: '', conditions: [] });
  const editingTransition = ref({ id: '', source: '', target: '', function: '', conditions: [] });
  const invertingTransition = ref({ id: '', source: '', target: '', label: '' });
  const removeTransitionId = ref(null);
  const edgeUpdateData = ref(null);
  const edgeUpdateSourceName = ref('');
  const edgeUpdateTargetName = ref('');

  // Variables pour les conditions
  const selectedCondition = ref(null);
  const selectedConditions = ref([]);
  const editingConditionsForTransition = ref({ id: '', conditions: [] });
  const removingCondition = ref({ transitionId: '', conditionId: '', conditionLabel: '' });

  // Variables pour les dépendances
  const selectedAutomates = ref([]);
  const currentEdgeForDependency = ref(null);

  // États d'expansion des packages
  const expandedPackages = ref({});
  const newTransitionExpandedPackages = ref({});
  const editingTransitionExpandedPackages = ref({});

  // Messages d'erreur
  const modalError = ref('');
  const editTransitionError = ref('');
  const conditionModalError = ref('');
  const dependencyModalError = ref('');

  // Menu contextuel
  const edgeContextMenu = ref({ visible: false, x: 0, y: 0, targetId: null });

  // =============================================================================
  // ✅ FONCTIONS UTILITAIRES POUR LA GÉNÉRATION DE NOMS
  // =============================================================================

  const normalizeStateName = (stateName) => {
    return stateName
      .normalize('NFD') // Décompose les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-zA-Z0-9]/g, '_') // Remplace les caractères spéciaux par des underscores
      .replace(/_+/g, '_') // Remplace les underscores multiples par un seul
      .replace(/^_|_$/g, '') // Supprime les underscores au début et à la fin
      .toLowerCase(); // Convertit en minuscules
  };

  const generateTransitionName = (sourceNodeId, targetNodeId) => {
    const sourceNode = nodes.value.find(n => n.id === sourceNodeId);
    const targetNode = nodes.value.find(n => n.id === targetNodeId);
    
    const sourceName = sourceNode ? normalizeStateName(sourceNode.data.label) : 'unknown';
    const targetName = targetNode ? normalizeStateName(targetNode.data.label) : 'unknown';
    
    return `${sourceName}_to_${targetName}`;
  };

  // ✅ NOUVELLE: Fonction pour générer le nom depuis les données du modal
  const generateConnectionTransitionName = () => {
    if (!connectionModalData.value.sourceName || !connectionModalData.value.targetName) return '';
    
    const normalizedSource = normalizeStateName(connectionModalData.value.sourceName);
    const normalizedTarget = normalizeStateName(connectionModalData.value.targetName);
    
    return `${normalizedSource}_to_${normalizedTarget}`;
  };

  // =============================================================================
  // MÉTHODES UTILITAIRES
  // =============================================================================

  const initializePackages = () => {
    if (packetCondition?.value) {
      packetCondition.value.forEach((_, index) => {
        expandedPackages.value[index] = true;
        newTransitionExpandedPackages.value[index] = false;
        editingTransitionExpandedPackages.value[index] = false;
      });
    }
    // ✅ Initialiser aussi les packages de connexion
    initializeConnectionPackages();
  };

  // ✅ FONCTIONS POUR LE MODAL DE CONNEXION
  const initializeConnectionPackages = () => {
    if (packetCondition?.value) {
      packetCondition.value.forEach((_, index) => {
        connectionExpandedPackages.value[index] = false;
      });
    }
  };

  const toggleConnectionPackage = (index) => {
    connectionExpandedPackages.value[index] = !connectionExpandedPackages.value[index];
  };

  const removeConnectionCondition = (conditionId) => {
    connectionSelectedConditions.value = connectionSelectedConditions.value.filter(id => id !== conditionId);
  };

  const getConnectionConditionLabel = (conditionId) => {
    if (!packetCondition?.value) return conditionId;
    for (const pkg of packetCondition.value) {
      const condition = pkg.functions.find(c => c.id === conditionId);
      if (condition) {
        return condition.label;
      }
    }
    return conditionId;
  };

  const openConnectionModal = (source, target, sourceName, targetName) => {
    connectionModalData.value = { source, target, sourceName, targetName };
    connectionSelectedConditions.value = [];
    connectionModalError.value = '';
    showConnectionModal.value = true;
  };

  const confirmConnection = () => {
    const result = addTransition({
      source: connectionModalData.value.source,
      target: connectionModalData.value.target,
      conditions: connectionSelectedConditions.value
    });

    if (result.success) {
      showConnectionModal.value = false;
      toast.success('Transition créée avec succès');
      return { success: true };
    } else {
      connectionModalError.value = result.message;
      return { success: false, message: result.message };
    }
  };

  const findCondition = (conditionId) => {
    if (!packetCondition?.value) return null;
    for (const pkg of packetCondition.value) {
      const condition = pkg.functions.find(c => c.id === conditionId);
      if (condition) return condition;
    }
    return null;
  };

  const getConditionLabel = (conditionId) => {
    const condition = findCondition(conditionId);
    return condition ? condition.label : conditionId;
  };

  const getConditionPackageName = (conditionId) => {
    if (!packetCondition?.value) return 'Inconnu';
    for (const pkg of packetCondition.value) {
      if (pkg.functions.some(c => c.id === conditionId)) {
        return pkg.label;
      }
    }
    return 'Inconnu';
  };

  const getAutomataName = (dependencyId) => {
    const automate = contractAutomates.value.find(a => a.id === dependencyId);
    return automate ? automate.name : dependencyId;
  };

  const getSelectedAutomateName = (automateId) => {
    const automate = contractAutomates.value.find(a => a.id === automateId);
    return automate ? automate.name : `Automate ${automateId}`;
  };

  const availableAutomates = () => {
    const currentAutomateId = activeAutomateId.value;
    return contractAutomates.value.filter(automate => automate.id !== currentAutomateId && automate.id !== 'flow-deploiement');
  };

  const updateEdgeStyles = (selectedId) => {
    edges.value.forEach(edge => {
      edge.style = edge.id === selectedId 
        ? getSelectedEdgeStyle() 
        : getBaseEdgeStyle();
    });
  };

  // =============================================================================
  // MÉTHODES POUR LES PACKAGES
  // =============================================================================

  const togglePackage = (index) => {
    expandedPackages.value[index] = !expandedPackages.value[index];
  };

  const toggleNewTransitionPackage = (index) => {
    newTransitionExpandedPackages.value[index] = !newTransitionExpandedPackages.value[index];
  };

  const toggleEditingTransitionPackage = (index) => {
    editingTransitionExpandedPackages.value[index] = !editingTransitionExpandedPackages.value[index];
  };

  const toggleSelectedAutomate = (automateId) => {
    const index = selectedAutomates.value.indexOf(automateId);
    if (index === -1) {
      selectedAutomates.value.push(automateId);
    } else {
      selectedAutomates.value.splice(index, 1);
    }
  };

  // =============================================================================
  // MÉTHODES POUR OUVRIR LES MODALS
  // =============================================================================

  const openAddTransitionModal = () => {
    newTransition.value = { source: '', target: '', function: '', conditions: [] };
    modalError.value = '';
    showAddTransitionModal.value = true;
  };

  const openEditTransitionModal = (edge) => {
    editingTransition.value = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      function: edge.label, 
      conditions: edge.conditions || []
    };
    editTransitionError.value = '';
    showEditTransitionModal.value = true;
  };

  const openRemoveTransitionModal = (edgeId) => {
    removeTransitionId.value = edgeId;
    showRemoveTransitionModal.value = true;
  };

  const openInvertTransitionModal = (edge) => {
    invertingTransition.value = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label
    };
    showInvertTransitionModal.value = true;
  };

  const openConditionInfoModal = (conditionId) => {
    selectedCondition.value = findCondition(conditionId);
    if (selectedCondition.value) {
      showConditionInfoModal.value = true;
    } else {
      toast.error('Condition non trouvée');
    }
  };

  const openAddConditionModal = (edge) => {
    editingConditionsForTransition.value = {
      id: edge.id,
      conditions: edge.conditions || []
    };
    selectedConditions.value = [...editingConditionsForTransition.value.conditions];
    showAddConditionModal.value = true;
  };

  const openRemoveConditionModal = (transitionId, conditionId) => {
    const condition = findCondition(conditionId);
    removingCondition.value = {
      transitionId,
      conditionId,
      conditionLabel: condition ? condition.label : conditionId
    };
    showConditionRemoveModal.value = true;
  };

  const openAddAutomataDependencyModal = (edge) => {
    currentEdgeForDependency.value = edge;
    selectedAutomates.value = edge.automataDependencies || [];
    dependencyModalError.value = '';
    showAutomataDependencyModal.value = true;
  };

  // =============================================================================
  // MÉTHODES POUR GÉRER LES CONDITIONS ET DÉPENDANCES
  // =============================================================================

  const removeConditionFromNewTransition = (conditionId) => {
    newTransition.value.conditions = newTransition.value.conditions.filter(id => id !== conditionId);
  };

  const removeConditionFromEditingTransition = (conditionId) => {
    editingTransition.value.conditions = editingTransition.value.conditions.filter(id => id !== conditionId);
  };

  const removeAutomataDependency = (edgeId, dependencyId) => {
    try {
      const edge = edges.value.find(e => e.id === edgeId);
      
      if (edge && edge.automataDependencies) {
        const updatedDependencies = edge.automataDependencies.filter(id => id !== dependencyId);
        
        const edgeIndex = edges.value.findIndex(e => e.id === edgeId);
        if (edgeIndex !== -1) {
          const updatedEdges = [...edges.value];
          updatedEdges[edgeIndex] = {
            ...updatedEdges[edgeIndex],
            automataDependencies: updatedDependencies
          };
          
          edges.value = updatedEdges;
          saveToHistory();
          if (isSaved) isSaved.value = false;
          
          toast.success('Dépendance supprimée avec succès');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la dépendance:', error);
      toast.error('Erreur lors de la suppression de la dépendance');
    }
  };

  // =============================================================================
  // MANIPULATION DES TRANSITIONS
  // =============================================================================

  const addTransition = (transition) => {
    try {
      saveToHistory();
      
      if (!transition.source || !transition.target) {
        return { success: false, message: 'Données de transition incomplètes' };
      }
      
      if (transition.source === transition.target) {
        return { success: false, message: 'Impossible de créer une transition sur le même état' };
      }
      
      const existingTransition = edges.value.find(
        edge => edge.source === transition.source && edge.target === transition.target
      );
      
      if (existingTransition) {
        return { success: false, message: 'Cette transition existe déjà' };
      }
      
      // ✅ Générer automatiquement le nom de la transition
      const generatedLabel = generateTransitionName(transition.source, transition.target);
      
      const newEdge = {
        id: transition.id || `edge-${Date.now()}`,
        source: transition.source,
        target: transition.target,
        label: transition.label || generatedLabel, // ✅ Utiliser le nom généré comme fallback
        markerEnd: MarkerType.ArrowClosed,
        style: getBaseEdgeStyle(),
        conditions: transition.conditions || [],
        automataDependencies: transition.automataDependencies || []
      };
      
      edges.value.push(newEdge);
      
      if (detectCycle()) {
        edges.value = edges.value.filter(edge => edge.id !== newEdge.id);
        validateAutomate();
        return { success: false, message: 'Impossible de créer une transition : Automate Cyclique' };
      }
      
      validateAutomate();
      return { success: true, message: 'Transition ajoutée avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transition:', error);
      return { success: false, message: 'Erreur lors de l\'ajout de la transition' };
    }
  };


  const editTransition = (transition) => {
    try {
      saveToHistory();
      
      const index = edges.value.findIndex(edge => edge.id === transition.id);
      if (index === -1) {
        return { success: false, message: 'Transition non trouvée' };
      }
      
      const isDuplicate = edges.value.some(
        edge => edge.source === transition.source && 
               edge.target === transition.target && 
               edge.id !== transition.id
      );
      
      if (isDuplicate) {
        return { success: false, message: 'Cette transition existe déjà' };
      }
      
      const oldTransition = { ...edges.value[index] };
      
      // ✅ MODIFICATION : Utiliser le label fourni (déjà régénéré)
      edges.value[index] = {
        ...edges.value[index],
        source: transition.source,
        target: transition.target,
        label: transition.label, // ✅ Utiliser le label fourni directement
        conditions: transition.conditions || [],
        automataDependencies: transition.automataDependencies || edges.value[index].automataDependencies || []
      };
      
      edges.value = [...edges.value];
      
      if (detectCycle()) {
        edges.value[index] = oldTransition;
        edges.value = [...edges.value];
        validateAutomate();
        return { success: false, message: 'Impossible de modifier la transition : Automate Cyclique' };
      }
      
      validateAutomate();
      return { success: true, message: 'Transition modifiée avec succès' };
    } catch (error) {
      console.error('Erreur lors de la modification de la transition:', error);
      return { success: false, message: 'Erreur lors de la modification de la transition' };
    }
  };

  const removeTransition = (id) => {
    try {
      saveToHistory();
      
      if (!id) {
        return { success: false, message: 'ID de transition invalide' };
      }
      
      const index = edges.value.findIndex(edge => edge.id === id);
      if (index === -1) {
        return { success: false, message: 'Transition non trouvée' };
      }
      
      edges.value.splice(index, 1);
      
      if (activeTransitionId.value === id) {
        activeTransitionId.value = null;
      }
      
      validateAutomate();
      return { success: true, message: 'Transition supprimée avec succès' };
    } catch (error) {
      console.error('Erreur lors de la suppression de la transition:', error);
      return { success: false, message: 'Erreur lors de la suppression de la transition' };
    }
  };

  const selectTransition = (id) => {
    if (activeTransitionId.value === id) {
      activeTransitionId.value = null;
      updateEdgeStyles(null);
      removeSelectedEdges(edges.value.filter(e => e.id === id));
    } else {
      activeTransitionId.value = id;
      updateEdgeStyles(id);
      
      if (id) {
        const edge = edges.value.find(e => e.id === id);
        if (edge) {
          if (activeTransitionId.value) {
            const oldEdges = edges.value.filter(e => e.id === activeTransitionId.value);
            if (oldEdges.length) {
              removeSelectedEdges(oldEdges);
            }
          }
          addSelectedEdges([edge]);
        }
      }
    }
  };

  // =============================================================================
  // INTERACTIONS VUEFLOW
  // =============================================================================

  const handleConnectNodes = ({ source, target }) => {
    if (source === target) {
      return { success: false, message: 'Impossible de connecter un état à lui-même' };
    }
    if (edges.value.some(e => e.source === source && e.target === target)) {
      return { success: false, message: 'Cette transition existe déjà' };
    }
  
    const sourceNode = nodes.value.find(n => n.id === source);
    const targetNode = nodes.value.find(n => n.id === target);
    
    return {
      success: true,
      source,
      target,
      sourceName: sourceNode?.data.label || source,
      targetName: targetNode?.data.label || target
    };
  };

  const onEdgeClick = (params) => {
    const { edge } = params;
    selectTransition(edge.id);
  };

  const handleEdgeUpdate = ({ oldEdge, newConnection }) => {
    const sourceNode = nodes.value.find(node => node.id === newConnection.source);
    const targetNode = nodes.value.find(node => node.id === newConnection.target);
    const sourceName = sourceNode ? sourceNode.data.label : newConnection.source;
    const targetName = targetNode ? targetNode.data.label : newConnection.target;
    
    edgeUpdateData.value = { oldEdge, newConnection };
    edgeUpdateSourceName.value = sourceName;
    edgeUpdateTargetName.value = targetName;
    
    showEdgeUpdateModal.value = true;
  };

  const confirmEdgeUpdate = () => {
    saveToHistory();
    
    const { oldEdge, newConnection } = edgeUpdateData.value;
    
    edges.value = edges.value.filter(e => e.id !== oldEdge.id);
    
    const updatedEdge = {
      ...oldEdge,
      id: `edge-${Date.now()}`,
      source: newConnection.source,
      target: newConnection.target,
    };
    
    edges.value.push(updatedEdge);
    
    if (detectCycle()) {
      edges.value = edges.value.filter(e => e.id !== updatedEdge.id);
      edges.value.push(oldEdge);
      validateAutomate();
      showEdgeUpdateModal.value = false;
      return { success: false, message: 'Impossible de modifier la transition : Automate Cyclique' };
    }
    
    validateAutomate();
    showEdgeUpdateModal.value = false;
    return { success: true, message: 'Transition mise à jour' };
  };

  // =============================================================================
  // MENU CONTEXTUEL
  // =============================================================================

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

  const getEdgeLabelById = (edgeId) => {
    const edge = edges.value.find(e => e.id === edgeId);
    return edge ? edge.label : 'Transition';
  };

  const selectTransitionFromContext = () => {
    const edgeId = edgeContextMenu.value.targetId;
    if (edgeId) {
      selectTransition(edgeId);
    }
    edgeContextMenu.value.visible = false;
  };

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

  const deleteTransitionFromContext = () => {
    const edgeId = edgeContextMenu.value.targetId;
    if (edgeId) {
      openRemoveTransitionModal(edgeId);
    }
    edgeContextMenu.value.visible = false;
  };

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

  // =============================================================================
  // MÉTHODES DE VALIDATION
  // =============================================================================

  const validateNewTransition = () => {
    if (!newTransition.value.source) {
      modalError.value = 'L\'état source est requis';
      return false;
    }
    
    if (!newTransition.value.target) {
      modalError.value = 'L\'état destination est requis';
      return false;
    }
    
    const connectionExists = edges.value.some(
      edge => edge.source === newTransition.value.source && edge.target === newTransition.value.target
    );
    
    if (connectionExists) {
      modalError.value = 'Ce déclencheur existe déjà';
      return false;
    }
    
    return true;
  };

  // =============================================================================
  // MÉTHODES DE CONFIRMATION
  // =============================================================================

  const confirmAddTransition = () => {
    try {
      if (!validateNewTransition()) {
        return;
      }
      
      const newEdgeId = `edge-${Date.now()}`;
      
      const result = addTransition({
        id: newEdgeId,
        source: newTransition.value.source,
        target: newTransition.value.target,
        label: newTransition.value.function || '',
        conditions: newTransition.value.conditions
      });

      if (result.success) {
        showAddTransitionModal.value = false;
        newTransition.value = { source: '', target: '', function: '', conditions: [] };
        modalError.value = '';
        if (isSaved) isSaved.value = false;
        toast.success('Déclencheur ajouté avec succès');
      } else {
        modalError.value = result.message;
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du déclencheur:', error);
      modalError.value = 'Une erreur s\'est produite';
    }
  };

  const confirmEditTransition = () => {
    try {
      if (!editingTransition.value.source || !editingTransition.value.target) {
        editTransitionError.value = 'Les états source et destination sont requis';
        return { success: false };
      }
      
      const duplicateExists = edges.value.some(
        edge => edge.source === editingTransition.value.source && 
               edge.target === editingTransition.value.target && 
               edge.id !== editingTransition.value.id
      );
      
      if (duplicateExists) {
        editTransitionError.value = 'Cette transition existe déjà';
        return { success: false };
      }
      
      // ✅ NOUVEAU : Régénérer le nom de la transition
      const newLabel = generateTransitionName(editingTransition.value.source, editingTransition.value.target);
      
      const result = editTransition({
        id: editingTransition.value.id,
        source: editingTransition.value.source,
        target: editingTransition.value.target,
        label: newLabel, // ✅ Utiliser le nom régénéré
        conditions: editingTransition.value.conditions
      });
      
      if (result.success) {
        showEditTransitionModal.value = false;
        if (isSaved) isSaved.value = false;
        toast.success('Déclencheur modifié avec succès');
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
  const confirmRemoveTransition = () => {
    try {
      if (!removeTransitionId.value) {
        return { success: false, message: 'ID de transition manquant' };
      }
      
      const result = removeTransition(removeTransitionId.value);
      
      if (result.success) {
        showRemoveTransitionModal.value = false;
        removeTransitionId.value = null;
        if (isSaved) isSaved.value = false;
        toast.success('Déclencheur supprimé avec succès');
        return { success: true, message: 'Transition supprimée avec succès' };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la transition:', error);
      return { success: false, message: 'Erreur lors de la suppression' };
    }
  };

  const confirmInvertTransition = () => {
    console.log('🔄 Inversion de la transition en cours...');
    
    try {
      // Vérifier si une transition dans le sens inverse existe déjà
      const connectionExists = edges.value.some(
        edge => edge.source === invertingTransition.value.target && 
               edge.target === invertingTransition.value.source
      );
      
      if (connectionExists) {
        toast.error('Une transition dans ce sens existe déjà');
        return { success: false, message: 'Une transition dans ce sens existe déjà' };
      }
      
      // Sauvegarder l'historique
      saveToHistory();
      
      // ✅ RÉCUPÉRER toutes les données de l'ancienne transition AVANT de la supprimer
      const oldEdge = edges.value.find(edge => edge.id === invertingTransition.value.id);
      
      if (!oldEdge) {
        toast.error('Transition introuvable');
        return { success: false, message: 'Transition introuvable' };
      }
      
      console.log('🗑️ Suppression de l\'ancienne transition:', oldEdge.id);
      
      // SUPPRIMER l'ancienne transition
      edges.value = edges.value.filter(edge => edge.id !== invertingTransition.value.id);
      
      console.log('✨ Création de la transition inversée');
      
      // ✅ Générer le nouveau nom pour la transition inversée
      const newLabel = generateTransitionName(invertingTransition.value.target, invertingTransition.value.source);
      
      // Créer la nouvelle transition inversée avec TOUTES les données préservées
      const reversedEdge = {
        id: `edge-reversed-${Date.now()}`,
        source: invertingTransition.value.target, // ✅ Source et target inversés
        target: invertingTransition.value.source,
        label: newLabel, // ✅ Nouveau nom généré
        markerEnd: MarkerType.ArrowClosed,
        style: getBaseEdgeStyle(),
        conditions: oldEdge.conditions || [], // ✅ Préserver les conditions
        automataDependencies: oldEdge.automataDependencies || [] // ✅ Préserver les dépendances
      };
      
      // Ajouter la nouvelle transition
      edges.value.push(reversedEdge);
      
      // Fermer le modal et nettoyer
      showInvertTransitionModal.value = false;
      if (isSaved) isSaved.value = false;
      validateAutomate();
      
      console.log('✅ Transition inversée avec succès. Nouveau nom:', newLabel);
      toast.success(`Transition inversée : ${newLabel}`);
      return { success: true, message: 'Transition inversée avec succès' };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'inversion:', error);
      toast.error('Erreur lors de l\'inversion de la transition');
      return { success: false, message: 'Erreur lors de l\'inversion' };
    }
  };
  const confirmAddConditions = () => {
    try {
      const edgeIndex = edges.value.findIndex(edge => edge.id === editingConditionsForTransition.value.id);
      if (edgeIndex !== -1) {
        const updatedEdges = [...edges.value];
        updatedEdges[edgeIndex] = {
          ...updatedEdges[edgeIndex],
          conditions: selectedConditions.value
        };
        
        edges.value = updatedEdges;
        saveToHistory();
        if (isSaved) isSaved.value = false;
        
        showAddConditionModal.value = false;
        conditionModalError.value = '';
        
        toast.success('Conditions mises à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout des conditions:', error);
      conditionModalError.value = 'Une erreur s\'est produite';
    }
  };

  const confirmRemoveCondition = () => {
    try {
      const { transitionId, conditionId } = removingCondition.value;
      const edge = edges.value.find(e => e.id === transitionId);
      
      if (edge && edge.conditions) {
        const updatedConditions = edge.conditions.filter(id => id !== conditionId);
        
        const edgeIndex = edges.value.findIndex(e => e.id === transitionId);
        if (edgeIndex !== -1) {
          const updatedEdges = [...edges.value];
          updatedEdges[edgeIndex] = {
            ...updatedEdges[edgeIndex],
            conditions: updatedConditions
          };
          
          edges.value = updatedEdges;
          saveToHistory();
          if (isSaved) isSaved.value = false;
          
          showConditionRemoveModal.value = false;
          toast.success('Condition supprimée avec succès');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la condition:', error);
      toast.error('Erreur lors de la suppression de la condition');
    }
  };

  const confirmAddAutomataDependency = () => {
    try {
      if (selectedAutomates.value.length === 0) {
        dependencyModalError.value = 'Veuillez sélectionner au moins une clause';
        return;
      }
      
      // Vérifier chaque nouvelle dépendance
      for (const dependencyId of selectedAutomates.value) {
        if (wouldCreateCycle(activeAutomateId.value, dependencyId)) {
          const automate = contractAutomates.value.find(a => a.id === dependencyId);
          const automateName = automate ? automate.name : dependencyId;
          toast.error(`Impossible d'ajouter la dépendance vers "${automateName}": créerait un cycle`);
          return;
        }
      }
      
      const edgeIndex = edges.value.findIndex(edge => edge.id === currentEdgeForDependency.value.id);
      if (edgeIndex !== -1) {
        const updatedEdges = [...edges.value];
        updatedEdges[edgeIndex] = {
          ...updatedEdges[edgeIndex],
          automataDependencies: selectedAutomates.value
        };
        
        edges.value = updatedEdges;
        saveToHistory();
        if (isSaved) isSaved.value = false;
        validateAutomate();
        
        showAutomataDependencyModal.value = false;
        toast.success('Dépendances mises à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout des dépendances:', error);
      dependencyModalError.value = 'Une erreur s\'est produite';
    }
  };

  // =============================================================================
  // RETOUR DU COMPOSABLE
  // =============================================================================

  return {
    // ✅ NOUVEAU: États et fonctions du modal de connexion
    showConnectionModal,
    connectionModalData,
    connectionSelectedConditions,
    connectionExpandedPackages,
    connectionModalError,
    openConnectionModal,
    confirmConnection,
    generateConnectionTransitionName,
    toggleConnectionPackage,
    removeConnectionCondition,
    getConnectionConditionLabel,
    initializeConnectionPackages,

    // États des modals
    showAddTransitionModal,
    showEditTransitionModal,
    showRemoveTransitionModal,
    showInvertTransitionModal,
    showEdgeUpdateModal,
    showConditionInfoModal,
    showAddConditionModal,
    showConditionRemoveModal,
    showAutomataDependencyModal,
    
    // Variables d'état
    newTransition,
    editingTransition,
    invertingTransition,
    removeTransitionId,
    edgeUpdateData,
    edgeUpdateSourceName,
    edgeUpdateTargetName,
    selectedCondition,
    selectedConditions,
    editingConditionsForTransition,
    removingCondition,
    selectedAutomates,
    currentEdgeForDependency,
    expandedPackages,
    newTransitionExpandedPackages,
    editingTransitionExpandedPackages,
    
    // Messages d'erreur
    modalError,
    editTransitionError,
    conditionModalError,
    dependencyModalError,
    
    // Menu contextuel
    edgeContextMenu,
    
    // Méthodes utilitaires
    initializePackages,
    findCondition,
    getConditionLabel,
    getConditionPackageName,
    getAutomataName,
    getSelectedAutomateName,
    availableAutomates,
    updateEdgeStyles,
    normalizeStateName,
    generateTransitionName,
    
    // Méthodes pour les packages
    togglePackage,
    toggleNewTransitionPackage,
    toggleEditingTransitionPackage,
    toggleSelectedAutomate,
    
    // Méthodes pour ouvrir les modals
    openAddTransitionModal,
    openEditTransitionModal,
    openRemoveTransitionModal,
    openInvertTransitionModal,
    openConditionInfoModal,
    openAddConditionModal,
    openRemoveConditionModal,
    openAddAutomataDependencyModal,
    
    // Méthodes pour gérer les conditions et dépendances
    removeConditionFromNewTransition,
    removeConditionFromEditingTransition,
    removeAutomataDependency,
    
    // Manipulation des transitions
    addTransition,
    editTransition,
    removeTransition,
    selectTransition,
    
    // Interactions VueFlow
    handleConnectNodes,
    onEdgeClick,
    handleEdgeUpdate,
    confirmEdgeUpdate,
    
    // Menu contextuel
    onEdgeContextMenu,
    getEdgeLabelById,
    selectTransitionFromContext,
    editTransitionFromContext,
    deleteTransitionFromContext,
    invertTransitionFromContext,
    
    // Validation
    validateNewTransition,
    
    // Méthodes de confirmation
    confirmAddTransition,
    confirmEditTransition,
    confirmRemoveTransition,
    confirmInvertTransition,
    confirmAddConditions,
    confirmRemoveCondition,
    confirmAddAutomataDependency,
  };
}