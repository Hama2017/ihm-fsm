import { ref } from 'vue';
import { useRouter } from 'vue-router';
import toast from '@/components/ui/ToastService';

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
    // Indiquer que la sauvegarde est en cours
    isSaving.value = true;

    // Validation
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
    
    // Sauvegarder l'automate courant si nécessaire
    if (activeAutomateId.value) {
      saveCurrentAutomateState();
    }

    // Construire l'objet contrat selon la structure spécifiée
    const contract = {
      id: generateContractId(),
      name: contractName.value.trim(),
      status: contractStatus.value,
      automates: contractAutomates.value.map(automate => ({
        id: automate.id,
        name: automate.name,
        active: automate.id === activeAutomateId.value,
        states: automate.states,
        transitions: automate.transitions
      }))
    };
    
    // Dans un cas réel, nous ferions une requête API ici
    // Pour cet exemple, nous simulons un délai de sauvegarde
    setTimeout(() => {
      // Afficher l'objet en console
      console.log('Contrat sauvegardé:', JSON.stringify(contract, null, 2));
      
      // Afficher un toast de succès
      toast.success('Contrat sauvegardé avec succès!');
      
      // Fin de la sauvegarde
      isSaving.value = false;
      isSaved.value = true;
      
      // Naviguer vers la liste des contrats après un court délai
      setTimeout(() => {
        router.push({ name: 'contracts' });
      }, 1000);
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
    contractStatus.value = 'Actif';
    
    // Sauvegarder le contrat avec le nouveau statut
    saveContract();
    
    toast.success('Contrat déployé avec succès!');
  };

  return {
    isSaving,
    saveContract,
    deployContract
  };
}