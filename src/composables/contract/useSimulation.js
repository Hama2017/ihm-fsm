import { ref } from 'vue';

/**
 * Composable pour gérer la simulation de l'automate
 * 
 * @param {Ref<Array>} nodes - Référence aux nœuds actuels
 * @param {Ref<Array>} edges - Référence aux arêtes actuelles
 * @param {Function} getBaseEdgeStyle - Fonction pour obtenir le style de base d'une arête
 * @param {Function} updateNodeStyles - Fonction pour mettre à jour les styles des nœuds
 * @returns {Object} - Fonctions et états pour la simulation de l'automate
 */
export default function useSimulation(nodes, edges, getBaseEdgeStyle, updateNodeStyles) {
  const isSimulating = ref(false);
  const simulationCurrentState = ref(null);
  const simulationVisitedStates = ref([]);
  const showSimulationModal = ref(false);
  const showDeploymentSummaryModal = ref(false);
  const deploymentResult = ref([]);

  /**
   * Bascule entre le mode simulation et le mode normal
   */
  const toggleSimulation = () => {
    if (isSimulating.value) {
      // Arrêter la simulation
      isSimulating.value = false;
      simulationCurrentState.value = null;
      simulationVisitedStates.value = [];
      edges.value.forEach((edge) => {
        edge.style = getBaseEdgeStyle();
      });
      return { success: true, message: 'Mode simulation désactivé.' };
    } else {
      // Ouvrir le modal de confirmation
      showSimulationModal.value = true;
      return { success: true, action: 'open-modal' };
    }
  };

  /**
   * Réinitialise la simulation au premier état initial
   */
  const resetSimulation = () => {
    // Trouver un état initial (premier état sans transitions entrantes)
    const incomingTransitions = new Set(edges.value.map(edge => edge.target));
    const potentialInitialStates = nodes.value.filter(node => !incomingTransitions.has(node.id));
    
    if (potentialInitialStates.length > 0) {
      simulationCurrentState.value = potentialInitialStates[0].id;
    } else if (nodes.value.length > 0) {
      // Fallback: utiliser le premier état
      simulationCurrentState.value = nodes.value[0].id;
    } else {
      simulationCurrentState.value = null;
    }
    
    simulationVisitedStates.value = simulationCurrentState.value ? [simulationCurrentState.value] : [];
  };

  /**
   * Anime une transition entre deux états
   */
  const animateTransition = (sourceId, targetId) => {
    const animatedEdge = {
      id: `animated-${Date.now()}`,
      source: sourceId,
      target: targetId,
      animated: true,
      markerEnd: { type: 'arrowclosed' },
      style: {
        stroke: '#facc15', // jaune
        strokeWidth: 3,
        strokeDasharray: '10',
        animation: 'pulse-line 1s ease forwards'
      },
      class: 'animated-edge',
    };

    edges.value.push(animatedEdge);

    setTimeout(() => {
      // Supprimer l'edge animée après 1.2s
      edges.value = edges.value.filter(e => e.id !== animatedEdge.id);
    }, 1200);
  };

  /**
   * Simule une transition vers un état cible
   */
  const simulateTransition = (node) => {
    if (!isSimulating.value || !simulationCurrentState.value) 
      return { success: false, message: 'Aucune simulation en cours' };
    
    // Vérifier si la transition est valide
    const availableTransitions = edges.value.filter(edge => 
      edge.source === simulationCurrentState.value && edge.target === node.id
    );
    
    if (availableTransitions.length > 0) {
      animateTransition(simulationCurrentState.value, node.id);

      simulationCurrentState.value = node.id;
      if (!simulationVisitedStates.value.includes(node.id)) {
        simulationVisitedStates.value.push(node.id);
      }
      return { success: true, message: `Transition vers "${node.data.label}" effectuée` };
    } else if (node.id === simulationCurrentState.value) {
      // L'utilisateur a cliqué sur l'état actuel
      return { success: true, message: `État actuel: "${node.data.label}"` };
    } else {
      // Transition non valide
      return { success: false, message: `Transition vers "${node.data.label}" impossible` };
    }
  };

  /**
   * Simule le déploiement automatique par ordre topologique
   */
  const simulateDeployment = async () => {
    try {
      showSimulationModal.value = false;
      if (!nodes.value.length || !edges.value.length) 
        return { success: false, message: 'Aucun nœud ou arête dans l\'automate' };

      isSimulating.value = true;
      simulationVisitedStates.value = [];
      simulationCurrentState.value = null;

      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      // Construire le graphe des dépendances (entrantes)
      const graph = {};
      const indegree = {};
      nodes.value.forEach((node) => {
        graph[node.id] = [];
        indegree[node.id] = 0;
      });

      edges.value.forEach((edge) => {
        graph[edge.source].push(edge.target);
        indegree[edge.target]++;
      });

      // Trouver les nœuds sans dépendances (degré d'entrée = 0)
      const queue = Object.keys(indegree).filter((id) => indegree[id] === 0);
      const deployed = new Set();
      const deploymentOrder = [];

      while (queue.length > 0) {
        const current = queue.shift();
        simulationCurrentState.value = current;
        simulationVisitedStates.value.push(current);
        deploymentOrder.push(current);

        // Colorer le nœud comme déployé
        updateNodeStyles(current);

        // Animer les transitions sortantes
        const outgoing = edges.value.filter((e) => e.source === current);
        for (const edge of outgoing) {
          edge.style = {
            ...getBaseEdgeStyle(),
            stroke: '#10b981', // vert
            strokeWidth: 3,
          };
        }

        await delay(600); // Attendre avant de continuer

        for (const target of graph[current]) {
          indegree[target]--;
          if (indegree[target] === 0 && !deployed.has(target)) {
            queue.push(target);
          }
        }

        deployed.add(current);
      }

      simulationCurrentState.value = null;
      deploymentResult.value = deploymentOrder;
      showDeploymentSummaryModal.value = true;
      
      return { success: true, message: 'Simulation du Déploiement terminée' };
    } catch (error) {
      console.error('Erreur lors de la simulation du déploiement:', error);
      return { success: false, message: 'Erreur lors de la simulation du déploiement' };
    }
  };

  /**
   * Confirme le lancement de la simulation
   */
  const launchSimulation = () => {
    return simulateDeployment();
  };

  /**
   * Ferme le modal de résumé de déploiement
   */
  const closeDeploymentSummaryModal = () => {
    showDeploymentSummaryModal.value = false;
    deploymentResult.value = [];
    isSimulating.value = false;
    
    // Réinitialiser les styles des nœuds et arêtes
    nodes.value.forEach(node => {
      node.style = getBaseEdgeStyle();
    });
    edges.value.forEach(edge => {
      edge.style = getBaseEdgeStyle();
    });
  };

  return {
    isSimulating,
    simulationCurrentState,
    simulationVisitedStates,
    showSimulationModal,
    showDeploymentSummaryModal,
    deploymentResult,
    toggleSimulation,
    resetSimulation,
    animateTransition,
    simulateTransition,
    simulateDeployment,
    launchSimulation,
    closeDeploymentSummaryModal
  };
}