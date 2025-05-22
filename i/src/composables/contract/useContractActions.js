import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import toast from '@/composables/Toast/useToast';
import { useI18n } from '@/composables/i18n/useI18n';
import { useConfirmation } from '@/composables/useConfirmation';
import { generateDeploymentFlowAutomate } from '@/composables/contract/useDeploymentFlowGenerator';
import { useAutomatonContractStore } from '@/stores/automatonContractStore';
import { useSmartContractStore } from '@/stores/smartContractStore';
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
  validateAutomate,
  loadAutomateState // ✅ Ajouter ce paramètre
}) {
  const router = useRouter();
  const route = useRoute();
  const isSaving = ref(false);
  const currentContractId = ref(null);
  const currentCreatedAt = ref(null);
  const { t } = useI18n();
  const { confirm } = useConfirmation();

  // Stores
  const automatonContractStore = useAutomatonContractStore();
  const smartContractStore = useSmartContractStore();

  /**
   * Sauvegarde le contrat actuel et gère la redirection si le nom change
   * @returns {Promise<boolean>} true si la sauvegarde a réussi, false sinon
   */
  const saveContract = async (cleanupFlow = false) => {
    // Empêche les doubles soumissions
    if (isSaving.value) return false;
    
    console.log("Début sauvegarde...");
  
    try {
      // ✅ NOUVEAU: Nettoyer le flow de déploiement si demandé
      if (cleanupFlow) {
        cleanupDeploymentFlow();
      }
  
      // Validation
      if (!contractName.value.trim()) {
        toast.error('Veuillez saisir un nom de contrat');
        return false;
      }
  
      if (contractAutomates.value.length === 0) {
        toast.error('Veuillez créer au moins un automate');
        return false;
      }
  
      // Sauvegarde l'état de l'automate actif
      if (activeAutomateId.value && typeof saveCurrentAutomateState === 'function') {
        saveCurrentAutomateState();
      }
  
      // ✅ AMÉLIORATION: Filtrer les automates de déploiement lors de la sauvegarde
      const automatesForSave = contractAutomates.value.filter(automate => 
        automate.id !== 'flow-deploiement'
      );
  
      // Préparation des données du contrat
      const contract = {
        name: contractName.value.trim(),
        status: contractStatus.value,
        description: '', 
        automates: automatesForSave.map(automate => ({
          id: automate.id,
          name: automate.name,
          active: automate.id === activeAutomateId.value,
          states: automate.states,
          transitions: automate.transitions
        }))
      };
  
      let result;
      let shouldRedirect = false;
      
      // Si nous sommes en mode édition (nous avons un ID)
      if (route.params.id) {
        console.log("Mode édition: mise à jour du contrat:", route.params.id);
        
        result = await automatonContractStore.updateContract(route.params.id, contract);
        
        if (result.success) {
          // Si le nom a changé, rediriger vers la nouvelle URL
          if (contract.name !== route.params.id) {
            console.log("Nom changé, redirection vers:", contract.name);
            shouldRedirect = true;
          }
          
          toast.success('Contrat mis à jour avec succès');
        } else {
          throw new Error(result.error || 'Erreur lors de la mise à jour');
        }
      } else {
        // Mode création
        console.log("Mode création:", contract.name);
        
        result = await automatonContractStore.createContract(contract);
        
        if (result.success) {
          shouldRedirect = true;
          toast.success('Contrat créé avec succès');
        } else {
          // Si c'est une erreur de conflit, essayer de mettre à jour
          if (result.errorCode && result.errorCode.includes('already_exists')) {
            console.log("Conflit détecté, mise à jour du contrat existant:", contract.name);
            
            result = await automatonContractStore.updateContract(contract.name, contract);
            
            if (result.success) {
              shouldRedirect = true;
              toast.success('Contrat existant mis à jour avec succès');
            } else {
              throw new Error(result.error || 'Erreur lors de la mise à jour après conflit');
            }
          } else {
            throw new Error(result.error || 'Erreur lors de la création');
          }
        }
      }
  
      isSaved.value = true;
      
      // Redirection si nécessaire
      if (shouldRedirect) {
        console.log(`Redirection: /contracts/edit/${result.data.id}`);
        
        setTimeout(() => {
          router.replace({
            name: 'edit-contract',
            params: { id: result.data.id }
          });
        }, 100);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur saveContract:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message}`);
      return false;
    }
  };
  
  /**
   * Déploie le contrat actuel
   * @returns {Promise<boolean>} true si le déploiement a été initialisé avec succès
   */
  const deployContract = async () => {
    if (typeof validateAutomate === 'function' && !validateAutomate()) {
      toast.error(t('errors.cannotDeployWithErrors'));
      return false;
    }

    if (activeAutomateId.value && typeof saveCurrentAutomateState === 'function') {
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
 * Déploie réellement le contrat sur la blockchain
 * @returns {Promise<Object>} Résultat du déploiement
 */
const deployContractToBlockchain = async () => {
  try {
    if (typeof validateAutomate === 'function' && 
        activeAutomateId.value !== 'flow-deploiement' && 
        !validateAutomate()) {
      throw new Error('Le contrat contient des erreurs de validation');
    }

    // Obtenir l'ID du contrat
    const contractId = route.params.id || contractName.value || "DevelopmentService";

    // ✅ NOUVEAU: Filtrer les automates réels ET garder leurs informations
    const realAutomates = contractAutomates.value.filter(automate => 
      automate.id !== 'flow-deploiement'
    );

    // ✅ NOUVEAU: Préparer les informations d'enrichissement
    const automateInfo = realAutomates.map(automate => ({
      id: automate.id,
      name: automate.name,
      statesCount: automate.states?.length || 0,
      transitionsCount: automate.transitions?.length || 0
    }));

    // Transformer le contrat au format requis pour le déploiement
    const specificationModel = automatonContractStore.transformContractForDeployment({
      name: contractName.value || "DevelopmentService",
      id: contractId,
      automates: realAutomates,
      // ✅ NOUVEAU: Ajouter les métadonnées
      metadata: {
        contractName: contractName.value,
        totalAutomates: realAutomates.length,
        createdAt: new Date().toISOString(),
        automateInfo: automateInfo
      }
    });
    
    if (!specificationModel) {
      throw new Error('Impossible de transformer le contrat pour le déploiement');
    }

    console.log('📤 Envoi au backend:', specificationModel);

    // Utiliser le store pour déployer
    const result = await smartContractStore.deployContract(specificationModel);
    
    console.log('📥 Réponse du backend:', result);
    
    // ✅ AMÉLIORATION: Enrichir la réponse avec nos métadonnées
    if (result && (result.success === true || result.success !== false)) {
      const deploymentData = result.data || result;
      
      // ✅ NOUVEAU: Enrichir avec les informations du contrat
      const enrichedData = {
        ...deploymentData,
        contractName: contractName.value,
        contractId: contractId,
        deployedAt: new Date().toISOString(),
        automateNames: automateInfo,
        totalAutomates: realAutomates.length,
        originalContractData: {
          name: contractName.value,
          status: contractStatus.value,
          automates: realAutomates.map(a => ({
            id: a.id,
            name: a.name
          }))
        }
      };
      
      // Mettre à jour le statut du contrat
      contractStatus.value = 'deployed';
      
      return {
        success: true,
        data: enrichedData
      };
    } else {
      return {
        success: false,
        error: result?.error || result?.message || 'Erreur lors du déploiement'
      };
    }
  } catch (error) {
    console.error('Erreur lors du déploiement:', error);
    return {
      success: false,
      error: error.message || error.toString()
    };
  }
};

const cleanupDeploymentFlow = () => {
  const deploymentFlowIndex = contractAutomates.value.findIndex(a => a.id === 'flow-deploiement');
  if (deploymentFlowIndex !== -1) {
    contractAutomates.value.splice(deploymentFlowIndex, 1);
    console.log('✅ Flow de déploiement supprimé');
    return true;
  }
  return false;
};
  
  /**
   * Convertit l'automate au format de service
   * @returns {Object|null} Le modèle de service
   */
  const parseAutomateToServiceModel = () => {
    if (!contractAutomates.value.length) {
      return null;
    }

    // Utiliser la transformation du service automatonContract
    const contract = {
      name: contractName.value || "DevelopmentService",
      automates: contractAutomates.value
    };

    return automatonContractStore.transformContractForDeployment(contract);
  };

  /**
   * Charge un contrat depuis l'API
   * @param {string} contractId - ID du contrat à charger
   * @returns {Promise<boolean>} true si le chargement a réussi, false sinon
   */
  const loadContract = async (contractId) => {
    try {
      console.log("Chargement du contrat:", contractId);
      
      const result = await automatonContractStore.fetchContractById(contractId);
      
      if (result.success) {
        const contract = result.data;
        
        // Mise à jour des variables d'état
        contractName.value = contract.name;
        contractStatus.value = contract.status || 'draft'; // Valeur par défaut si ContractStatus n'est pas importé
        contractAutomates.value = contract.automates.map(automate => ({ ...automate }));
  
        // Trouver et charger l'automate actif
        if (contractAutomates.value.length > 0) {
          const activeAutomate = contractAutomates.value.find(a => a.active) || contractAutomates.value[0];
          activeAutomateId.value = activeAutomate.id;
          
          // ✅ Vérifier que loadAutomateState existe avant de l'appeler
          if (typeof loadAutomateState === 'function') {
            loadAutomateState(activeAutomate.id);
          } else {
            console.warn('loadAutomateState n\'est pas disponible dans useContractActions');
          }
        }
  
        // Indiquer que le contrat a été sauvegardé
        isSaved.value = true;
        
        return true;
      } else {
        throw new Error(result.error || 'Contrat non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du contrat:', error);
      
      // Message d'erreur plus informatif
      if (error.message.includes('404') || error.message.includes('not found')) {
        toast.error(`Le contrat "${contractId}" n'existe pas`);
      } else {
        toast.error(`Erreur lors du chargement: ${error.message}`);
      }
      
      // Redirection vers la liste des contrats après un délai
      setTimeout(() => {
        router.push({ name: 'contracts' });
      }, 2000);
      
      return false;
    }
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
    deployContractToBlockchain,
    parseAutomateToServiceModel,
    downloadJSON,
    loadContract,
    currentContractId,
    currentCreatedAt,
    cleanupDeploymentFlow
  };
}