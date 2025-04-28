import { ref } from 'vue';
import { useRouter } from 'vue-router';
import toast from '@/composables/Toast/useToast';
import ContractAutomatonService from '@/services/contractAutomaton';

/**
 * Composable pour gérer les actions sur les contrats automates via l'API
 */
export default function useContractAutomatonActions({
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

  const saveContractAutomaton = async () => {
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

      // Construction du contrat
      const contract = {
        name: contractName.value.trim(),
        status: contractStatus.value,
        createdAt: new Date(),
        updatedAt: new Date(),
        automates: contractAutomates.value.map(automate => ({
          id: automate.id,
          name: automate.name,
          active: automate.id === activeAutomateId.value,
          states: automate.states,
          transitions: automate.transitions
        }))
      };

      // Appel API pour création
      const response = await ContractAutomatonService.createContractAutomaton(contract);

      toast.success('Contrat créé avec succès!');
      console.log('Contrat créé avec ID :', response.data.contractId);

      isSaved.value = true;
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du contrat.');
      console.error('Erreur saveContractAutomaton:', error);
    } finally {
      isSaving.value = false;
    }
  };

  const deployContractAutomaton = async () => {
    if (!validateAutomate()) {
      toast.error('Impossible de déployer le contrat. Veuillez corriger les erreurs.');
      return;
    }

    if (activeAutomateId.value) {
      saveCurrentAutomateState();
    }

    // Ici tu peux ajouter ton flow de déploiement personnalisé si besoin
    contractStatus.value = 'Déployé';

    await saveContractAutomaton();
  };

  return {
    isSaving,
    saveContractAutomaton,
    deployContractAutomaton
  };
}
