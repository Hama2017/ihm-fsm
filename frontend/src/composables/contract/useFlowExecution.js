import { ref, computed } from 'vue';
import { useSmartContractStore } from '@/stores/smartContractStore';

export function useFlowExecution(contractId) {
  const smartContractStore = useSmartContractStore();
  
  const flowExecutionData = ref(null);
  
  /**
   * Vérifie si un automate est terminé via la blockchain
   */
  const checkAutomateCompletion = async (contractName, automataKey) => {
    try {
      const result = await smartContractStore.executeContractFunction(
        contractName,
        automataKey,
        'is_completed',
        []
      );
      
      return result.success && result.data.result === true;
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return false;
    }
  };
  
  /**
   * Met à jour les statuts de tous les automates du flow
   */
  const updateFlowExecutionStatuses = async (contractName, flowData) => {
    if (!flowData || !flowData.states) return flowData;
    
    const updatedStates = [];
    
    for (const state of flowData.states) {
      const { automateId, automataKey } = state;
      
      // Vérifier si terminé
      const isCompleted = await checkAutomateCompletion(contractName, automataKey);
      
      let executionStatus = 'pending';
      
      if (isCompleted) {
        executionStatus = 'completed';
        // Ajouter à la liste des terminés si pas déjà dedans
        if (!flowData.executionMetadata.completedAutomates.includes(automateId)) {
          flowData.executionMetadata.completedAutomates.push(automateId);
        }
      } else if (isAutomateActive(automateId, flowData)) {
        executionStatus = 'active';
      }
      
      updatedStates.push({
        ...state,
        executionStatus
      });
    }
    
    const updatedFlow = {
      ...flowData,
      states: updatedStates,
      executionMetadata: {
        ...flowData.executionMetadata,
        globalStatus: calculateGlobalStatus(updatedStates)
      }
    };
    
    flowExecutionData.value = updatedFlow;
    return updatedFlow;
  };
  
  /**
   * Vérifie si un automate peut être exécuté (dépendances satisfaites)
   */
  const isAutomateActive = (automateId, flowData) => {
    // Trouver les dépendances de cet automate
    const dependencies = flowData.transitions
      .filter(t => t.target === `deployment-state-${automateId}`)
      .map(t => extractAutomateIdFromStateId(t.source));
    
    // Toutes les dépendances doivent être terminées
    return dependencies.every(depId => 
      flowData.executionMetadata.completedAutomates.includes(depId)
    );
  };
  
  /**
   * Calcule le statut global du contrat
   */
  const calculateGlobalStatus = (states) => {
    const totalStates = states.length;
    const completedCount = states.filter(s => s.executionStatus === 'completed').length;
    
    if (completedCount === 0) return 'pending';
    if (completedCount === totalStates) return 'completed';
    return 'in_progress';
  };
  
  /**
   * Extrait l'ID d'automate depuis l'ID d'état
   */
  const extractAutomateIdFromStateId = (stateId) => {
    return stateId.replace('deployment-state-', '');
  };
  
  /**
   * Sauvegarde l'état d'exécution
   */
  const saveFlowExecutionState = (flowData) => {
    if (!contractId) return;
    
    const storageKey = `flow_execution_${contractId}`;
    localStorage.setItem(storageKey, JSON.stringify({
      completedAutomates: flowData.executionMetadata.completedAutomates,
      globalStatus: flowData.executionMetadata.globalStatus,
      lastUpdated: new Date().toISOString()
    }));
  };
  
  /**
   * Charge l'état d'exécution sauvegardé
   */
  const loadFlowExecutionState = () => {
    if (!contractId) return null;
    
    const storageKey = `flow_execution_${contractId}`;
    const saved = localStorage.getItem(storageKey);
    
    return saved ? JSON.parse(saved) : null;
  };
  
  return {
    flowExecutionData,
    checkAutomateCompletion,
    updateFlowExecutionStatuses,
    isAutomateActive,
    saveFlowExecutionState,
    loadFlowExecutionState
  };
}