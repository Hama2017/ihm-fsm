import { ref } from 'vue';
import { useRouter } from 'vue-router';
import toast from '@/composables/Toast/useToast';
import { useI18n } from '@/composables/i18n/useI18n';
import { useConfirmation } from '@/composables/useConfirmation';
import { generateDeploymentFlowAutomate } from '@/composables/contract/useDeploymentFlowGenerator';
import ContractAutomatonService from '@/services/contractAutomaton';
import ErrorService from '@/services/errorService';

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
  const { t } = useI18n();
  const { confirm } = useConfirmation();

/**
 * Sauvegarde le contrat actuel et gère la redirection si le nom change
 * @returns {Promise<boolean>} true si la sauvegarde a réussi, false sinon
 */
const saveContract = async () => {
  // Empêche les doubles soumissions
  if (isSaving.value) return false;
  
  isSaving.value = true;
  console.log("Début sauvegarde...");

  try {
    // Validation
    if (!contractName.value.trim()) {
      toast.error('Veuillez saisir un nom de contrat');
      isSaving.value = false;
      return false;
    }

    if (contractAutomates.value.length === 0) {
      toast.error('Veuillez créer au moins un automate');
      isSaving.value = false;
      return false;
    }

    // Sauvegarde l'état de l'automate actif
    if (activeAutomateId.value) {
      saveCurrentAutomateState();
    }

    // Capturer l'ancien nom avant la mise à jour (pour la redirection)
    const oldContractId = currentContractId.value;
    const oldContractName = contractName.value;

    // Préparation des données du contrat
    const contract = {
      name: contractName.value.trim(),
      status: contractStatus.value,
      updatedAt: new Date(),
      automates: contractAutomates.value.map(automate => ({
        id: automate.id,
        name: automate.name,
        active: automate.id === activeAutomateId.value,
        states: automate.states,
        transitions: automate.transitions
      }))
    };

    let response;
    let shouldRedirect = false;
    
    // Si nous sommes en mode édition (nous avons un ID)
    if (currentContractId.value) {
      console.log("Mode édition: mise à jour du contrat:", currentContractId.value);
      console.log("Nouveau nom du contrat:", contract.name);
      
      if (currentCreatedAt.value) {
        contract.createdAt = currentCreatedAt.value;
      }
      
      try {
        response = await ContractAutomatonService.updateContractAutomaton(
          currentContractId.value, 
          contract
        );
        
        // Si le nom a changé, nous devons mettre à jour l'ID pour les futures sauvegardes
        // et rediriger vers la nouvelle URL
        if (contract.name !== currentContractId.value) {
          console.log("Nom changé, mise à jour de l'ID:", currentContractId.value, "->", contract.name);
          currentContractId.value = contract.name;
          shouldRedirect = true;
        }
        
        toast.success('Contrat mis à jour avec succès');
      } catch (updateError) {
        console.error("Erreur lors de la mise à jour:", updateError);
        throw updateError;
      }
    } else {
      // Mode création - uniquement si nous n'avons pas déjà un ID
      console.log("Mode création:", contract.name);
      contract.createdAt = new Date();
      
      try {
        response = await ContractAutomatonService.createContractAutomaton(contract);
        
        // Stocker l'ID pour les futures sauvegardes
        currentContractId.value = contract.name; // Utiliser le nom comme ID
        currentCreatedAt.value = contract.createdAt;
        shouldRedirect = true;
        
        toast.success('Contrat créé avec succès');
      } catch (createError) {
        // Si c'est une erreur 409 (conflit), le contrat existe déjà
        if (createError.response && createError.response.status === 409) {
          console.log("Conflit détecté, mise à jour du contrat existant:", contract.name);
          
          // Utiliser le nom du contrat comme ID pour la mise à jour
          currentContractId.value = contract.name;
          
          try {
            response = await ContractAutomatonService.updateContractAutomaton(
              contract.name, 
              contract
            );
            
            toast.success('Contrat existant mis à jour avec succès');
          } catch (updateError) {
            console.error("Erreur lors de la mise à jour après conflit:", updateError);
            throw updateError;
          }
        } else {
          // Autre erreur
          console.error("Erreur lors de la création:", createError);
          throw createError;
        }
      }
    }

    isSaved.value = true;
    
    // IMPORTANT: Redirection si le nom a changé ou si c'est une nouvelle création
    if (shouldRedirect) {
      console.log(`Redirection: /contracts/edit/${currentContractId.value}`);
      
      // Utiliser nextTick pour s'assurer que tout est mis à jour avant la redirection
      setTimeout(() => {
        router.replace({
          name: 'edit-contract',
          params: { id: currentContractId.value }
        });
      }, 100);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur saveContract:', error);
    
    // Message d'erreur plus informatif
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.detail || 'Erreur lors de la sauvegarde';
      
      toast.error(`Erreur (${status}): ${message}`);
    } else {
      toast.error('Erreur lors de la sauvegarde du contrat');
    }
    
    return false;
  } finally {
    console.log("Fin sauvegarde");
    isSaving.value = false;
  }
};
  
  /**
   * Déploie le contrat actuel
   * @returns {Promise<boolean>} true si le déploiement a été initialisé avec succès
   */
  const deployContract = async () => {
    if (!validateAutomate()) {
      toast.error(t('errors.cannotDeployWithErrors'));
      return false;
    }

    if (activeAutomateId.value) {
      saveCurrentAutomateState();
    }

    // Générer l'automate de déploiement
    const deploymentFlowAutomate = generateDeploymentFlowAutomate(contractAutomates.value);
    
    // Vérifier si un automate de déploiement existe déjà
    const existingIndex = contractAutomates.value.findIndex(a => a.id === 'flow-deploiement');
    if (existingIndex !== -1) {
      contractAutomates.value[existingIndex] = deploymentFlowAutomate;
    } else {
      contractAutomates.value.push(deploymentFlowAutomate);
    }

    // Sauvegarder le contrat avec l'automate de déploiement
    const saved = await saveContract();
    return saved;
  };

  /**
   * Convertit l'automate au format de service
   * @returns {Object|null} Le modèle de service
   */
  const parseAutomateToServiceModel = () => {
    if (!contractAutomates.value.length) {
      return null;
    }

    const automatesModels = contractAutomates.value
      .filter(automate => automate.id !== 'flow-deploiement') // Ignorer l'automate de déploiement
      .map(automate => {
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
            conditions: transition.conditions || []
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

  /**
   * Télécharge un objet sous forme de fichier JSON
   * @param {Object} obj L'objet à télécharger
   * @param {string} nomFichier Nom du fichier
   */
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
    downloadJSON,
    currentContractId,
    currentCreatedAt
  };
}