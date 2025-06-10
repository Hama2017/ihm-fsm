import { ref, computed } from 'vue';

/**
 * Composable pour gérer la validation de l'automate
 * 
 * @param {Object} options Configuration du composable
 * @param {Ref<Array>} options.currentNodes Nœuds de l'automate actif
 * @param {Ref<Array>} options.currentEdges Arêtes de l'automate actif
 * @param {Ref<String>} options.activeAutomateId ID de l'automate actif (ajouté)
 * @returns {Object} Fonctions et états pour la gestion de la validation
 */
export default function useValidation({
  currentNodes,
  currentEdges,
  activeAutomateId // ✅ Ajouter ce paramètre
}) {
  // États pour la validation
  const validationErrors = ref([]);
  const cyclePath = ref([]);
  const hasValidationErrors = ref(false);
  const validationErrorMessage = ref('');
  
  // Vérifier si l'automate a des cycles
  const detectCycle = () => {
    // ✅ Ignorer la détection de cycle pour le flow de déploiement
    if (activeAutomateId?.value === 'flow-deploiement') {
      cyclePath.value = [];
      return false;
    }

    // Initialisation du graphe
    const graph = {};
    currentNodes.value.forEach(n => { graph[n.id] = []; });
    currentEdges.value.forEach(e => { graph[e.source].push(e.target); });

    const visited = new Set();
    const stack = new Set();
    const path = [];

    const dfs = (nodeId) => {
      if (stack.has(nodeId)) {
        // On a trouvé un cycle
        const startIndex = path.indexOf(nodeId);
        cyclePath.value = path.slice(startIndex).map(id =>
          currentNodes.value.find(n => n.id === id)?.data.label || id
        );
        return true;
      }
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      stack.add(nodeId);
      path.push(nodeId);

      for (const neighbor of graph[nodeId]) {
        if (dfs(neighbor)) return true;
      }

      stack.delete(nodeId);
      path.pop();
      return false;
    };

    // Exécuter DFS pour chaque nœud
    for (const node of Object.keys(graph)) {
      if (dfs(node)) return true;
    }

    // Pas de cycle détecté
    cyclePath.value = [];
    return false;
  };
  
  // Valider l'automate
  const validateAutomate = () => {
    // ✅ NE PAS valider le flow de déploiement
    if (activeAutomateId?.value === 'flow-deploiement') {
      validationErrors.value = [];
      cyclePath.value = [];
      hasValidationErrors.value = false;
      validationErrorMessage.value = '';
      return true;
    }

    const errors = [];
    
    // 1. Vérifier s'il y a un cycle
    if (detectCycle()) {
      errors.push(`Cycle détecté: ${cyclePath.value.join(' -> ')}`);
    }
    
    // 2. Vérifier si tous les états ont au moins une connexion
    const isolatedNodes = currentNodes.value.filter(node => {
      const hasIncoming = currentEdges.value.some(edge => edge.target === node.id);
      const hasOutgoing = currentEdges.value.some(edge => edge.source === node.id);
      return !hasIncoming && !hasOutgoing;
    });
    
    if (isolatedNodes.length > 0) {
      const isolatedNodeNames = isolatedNodes.map(node => node.data.label).join(', ');
      errors.push(`États isolés détectés: ${isolatedNodeNames}`);
    }
    
    // 3. Vérifier s'il y a au moins un état final (sans transitions sortantes)
    const finalStates = currentNodes.value.filter(node => 
      !currentEdges.value.some(edge => edge.source === node.id)
    );
    
    if (finalStates.length === 0 && currentNodes.value.length > 0) {
      errors.push('Aucun état final détecté (état sans transitions sortantes)');
    }
    
    // 4. Vérifier s'il y a au moins un état initial (sans transitions entrantes)
    const initialStates = currentNodes.value.filter(node => 
      !currentEdges.value.some(edge => edge.target === node.id)
    );
    
    if (initialStates.length === 0 && currentNodes.value.length > 0) {
      errors.push('Aucun état initial détecté (état sans transitions entrantes)');
    }
    
    // Mettre à jour les erreurs de validation
    validationErrors.value = errors;
    
    // Mettre à jour l'état de validation
    hasValidationErrors.value = errors.length > 0;
    validationErrorMessage.value = errors.join(' | ');
    
    return errors.length === 0;
  };
  
  // Statistiques sur l'automate
  const stats = computed(() => {
    // ✅ Retourner des stats vides pour le flow de déploiement
    if (activeAutomateId?.value === 'flow-deploiement') {
      return {
        states: 0,
        transitions: 0,
        initialStates: 0,
        finalStates: 0,
        isolatedStates: 0
      };
    }

    const incomingTransitions = new Set(currentEdges.value.map(edge => edge.target));
    const outgoingTransitions = new Set(currentEdges.value.map(edge => edge.source));
    
    return {
      states: currentNodes.value.length,
      transitions: currentEdges.value.length,
      initialStates: currentNodes.value.filter(node => !incomingTransitions.has(node.id)).length,
      finalStates: currentNodes.value.filter(node => !outgoingTransitions.has(node.id)).length,
      isolatedStates: currentNodes.value.filter(node => 
        !incomingTransitions.has(node.id) && !outgoingTransitions.has(node.id)
      ).length
    };
  });
  
  // Vérifier si l'automate a un cycle
  const hasCycle = computed(() => cyclePath.value.length > 0);
  
  return {
    // États
    validationErrors,
    cyclePath,
    hasValidationErrors,
    validationErrorMessage,
    
    // Méthodes
    detectCycle,
    validateAutomate,
    
    // Getters
    stats,
    hasCycle
  };
}