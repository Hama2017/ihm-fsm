import { ref } from 'vue';
import { useRouter } from 'vue-router';
import toast from '@/composables/Toast/useToast';
import { useContractStore } from '@/stores/contractStore';

/**
 * Composable pour gérer les actions liées au contrat (sauvegarde, déploiement)
 * 
 * @param {Object} options Configuration du composable
 * @param {Ref<String>} options.contractName Nom du contrat
 * @param {Ref<String>} options.contractStatus Statut du contrat
 * @param {Ref<Array>} options.contractAutomates Liste des automates du contrat
 * @param {Ref<String|null>} options.activeAutomateId ID de l'automate actif
 * @param {Ref<Boolean>} options.isSaved Indique si le contrat est sauvegardé
 * @param {Ref<Boolean>} options.hasValidationErrors Indique si l'automate a des erreurs de validation
 * @param {Function} options.saveCurrentAutomateState Fonction pour sauvegarder l'état de l'automate actif
 * @param {Function} options.validateAutomate Fonction pour valider l'automate
 * @returns {Object} Fonctions et états pour la gestion des actions du contrat
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
  
  // Importer le store Pinia
  const contractStore = useContractStore();

  // État réactif
  const isSaving = ref(false);
  
  // Générer un ID de contrat
  const generateContractId = () => {
    // Ici on pourrait récupérer le dernier ID utilisé depuis une API
    // Pour cet exemple, on génère simplement un ID formaté avec des zéros
    return '00' + Math.floor(Math.random() * 100).toString().padStart(2, '0');
  };
  
  // Fonction pour sauvegarder le contrat complet
  const saveContract = () => {
    isSaving.value = true;
  
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
    
    // Vérifier si on est en train de modifier un contrat existant
    const currentContract = contractStore.currentContract;
    const isUpdate = currentContract && currentContract.id;
    const contractId = isUpdate ? currentContract.id : generateContractId();
  
    const contract = {
      id: contractId,
      name: contractName.value.trim(),
      status: contractStatus.value,
      createdAt: isUpdate ? currentContract.createdAt : new Date(),
      updatedAt: new Date(), // Ajouter une date de mise à jour
      automates: contractAutomates.value.map(automate => ({
        id: automate.id,
        name: automate.name,
        active: automate.id === activeAutomateId.value,
        states: automate.states,
        transitions: automate.transitions
      }))
    };
  
    // Sauvegarde dans Pinia
    contractStore.setCurrentContract(contract);
  
    // Mettre à jour ou ajouter le contrat selon le cas
    if (isUpdate) {
      // Utiliser la nouvelle méthode updateContract
      contractStore.updateContract(contract);
      console.log('Contrat mis à jour:', contract.id);
    } else {
      // Ajouter un nouveau contrat
      contractStore.addContract(contract);
      console.log('Nouveau contrat créé:', contract.id);
    }
  
    setTimeout(() => {
      toast.success(isUpdate ? 'Contrat mis à jour avec succès!' : 'Contrat créé avec succès!');
      isSaving.value = false;
      isSaved.value = true;
    }, 800);
  };

  // Fonction pour déployer le contrat
  const deployContract = () => {
    // Valider l'automate avant le déploiement
    if (!validateAutomate()) {
      toast.error('Impossible de déployer le contrat. Veuillez corriger les erreurs.');
      return;
    }
    
    // Changer le statut du contrat
    contractStatus.value = 'Deployer';
    
    // Sauvegarder le contrat avec le nouveau statut
    saveContract();

    const serviceModel = parseAutomateToServiceModel();


    downloadJSON(serviceModel, `${contractName.value}.json`);
    
    console.log(JSON.stringify(serviceModel));

    toast.success('Contrat déployé avec succès!');
  };

// Fonction pour convertir tous les automates du contrat au format standard du service
const parseAutomateToServiceModel = () => {
  if (!contractAutomates.value.length) {
    return null;
  }
  
  const automatesModels = contractAutomates.value.map(automate => {
    // Récupérer les états directement
    const states = automate.states.map(state => state.label);
    
    // Récupérer les transitions directement
    const transitions = automate.transitions.map(transition => {
      // Trouver les états source et cible correspondants
      const sourceState = automate.states.find(state => state.id === transition.source);
      const targetState = automate.states.find(state => state.id === transition.target);
      
      // Récupérer les labels directement
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
    parseAutomateToServiceModel
  };
}