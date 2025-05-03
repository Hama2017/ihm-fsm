<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{{ $route.meta.title }}</h1>

    <!-- Toolbar -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-4">
        <!-- Recherche -->
        <div class="relative">
          <LucideSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher un contrat..."
            class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors duration-300"
          />
        </div>

        <!-- Filtre par statut -->
        <select 
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
        >
          <option value="all">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="deployed">Déployé</option>
        </select>
      </div>

      <div class="flex items-center space-x-3">
        <!-- Importer un contrat -->
        <button
          @click="fileInputRef.click()"
          class="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-500 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center space-x-2 shadow-sm hover:shadow"
        >
          <LucideUpload class="h-4 w-4" />
          <span>Importer un contrat</span>
        </button>
        <input ref="fileInputRef" type="file" accept=".slc" class="hidden" @change="importContract" />

        <!-- Nouveau contrat -->
        <router-link 
          :to="{ name: 'create-contract' }" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200 shadow-sm"
        >
          <LucideFilePlus class="h-4 w-4" />
          <span>Nouveau contrat</span>
        </router-link>
      </div>
    </div>

    <!-- Liste des contrats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="contract in filteredContracts" 
        :key="contract.name" 
        class="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 relative overflow-hidden group"
      >
        <!-- Indicateur coloré (barre latérale suivant le statut) -->
        <div 
          :class="`absolute left-0 top-0 bottom-0 w-1 ${
            contract.status === 'deployed' ? 'bg-green-500' : 'bg-yellow-500'
          }`"
        ></div>
        
        <div class="pl-2">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{{ contract.name }}</h3>
            <div :class="`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[contract.status || 'draft']}`">
              {{ contract.status || 'Brouillon' }}
            </div>
          </div>

          <div class="flex flex-col space-y-3 mb-5">
            <div class="flex items-center text-sm">
              <LucideBox class="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
              <span class="text-gray-700 dark:text-gray-300">{{ getAutomateCount(contract) }} automate(s)</span>
            </div>
            <div class="flex items-center text-sm">
              <LucideCalendar class="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
              <span class="text-gray-700 dark:text-gray-300">Créé le: {{ formatDate(contract.createdAt) }}</span>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <!-- Actions basées sur le statut -->
            <div class="flex space-x-2">
              <button 
                @click="editContract(contract.name)" 
                class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <LucidePencil class="h-4 w-4" />
              </button>
              <button 
                @click="openDeleteModal(contract)" 
                class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-200"
              >
                <LucideTrash2 class="h-4 w-4" />
              </button>
            </div>

            <div class="flex items-center space-x-2">
              <!-- Exécution (si déployé) -->
              <button
                v-if="contract.status === 'deployed'"
                @click.stop="executeContract(contract.name)"
                class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                title="Exécuter le contrat"
              >
                <LucidePlay class="w-5 h-5" />
              </button>

              <!-- Télécharger -->
              <button
                class="p-2 rounded-lg text-sm bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center"
                @click="exportContract(contract)"
                title="Télécharger"
              >
                <LucideDownload class="h-4 w-4" />
              </button>
              
              <!-- Détails (si déployé) -->
              <button 
                v-if="contract.status === 'deployed'"
                class="px-4 py-1.5 rounded-lg text-sm bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200 shadow-sm flex items-center space-x-1"
                @click="viewContract(contract.name)"
              >
                <LucideEye class="h-3.5 w-3.5 mr-1" />
                <span>Détails</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-if="filteredContracts.length === 0" class="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 mt-6">
      <LucideFileSearch class="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">Aucun contrat trouvé</h3>
      <p class="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        Il n'y a aucun contrat correspondant à vos critères de recherche.
      </p>
    </div>
  </div>
  
  <!-- Modale de suppression -->
  <Modal
    v-if="showDeleteModal"
    v-model="showDeleteModal"
    title="Supprimer le contrat ?"
    confirm-text="Supprimer"
    variant="danger"
    @confirm="confirmDeleteContract"
    @cancel="cancelDeleteContract"
  >
    <p class="text-gray-700 dark:text-gray-300">
      Êtes-vous sûr de vouloir supprimer le contrat 
      <span class="font-semibold">{{ contractToDelete?.name }}</span> ? 
      Cette action est irréversible.
    </p>
  </Modal>
  
  <!-- Écran de chargement -->
  <LoadingOverlay v-if="isLoading" :message="loadingMessage" />

  <!-- Container pour les toasts -->
  <UiToastContainer />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import toast from '@/composables/Toast/useToast';
import ContractAutomatonService from '@/services/contractAutomaton';
import Modal from '@/components/ui/UiModal.vue';
import LoadingOverlay from '@/components/ui/UiLoadingOverlay.vue';

import {
  LucideFilePlus, 
  LucideSearch, 
  LucidePencil, 
  LucideTrash2, 
  LucideBox,
  LucideCalendar, 
  LucideFileSearch, 
  LucideDownload, 
  LucideUpload, 
  LucideEye,
  LucidePlay
} from 'lucide-vue-next';

// Formatage des dates
const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Date invalide';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
};

const statusClasses = {
  'deployed': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  'draft': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
};

// Router
const router = useRouter();

// États
const contracts = ref([]);
const searchQuery = ref('');
const statusFilter = ref('all');
const fileInputRef = ref(null);
const isLoading = ref(false);
const loadingMessage = ref('Veuillez patienter...');
const showDeleteModal = ref(false);
const contractToDelete = ref(null);

// --- Charger les contrats au montage ---
const loadContractsAutomaton = async () => {



  isLoading.value = true;
  loadingMessage.value = 'Chargement des contrats...';
  
  
  try {
    // Appel à l'API pour obtenir tous les contrats d'automate
 
    const response = await ContractAutomatonService.listContractAutomaton();
    
    // Adaptation du format des données reçues
    if (response.data) {
      // Vérifier la structure de la réponse selon le Swagger
      // La structure exacte dépendra de l'API
      const contractsData = response.data;
      
      // Traiter les données et les formater pour la vue
      const formattedContracts = [];
      
      // Parcourir les propriétés de l'objet contracts
      for (const key in contractsData) {
        if (Array.isArray(contractsData[key])) {
          contractsData[key].forEach(contract => {
            formattedContracts.push({
              name: contract.name,
              status: contract.status || 'draft',
              createdAt: contract.createdAt || new Date().toISOString(),
              updatedAt: contract.updatedAt || new Date().toISOString(),
              description: contract.description || '',
              automates: contract.automates || []
            });
          });
        }
      }
      
      contracts.value = formattedContracts;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des contrats:', error);
    toast.error('Erreur lors du chargement des contrats');
  } finally {
    isLoading.value = false;
  }
};

// Helper pour obtenir le nombre d'automates
const getAutomateCount = (contract) => {
  return contract.automates ? contract.automates.length : 0;
};

// --- Supprimer un contrat ---
const confirmDeleteContract = async () => {
  if (!contractToDelete.value) return;

  try {
    isLoading.value = true;
    loadingMessage.value = 'Suppression du contrat...';

    // Appel à l'API pour supprimer le contrat
    await ContractAutomatonService.deleteContractAutomaton(contractToDelete.value.name);

    // Retirer le contrat supprimé du tableau
    contracts.value = contracts.value.filter(c => c.name !== contractToDelete.value.name);

    toast.success(`Contrat "${contractToDelete.value.name}" supprimé avec succès`);
  } catch (error) {
    console.error('Erreur lors de la suppression du contrat:', error);
    toast.error('Erreur lors de la suppression du contrat.');
  } finally {
    isLoading.value = false;
    showDeleteModal.value = false;
    contractToDelete.value = null;
  }
};

const openDeleteModal = (contract) => {
  contractToDelete.value = contract;
  showDeleteModal.value = true;
};

const cancelDeleteContract = () => {
  showDeleteModal.value = false;
  contractToDelete.value = null;
};

// --- Filtres ---
const filteredContracts = computed(() => {
  if (!contracts.value) return [];
  
  return contracts.value.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                           contract.description?.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesStatus = statusFilter.value === 'all' ||
                         (statusFilter.value === 'draft' && contract.status === 'draft') ||
                         (statusFilter.value === 'deployed' && contract.status === 'deployed');

    return matchesSearch && matchesStatus;
  });
});

// Modifier un contrat (naviguer vers la page d'édition)
const editContract = (contractName) => {
  router.push({ name: 'edit-contract', params: { id: contractName } });
};

// Télécharger un contrat
const exportContract = async (contract) => {
  try {
    isLoading.value = true;
    loadingMessage.value = 'Téléchargement du contrat...';

    // Obtenir les détails complets du contrat si nécessaire
    let contractDetails = contract;
    if (!contract.automates || contract.automates.length === 0) {
      const response = await ContractAutomatonService.getContractAutomaton(contract.name);
      contractDetails = response.data;
    }

    const blob = new Blob([JSON.stringify(contractDetails, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${contract.name}.slc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast.success(`Contrat "${contract.name}" téléchargé avec succès !`);
  } catch (error) {
    console.error('Erreur lors du téléchargement du contrat:', error);
    toast.error('Erreur lors du téléchargement du contrat.');
  } finally {
    isLoading.value = false;
  }
};

// Voir les détails du contrat déployé
const viewContract = (contractName) => {
  router.push({ name: 'contract-details', params: { id: contractName } });
};

// Exécuter un contrat
const executeContract = (contractName) => {
  router.push({
    name: 'contract-execution',
    params: { name: contractName }
  });
};

// Importer un contrat
const importContract = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    toast.error('Aucun fichier sélectionné.');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importedData = JSON.parse(e.target.result);

      if (!importedData.name || !importedData.automates) {
        toast.error('Format de fichier invalide.');
        return;
      }

      isLoading.value = true;
      loadingMessage.value = 'Importation du contrat...';

      // Conversion au format attendu par l'API
      const contractData = {
        name: importedData.name,
        status: importedData.status || 'draft',
        createdAt: importedData.createdAt || new Date().toISOString(),
        updatedAt: importedData.updatedAt || new Date().toISOString(),
        description: importedData.description || '',
        automates: importedData.automates.map(automate => ({
          id: automate.id,
          name: automate.name,
          active: automate.active || false,
          states: automate.states,
          transitions: automate.transitions
        }))
      };

      // Création du contrat via l'API
      await ContractAutomatonService.createContractAutomaton(contractData);
      
      // Rafraîchir la liste des contrats
      await loadContractsAutomaton();

      toast.success('Contrat importé et enregistré avec succès!');
    } catch (error) {
      console.error('Erreur import:', error);
      toast.error('Erreur lors de l\'import du contrat.');
    } finally {
      isLoading.value = false;
    }
  };

  reader.readAsText(file);
};

// Chargement initial
onMounted(() => {
  loadContractsAutomaton();
});
</script>
<style scoped>


/* Importer les styles d'animation du SVG */
@import '../../assets/css/loading-animation.css';
</style>