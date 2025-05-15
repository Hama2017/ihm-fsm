import { MarkerType } from '@vue-flow/core';

/**
 * Génère un automate de déploiement basé sur les dépendances entre automates
 * @param {Array} contractAutomates - Liste des automates du contrat
 * @returns {Object} Automate de déploiement
 */
export function generateDeploymentFlowAutomate(contractAutomates) {
  const deploymentStates = [];
  const automateIdToStateId = new Map();

  // Créer les états
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
      type: 'standard'
    });
  });

  // Créer les transitions basées sur les dépendances
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
              label: 'est terminé',
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
    states: deploymentStates,
    transitions: deploymentTransitions
  };
}
