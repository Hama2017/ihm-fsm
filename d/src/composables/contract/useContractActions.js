// composables/contract/useContractActions.js

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import toast from '@/composables/Toast/useToast';
import { generateDeploymentFlowAutomate } from '@/composables/contract/useDeploymentFlowGenerator';
import ContractAutomatonService from '@/services/contractAutomaton';

/**
 * Composable pour gérer les actions liées au contrat automate (sauvegarde, déploiement)
 */
export default function useContractActions({
  contractName,
  contractStatus,
  contractAutomates,
  activeAutomateId,
  isSaved,
  hasValidationErrors,
  saveCurrentAutomateState,
  validateAutomate
}) {
  const router = useRouter();
  const isSaving = ref(false);
  const currentContractId = ref(null);
  const currentCreatedAt = ref(null);

  const saveContract = async () => {
    isSaving.value = true;
  
    try {
      if (!contractName.value.trim()) {
        toast.error('Veuillez saisir un nom de contrat');
        isSaving.value = false;
        return;
      }
  
      if (contractAutomates.value.length === 0) {
        toast.error('Veuillez créer au moins un automate');
        isSaving.value = false;
        return;
      }
  
      if (activeAutomateId.value) {
        saveCurrentAutomateState();
      }
  
      let currentId = currentContractId.value; // 👈 on stocke ici l'id si déjà existant
  
      const contract = {
        id: currentId || undefined, // laisse vide si création
        name: contractName.value.trim(),
        status: contractStatus.value,
        createdAt: currentCreatedAt.value || new Date(),
        updatedAt: new Date(),
        automates: contractAutomates.value.map(automate => ({
          id: automate.id,
          name: automate.name,
          active: automate.id === activeAutomateId.value,
          states: automate.states,
          transitions: automate.transitions
        }))
      };
  
      if (currentId) {
        // Si l'id existe déjà ➔ PUT pour mettre à jour
        await ContractAutomatonService.updateContractAutomaton(currentId, contract);
        toast.success('Contrat mis à jour avec succès!');
      } else {
        // Sinon ➔ POST pour créer
        const response = await ContractAutomatonService.createContractAutomaton(contract);
        currentContractId.value = response.data.contractId; // 👈 on récupère et stocke l'id généré !
        currentCreatedAt.value = new Date();
        toast.success('Contrat créé avec succès!');
      }
  
      isSaved.value = true;
  
    } catch (error) {
      console.error('Erreur saveContract:', error);
      toast.error('Erreur lors de la sauvegarde du contrat.');
    } finally {
      isSaving.value = false;
    }
  };
  
  const deployContract = async () => {
    if (!validateAutomate()) {
      toast.error('Impossible de déployer le contrat. Veuillez corriger les erreurs.');
      return;
    }

    if (activeAutomateId.value) {
      saveCurrentAutomateState();
    }

    // Générer l'automate de déploiement
    const deploymentFlowAutomate = generateDeploymentFlowAutomate(contractAutomates.value);
    contractAutomates.value.push(deploymentFlowAutomate);

    contractStatus.value = 'Déployé';

    await saveContract();
  };

  const parseAutomateToServiceModel = () => {
    if (!contractAutomates.value.length) {
      return null;
    }

    const automatesModels = contractAutomates.value.map(automate => {
      const states = automate.states.map(state => state.label);
      const transitions = automate.transitions.map(transition => {
        const sourceState = automate.states.find(state => state.id === transition.source);
        const targetState = automate.states.find(state => state.id === transition.target);

        const sourceLabel = sourceState ? sourceState.label : '';
        const targetLabel = targetState ? targetState.label : '';

        return {
          trigger: transition.label,
          source: sourceLabel,
          dest: targetLabel,
          conditions: transition.conditions
        };
      });

      return {
        id: automate.id,
        name: automate.name,
        active: automate.id === activeAutomateId.value,
        states,
        transitions
      };
    });

    return {
      name: contractName.value || "DevelopmentService",
      automates: automatesModels
    };
  };

  function downloadJSON(obj, nomFichier = 'data.json') {
    const data = JSON.stringify(obj, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const lien = document.createElement('a');
    lien.href = url;
    lien.download = nomFichier;

    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
    URL.revokeObjectURL(url);
  }

  return {
    isSaving,
    saveContract,
    deployContract,
    parseAutomateToServiceModel,
    currentContractId,
    currentCreatedAt
  };
}
