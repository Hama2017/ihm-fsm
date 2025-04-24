import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useContractStore = defineStore('contractStore', () => {
  // Liste des contrats
  const contracts = ref([]);

  // Contrat en cours d'édition
  const currentContract = ref(null);

  // Ajoute un contrat à la liste
  function addContract(contract) {
    contracts.value.push(contract);
  }

  // Récupère un contrat par son ID
  function getContractById(id) {
    return contracts.value.find(c => c.id === id);
  }

  // Supprime un contrat par son ID
  function deleteContract(id) {
    contracts.value = contracts.value.filter(c => c.id !== id);
  }

  // Définit le contrat actuellement ouvert/édité
  function setCurrentContract(contract) {
    currentContract.value = contract;
  }

  // Met à jour un contrat existant
  function updateContract(updatedContract) {
    const index = contracts.value.findIndex(c => c.id === updatedContract.id);
    if (index !== -1) {
      contracts.value[index] = updatedContract;
      return true;
    }
    return false;
  }

  // Réinitialise le contrat en cours
  function clearCurrentContract() {
    currentContract.value = null;
  }

  return {
    contracts,
    currentContract,
    addContract,
    getContractById,
    deleteContract,
    setCurrentContract,
    clearCurrentContract,
    updateContract
  };
});
