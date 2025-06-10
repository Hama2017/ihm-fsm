import { MarkerType } from '@vue-flow/core';

/**
 * Génère un automate de déploiement basé sur les dépendances entre automates
 * @param {Array} contractAutomates - Liste des automates du contrat
 * @returns {Object} Automate de déploiement
 */
export function generateDeploymentFlowAutomate(contractAutomates) {
  const deploymentStates = [];
  const automateIdToStateId = new Map();

  // Créer les états avec les nouvelles propriétés
  contractAutomates.forEach((automate, index) => {
    if (automate.id === 'flow-deploiement') return;

    const stateId = `deployment-state-${automate.id}`;
    automateIdToStateId.set(automate.id, stateId);

    deploymentStates.push({
      id: stateId,
      label: automate.name,
      position: { 
        x: 200 + (index * 300),
        y: 200 
      },
      type: 'standard',
      
      // NOUVEAU - Données d'exécution
      automateId: automate.id, // '01', '02', etc.
      automataKey: `Automata${index}`, // 'Automata0', 'Automata1', etc.
      executionStatus: 'pending' // Par défaut
    });
  });

  // Créer les transitions (reste identique)
  const deploymentTransitions = [];
  contractAutomates.forEach(targetAutomate => {
    if (targetAutomate.id === 'flow-deploiement') return;

    targetAutomate.transitions.forEach(transition => {
      if (Array.isArray(transition.automataDependencies) && transition.automataDependencies.length > 0) {
        transition.automataDependencies.forEach(sourceAutomateId => {
          const sourceStateId = automateIdToStateId.get(sourceAutomateId);
          const targetStateId = automateIdToStateId.get(targetAutomate.id);

          if (sourceStateId && targetStateId) {
            deploymentTransitions.push({
              id: `deployment-edge-${sourceAutomateId}-to-${targetAutomate.id}`,
              source: sourceStateId,
              target: targetStateId,
              label: 'Depends On',
              markerEnd: MarkerType.ArrowClosed
            });
          }
        });
      }
    });
  });

  return {
    id: 'flow-deploiement',
    name: 'Flow Déploiement',
    
    // NOUVEAU - Métadonnées d'exécution
    executionMetadata: {
      completedAutomates: [],
      contractId: null, // Sera défini lors du déploiement
      globalStatus: 'pending'
    },
    
    states: deploymentStates,
    transitions: deploymentTransitions
  };
}
