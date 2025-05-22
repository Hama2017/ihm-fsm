<template>
  <div 
    @dragenter="handleDragEnter"
    @dragover.prevent
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{{ $route.meta.title }}</h1>
    
    <!-- Zone de drag and drop -->
    <div 
      v-if="isDragOver"
      class="fixed inset-0 z-50 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl border-2 border-dashed border-blue-500 text-center max-w-md pointer-events-none">
        <LucideUpload class="w-12 h-12 mx-auto text-blue-500 mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ t('contracts.dropToImport') }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('contracts.dropDescription') }}
        </p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-4">
        <!-- Recherche -->
        <div class="relative">
          <LucideSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="t('contracts.searchPlaceholder')"
            class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors duration-300"
          />
        </div>

        <!-- Filtre par statut -->
        <select 
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
        >
          <option value="all">{{ t('contracts.allStatuses') }}</option>
          <option value="draft">{{ t('contract.status.draft') }}</option>
          <option value="deployed">{{ t('contract.status.deployed') }}</option>
        </select>
      </div>

      <div class="flex items-center space-x-3">
        <!-- Input file caché pour l'import -->
        <input 
          type="file" 
          ref="fileInputRef" 
          accept=".slc" 
          class="hidden" 
          @change="importContract" 
        />
        
        <!-- Bouton d'import (même style que packages) -->
        <button
          @click="triggerFileInput"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200 shadow-sm"
          :disabled="isLoading"
        >
          <LucideUpload class="h-4 w-4" />
          <span>{{ t('contracts.import') }}</span>
        </button>

        <!-- Nouveau contrat -->
        <router-link 
          :to="{ name: 'create-contract' }" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200 shadow-sm"
        >
          <LucideFilePlus class="h-4 w-4" />
          <span>{{ t('contracts.create') }}</span>
        </router-link>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="isLoading && isFirstLoading" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-2"></div>
      <p class="text-gray-500 dark:text-gray-400">{{ t('common.loading') }}</p>
    </div>

    <!-- Liste des contrats -->
    <div v-else-if="!isLoading || !isFirstLoading">
      <div v-if="filteredContracts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                {{ t(`contract.status.${contract.status || 'draft'}`) }}
              </div>
            </div>

            <div class="flex flex-col space-y-3 mb-5">
              <div class="flex items-center text-sm">
                <LucideBox class="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                <span class="text-gray-700 dark:text-gray-300">
                  {{ t('contracts.automateCount', { count: getAutomateCount(contract) }) }}
                </span>
              </div>
              <div class="flex items-center text-sm">
                <LucideCalendar class="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                <span class="text-gray-700 dark:text-gray-300">
                  {{ t('contracts.createdAt') }}: {{ formatDate(contract.createdAt) }}
                </span>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <!-- Actions basées sur le statut -->
              <div class="flex space-x-2">
                <button 
                  @click="editContract(contract.id)" 
                  class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  :title="t('common.edit')"
                >
                  <LucidePencil class="h-4 w-4" />
                </button>
                <button 
                  @click="openDeleteModal(contract)" 
                  class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-200"
                  :title="t('common.delete')"
                >
                  <LucideTrash2 class="h-4 w-4" />
                </button>
              </div>

              <div class="flex items-center space-x-2">
                <!-- Exécution (si déployé) -->
                <button
                  v-if="contract.status === 'deployed'"
                  @click.stop="executeContract(contract.id)"
                  class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                  :title="t('contracts.execute')"
                >
                  <LucidePlay class="w-5 h-5" />
                </button>

                <!-- Télécharger -->
                <button
                  class="p-2 rounded-lg text-sm bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center"
                  @click="exportContract(contract)"
                  :title="t('common.download')"
                >
                  <LucideDownload class="h-4 w-4" />
                </button>
                
                <!-- Détails (si déployé) -->
                <button 
                  v-if="contract.status === 'deployed'"
                  class="px-4 py-1.5 rounded-lg text-sm bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200 shadow-sm flex items-center space-x-1"
                  @click="viewContract(contract.id)"
                >
                  <LucideEye class="h-3.5 w-3.5 mr-1" />
                  <span>{{ t('common.details') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- État vide avec zone de drop -->
      <div 
        v-else 
        class="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 text-center py-12 transition-colors duration-200"
        :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/20': isDragOverEmpty }"
        @dragenter="handleDragEnterEmpty"
        @dragleave="handleDragLeaveEmpty"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <LucideFileText class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ t('contracts.noContracts') }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {{ t('contracts.noContractsDesc') }}
        </p>
        <div class="flex justify-center space-x-4">
          <button 
            @click="triggerFileInput"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200"
          >
            <LucideUpload class="h-4 w-4" />
            <span>{{ t('contracts.import') }}</span>
          </button>
          <router-link 
            :to="{ name: 'create-contract' }"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200"
          >
            <LucideFilePlus class="h-4 w-4" />
            <span>{{ t('contracts.create') }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
<!-- Modale de détails du contrat -->
<Modal
    v-if="showContractDetails"
    v-model="showContractDetails"
    :title="t('contracts.details')"
    size="xl"
    :show-footer="false"
    @cancel="closeContractDetails"
  >
    <div v-if="selectedContract" class="space-y-6">
      <!-- En-tête avec nom et description -->
      <div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          {{ selectedContract.name }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          {{ selectedContract.description || t('contracts.noDescription') }}
        </p>
      </div>
      
      <!-- Informations générales -->
      <div class="grid grid-cols-2 gap-6">
        <div>
          <span class="font-medium text-gray-900 dark:text-white">{{ t('contracts.status') }}:</span>
          <span :class="`ml-2 px-3 py-1 rounded-full text-sm ${statusClasses[selectedContract.status || 'draft']}`">
            {{ t(`contract.status.${selectedContract.status || 'draft'}`) }}
          </span>
        </div>
        <div>
          <span class="font-medium text-gray-900 dark:text-white">Automates:</span>
          <span class="ml-2 text-gray-600 dark:text-gray-400">
            {{ getAutomateCount(selectedContract) }}
          </span>
        </div>
        <div>
          <span class="font-medium text-gray-900 dark:text-white">{{ t('contracts.createdAt') }}:</span>
          <span class="ml-2 text-gray-600 dark:text-gray-400">
            {{ formatDate(selectedContract.createdAt) }}
          </span>
        </div>
        <div v-if="selectedContract.updatedAt">
          <span class="font-medium text-gray-900 dark:text-white">{{ t('contracts.updatedAt') }}:</span>
          <span class="ml-2 text-gray-600 dark:text-gray-400">
            {{ formatDate(selectedContract.updatedAt) }}
          </span>
        </div>
      </div>
      
      <!-- Liste des automates -->
      <div v-if="selectedContract.automates && selectedContract.automates.length > 0">
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Automates:</h4>
        <div class="space-y-3">
          <div 
            v-for="automate in selectedContract.automates" 
            :key="automate.id"
            class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div class="mb-2">
              <span class="font-medium text-gray-900 dark:text-white text-lg">{{ automate.name }}</span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ automate.states?.length || 0 }} état(s) • {{ automate.transitions?.length || 0 }} transition(s)
            </div>
          </div>
        </div>
      </div>
      
      <!-- Message si pas d'automates -->
      <div v-else class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">Aucun automate dans ce contrat</p>
      </div>
    </div>
  </Modal>
  <!-- Modale de suppression -->
  <Modal
    v-if="showDeleteModal"
    v-model="showDeleteModal"
    :title="t('contracts.confirmDelete')"
    :confirm-text="t('common.delete')"
    variant="danger"
    @confirm="confirmDeleteContract"
    @cancel="cancelDeleteContract"
  >
    <p class="text-gray-700 dark:text-gray-300">
      {{ t('contracts.confirmDeleteMessage', { name: contractToDelete?.name }) }}
    </p>
  </Modal>
  
  <!-- Écran de chargement -->
  <LoadingOverlay v-if="isLoading && !isFirstLoading" :message="loadingMessage" />

  <!-- Container pour les toasts -->
  <UiToastContainer />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import toast from '@/composables/Toast/useToast';
import { useAutomatonContractStore } from '@/stores/automatonContractStore';
import { useI18n } from '@/composables/i18n/useI18n';
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
  LucidePlay,
  LucideFileText
} from 'lucide-vue-next';

// Constantes
const MIN_FILE_OPERATION_DELAY = 1500; // 1.5 secondes pour animation

// Composables
const { t } = useI18n();

// Formatage des dates
const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return t('contracts.invalidDate');
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

// Router et Store
const router = useRouter();
const automatonContractStore = useAutomatonContractStore();

// États
const contracts = computed(() => automatonContractStore.contracts);
const searchQuery = ref('');
const statusFilter = ref('all');
const fileInputRef = ref(null);
const isLoading = computed(() => automatonContractStore.loading);
const isFirstLoading = ref(true);
const loadingMessage = ref('');
const showDeleteModal = ref(false);
const contractToDelete = ref(null);

// Drag and drop states
const isDragOver = ref(false);
const isDragOverEmpty = ref(false);
const dragCounter = ref(0);

// --- Fonctions drag & drop ---
function handleDragEnter(e) {
  e.preventDefault();
  e.stopPropagation();
  dragCounter.value++;
  
  if (e.dataTransfer && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
    const item = e.dataTransfer.items[0];
    if (item.kind === 'file') {
      isDragOver.value = true;
    }
  }
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  dragCounter.value--;
  
  if (dragCounter.value <= 0) {
    isDragOver.value = false;
    dragCounter.value = 0;
  }
}

function handleDragEnterEmpty(e) {
  e.preventDefault();
  e.stopPropagation();
  isDragOverEmpty.value = true;
}

function handleDragLeaveEmpty(e) {
  e.preventDefault();
  e.stopPropagation();
  isDragOverEmpty.value = false;
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  
  // Reset drag states
  isDragOver.value = false;
  isDragOverEmpty.value = false;
  dragCounter.value = 0;
  
  const files = e.dataTransfer.files;
  
  if (files.length === 0) {
    toast.error(t('errors.contract.no_file_dropped'));
    return;
  }
  
  if (files.length > 1) {
    toast.error(t('errors.contract.multiple_files'));
    return;
  }
  
  const file = files[0];
  
  // Vérifier le type de fichier
  if (!file.name.endsWith('.slc')) {
    toast.error(t('errors.contract.invalid_format'));
    return;
  }
  
  // Traiter le fichier
  processFile(file);
}

function triggerFileInput() {
  if (isLoading.value) return;
  fileInputRef.value.click();
}

// --- Charger les contrats au montage ---
const loadContracts = async () => {
  loadingMessage.value = t('contracts.loadingMessage');
  
  try {
    const result = await automatonContractStore.fetchContracts();
    
    if (!result.success) {
      toast.error(t('errors.contract.load_failed'));
    }
  } catch (error) {
    console.error('Erreur lors du chargement des contrats:', error);
    toast.error(t('errors.contract.load_failed'));
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
    loadingMessage.value = t('contracts.deletingMessage');

    // Attendre avec un délai minimum pour l'animation
    await new Promise(resolve => setTimeout(resolve, MIN_FILE_OPERATION_DELAY));

    const result = await automatonContractStore.deleteContract(contractToDelete.value.id);

    if (result.success) {
      toast.success(t('contracts.deleteSuccess', { name: contractToDelete.value.name }));
    } else {
      toast.error(t('errors.contract.deletion_failed'));
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du contrat:', error);
    toast.error(t('errors.contract.deletion_failed'));
  } finally {
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
    const contractName = contract.name || '';
    const contractDescription = contract.description || '';
    const searchTerm = searchQuery.value.toLowerCase();
    
    const matchesSearch = contractName.toLowerCase().includes(searchTerm) ||
                           contractDescription.toLowerCase().includes(searchTerm);

    const matchesStatus = statusFilter.value === 'all' ||
                         (statusFilter.value === 'draft' && contract.status === 'draft') ||
                         (statusFilter.value === 'deployed' && contract.status === 'deployed');

    return matchesSearch && matchesStatus;
  });
});

// Modifier un contrat
const editContract = (contractID) => {
  router.push({ name: 'edit-contract', params: { id: contractID } });
};

// Télécharger un contrat
const exportContract = async (contract) => {
  try {
    loadingMessage.value = t('contracts.exportingMessage');

    let contractDetails = contract;
    if (!contract.automates || contract.automates.length === 0) {
      const result = await automatonContractStore.fetchContractById(contract.name);
      if (result.success) {
        contractDetails = result.data;
      }
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

    // Attendre avec un délai minimum pour l'animation
    await new Promise(resolve => setTimeout(resolve, MIN_FILE_OPERATION_DELAY));

    toast.success(t('contracts.exportSuccess', { name: contract.name }));
  } catch (error) {
    console.error('Erreur lors du téléchargement du contrat:', error);
    toast.error(t('errors.contract.export_failed'));
  }
};


// Ajouter ces refs
const showContractDetails = ref(false);
const selectedContract = ref(null);

// Modifier la fonction viewContract
const viewContract = (contractID) => {
  const contract = contracts.value.find(c => c.id === contractID);
  if (contract) {
    selectedContract.value = contract;
    showContractDetails.value = true;
  } else {
    toast.error(t('errors.contract.not_found'));
  }
};

// Ajouter cette fonction
const closeContractDetails = () => {
  showContractDetails.value = false;
  selectedContract.value = null;
};

// Exécuter un contrat
const executeContract = (contractID) => {
  router.push({
    name: 'contract-execution',
    params: { name: contractID }
  });
};

// Traitement de fichier
async function processFile(file) {
  try {
    loadingMessage.value = t('contracts.importingMessage');
    
    const fileContent = await readFileAsText(file);
    let importedData;
    
    try {
      importedData = JSON.parse(fileContent);
    } catch (parseError) {
      throw new Error('invalid_format');
    }

    // Validation du format
    if (!importedData.name || !importedData.automates) {
      throw new Error('invalid_structure');
    }

    // Vérifier si un contrat avec cet ID existe déjà
    const existingContract = contracts.value.find(contract => 
      contract.id === importedData.id
    );

    if (existingContract) {
      toast.error(t('errors.contract.already_exists_id', { id: importedData.id }));
      return;
    }

    // Vérifier aussi par nom
    const existingByName = contracts.value.find(contract => 
      contract.name === importedData.name
    );

    if (existingByName) {
      toast.error(t('errors.contract.already_exists'));
      return;
    }

    // Procéder à l'importation
    await processContractImport(importedData);

  } catch (error) {
    console.error('Error handling file:', error);
    
    if (error.message === 'invalid_format') {
      toast.error(t('errors.contract.invalid_format'));
    } else if (error.message === 'invalid_structure') {
      toast.error(t('errors.contract.invalid_structure'));
    } else {
      toast.error(t('errors.contract.import_failed'));
    }
  }
}

// Fonction utilitaire pour lire un fichier comme texte
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  });
}

const importContract = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    toast.error(t('errors.contract.no_file_selected'));
    return;
  }

  // Vérifier le type de fichier
  if (!file.name.endsWith('.slc')) {
    toast.error(t('errors.contract.invalid_format'));
    event.target.value = null;
    return;
  }

  await processFile(file);
  event.target.value = null;
};

// Fonction pour traiter l'importation du contrat
const processContractImport = async (importedData) => {
  try {
    const contractData = {
      id: importedData.id,
      name: importedData.name,
      status: importedData.status || 'draft',
      createdAt: importedData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: importedData.description || '',
      automates: importedData.automates.map(automate => ({
        id: automate.id,
        name: automate.name,
        active: automate.active || false,
        states: automate.states,
        transitions: automate.transitions
      }))
    };

    const result = await automatonContractStore.createContract(contractData);
    
    // Attendre avec un délai minimum pour l'animation
    await new Promise(resolve => setTimeout(resolve, MIN_FILE_OPERATION_DELAY));
    
    if (result.success) {
      toast.success(t('contracts.importSuccess', { name: contractData.name }));
    } else {
      if (result.error && result.error.includes('already exists')) {
        toast.error(t('errors.contract.already_exists'));
      } else {
        toast.error(t('errors.contract.import_failed'));
      }
    }
  } catch (error) {
    console.error('Erreur import:', error);
    toast.error(t('errors.contract.import_failed'));
  }
};

// Chargement initial
onMounted(async () => {
  try {
    isFirstLoading.value = true;
    await loadContracts();
  } finally {
    isFirstLoading.value = false;
  }
});
</script>

<style scoped>
/* Importer les styles d'animation du SVG */
@import '../../assets/css/loading-animation.css';
</style>