import { ref, computed } from 'vue';

/**
 * Composable pour gérer la sauvegarde et le déploiement du contrat
 *
 * @param {Ref<String>} contractName - Nom du contrat
 * @param {Ref<String>} contractStatus - Statut du contrat
 * @param {Ref<Array>} contractAutomates - Liste des automates du contrat
 * @param {Ref<String|null>} activeAutomateId - ID de l'automate actif
 * @param {Object} validation - Objet de validation issu de useValidation
 * @param {Object} history - Objet historique issu de useHistory
 * @param {Function} saveCurrentAutomateState - Fonction pour sauvegarder l'état de l'automate actif
 * @return {Object} - Méthodes et états pour la sauvegarde et le déploiement
 */
export function useContractDeployment(
  contractName,
  contractStatus,
  contractAutomates,
  activeAutomateId,
  validation,
  history,
  saveCurrentAutomateState
) {
  // États
  const isSaving = ref(false);
  const isDeploying = ref(false);
  const deploymentError = ref(null);
  const lastSavedDate = ref(null);
  
  // Propriétés calculées
  const canDeploy = computed(() => {
    return contractStatus.value !== 'deployed' && 
           !hasValidationErrors.value &&
           contractAutomates.value.length > 0;
  });
  
  const hasValidationErrors = computed(() => {
    return validation.errors.value.length > 0;
  });
  
  const canSave = computed(() => {
    return contractName.value.trim() !== '' && 
           contractAutomates.value.length > 0 &&
           !isSaving.value;
  });
  
  const deploymentStatus = computed(() => {
    switch(contractStatus.value) {
      case 'draft':
        return { label: 'Brouillon', color: 'gray' };
      case 'pending':
        return { label: 'En attente de déploiement', color: 'orange' };
      case 'deployed':
        return { label: 'Déployé', color: 'green' };
      case 'error':
        return { label: 'Erreur de déploiement', color: 'red' };
      default:
        return { label: 'Inconnu', color: 'gray' };
    }
  });
  
  /**
   * Sauvegarde le contrat actuel
   * @return {Promise<boolean>} - Succès de la sauvegarde
   */
  const saveContract = async () => {
    if (!canSave.value) return false;
    
    try {
      isSaving.value = true;
      
      // Sauvegarde de l'état de l'automate actif
      if (activeAutomateId.value) {
        await saveCurrentAutomateState();
      }
      
      // Préparation des données du contrat
      const contractData = {
        name: contractName.value,
        status: contractStatus.value,
        automates: contractAutomates.value,
        updatedAt: new Date().toISOString()
      };
      
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mise à jour de l'historique
      history.addEntry({
        type: 'save',
        date: new Date(),
        details: `Contrat "${contractName.value}" sauvegardé`
      });
      
      lastSavedDate.value = new Date();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du contrat:', error);
      return false;
    } finally {
      isSaving.value = false;
    }
  };
  
  /**
   * Déploie le contrat actuel
   * @return {Promise<boolean>} - Succès du déploiement
   */
  const deployContract = async () => {
    if (!canDeploy.value) return false;
    
    try {
      isDeploying.value = true;
      deploymentError.value = null;
      
      // Sauvegarde avant déploiement
      const saveResult = await saveContract();
      if (!saveResult) {
        throw new Error('Échec de la sauvegarde avant déploiement');
      }
      
      // Préparation des données de déploiement
      const deploymentData = {
        contractId: crypto.randomUUID(),
        name: contractName.value,
        automates: contractAutomates.value.map(automate => ({
          id: automate.id,
          version: automate.version,
          rules: automate.rules
        })),
        deploymentDate: new Date().toISOString()
      };
      
      // Simulation d'un appel API de déploiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mise à jour du statut
      contractStatus.value = 'deployed';
      
      // Mise à jour de l'historique
      history.addEntry({
        type: 'deploy',
        date: new Date(),
        details: `Contrat "${contractName.value}" déployé avec succès`
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors du déploiement du contrat:', error);
      deploymentError.value = error.message || 'Erreur de déploiement inconnue';
      contractStatus.value = 'error';
      
      // Enregistrement de l'erreur dans l'historique
      history.addEntry({
        type: 'error',
        date: new Date(),
        details: `Échec du déploiement: ${deploymentError.value}`
      });
      
      return false;
    } finally {
      isDeploying.value = false;
    }
  };
  
  /**
   * Annule le déploiement en cours
   */
  const cancelDeployment = () => {
    if (contractStatus.value === 'pending') {
      contractStatus.value = 'draft';
      
      history.addEntry({
        type: 'cancel',
        date: new Date(),
        details: `Déploiement annulé pour "${contractName.value}"`
      });
    }
  };
  
  /**
   * Valide le contrat avant déploiement
   * @return {Array<String>} - Liste des erreurs, vide si valide
   */
  const validateContract = () => {
    const errors = [];
    
    // Validation du nom du contrat
    if (!contractName.value || contractName.value.trim() === '') {
      errors.push('Le nom du contrat est requis');
    }
    
    // Validation des automates
    if (contractAutomates.value.length === 0) {
      errors.push('Au moins un automate est requis');
    } else {
      // Vérification de chaque automate
      for (const automate of contractAutomates.value) {
        if (!automate.rules || automate.rules.length === 0) {
          errors.push(`L'automate "${automate.name}" ne contient aucune règle`);
        }
      }
    }
    
    // Ajout des erreurs de validation existantes
    if (validation.errors.value.length > 0) {
      errors.push(...validation.errors.value);
    }
    
    return errors;
  };
  
  return {
    // États
    isSaving,
    isDeploying,
    deploymentError,
    lastSavedDate,
    
    // Propriétés calculées
    canDeploy,
    canSave,
    hasValidationErrors,
    deploymentStatus,
    
    // Méthodes
    saveContract,
    deployContract,
    cancelDeployment,
    validateContract
  };
}