<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { 
  LucideFilePlus, 
  LucideSearch, 
  LucidePencil, 
  LucideTrash2, 
  LucideBox, 
  LucideHash, 
  LucideCalendar,
  LucideFileSearch,
  LucideDownload,
  LucideUpload,
  LucideEye
} from 'lucide-vue-next';

import { useContractStore } from '@/stores/contractStore';
import { useThemeStore } from '@/stores/theme';
import { 
  downloadContractAsSlc, 
  loadContractFromFile,
  saveContractToPinia 
} from '@/composables/contract/useContractIO';
import toast from '@/composables/Toast/useToast';
import UiToastContainer from '@/components/ui/UiToastContainer.vue';
import Modal from '@/components/ui/UiModal.vue';

// Stores
const contractStore = useContractStore();
const { contracts } = storeToRefs(contractStore);
const router = useRouter();

// Theme
const themeStore = useThemeStore();
const { darkMode } = storeToRefs(themeStore);

// Recherches et filtres
const searchQuery = ref('');
const statusFilter = ref('all');

// Upload input ref
const fileInputRef = ref(null);

// État de chargement
const isLoading = ref(false);
const loadingMessage = ref('Veuillez patienter...');

// État pour la modale de suppression
const showDeleteModal = ref(false);
const contractToDelete = ref(null);

// Filtrage
const filteredContracts = computed(() => {
  return contracts.value.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                           contract.id.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesStatus = statusFilter.value === 'all' ||
                         (statusFilter.value === 'draft' && contract.status === 'Brouillon') ||
                         (statusFilter.value === 'deployed' && contract.status === 'Deployer');

    return matchesSearch && matchesStatus;
  });
});

// CSS classes pour les statuts
const statusClasses = {
  'Deployer': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
  'Brouillon': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
};

// Affichage de date
const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Date invalide';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
};

// Détails du contrat
const viewContract = (contractId) => {
  console.log(`Voir les détails du contrat ${contractId}`);
  router.push({ name: 'contract-details', params: { id: contractId } });
};

// Éditer le contrat
const editContract = (contractId) => {
  console.log(`Éditer le contrat ${contractId}`);
  router.push({ name: 'edit-contract', params: { id: contractId } });
};

// Télécharger un contrat en .slc
const exportContract = (contract) => {
  isLoading.value = true;
  loadingMessage.value = 'Téléchargement en cours...';
  
  // Activer l'animation immédiatement
  activateSvgAnimation();
  
  // Simuler un délai pour voir l'écran de chargement (plus long pour voir l'animation complète)
  setTimeout(() => {
    try {
      // Utilisation de la fonction downloadContractAsSlc définie dans useContractIO.js
      downloadContractAsSlc(contract, `${contract.name}.slc`);
      toast.success('Téléchargement effectué avec succès !');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement du contrat');
    } finally {
      isLoading.value = false;
    }
  }, 2500); // Délai de 2.5 secondes pour voir l'animation complète
};

// Importer un contrat depuis fichier
const importContract = (event) => {
  // Récupérer le fichier sélectionné
  const file = event.target.files[0];
  if (!file) return;
  
  // Vérifier l'extension du fichier
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split('.').pop();
  
  if (fileExtension !== 'slc') {
    toast.error(`Extension de fichier non valide. Seuls les fichiers .slc sont acceptés.`);
    // Réinitialiser l'input file pour permettre une nouvelle sélection du même fichier
    event.target.value = '';
    return;
  }
  
  // Vérifier la taille du fichier (optionnel - limite à 5MB par exemple)
  const maxSize = 5 * 1024 * 1024; // 5MB en octets
  if (file.size > maxSize) {
    toast.error(`Fichier trop volumineux. La taille maximale est de 5MB.`);
    event.target.value = '';
    return;
  }
  
  isLoading.value = true;
  loadingMessage.value = 'Importation en cours...';
  
  // Activer l'animation immédiatement
  activateSvgAnimation();

  // Simuler un délai pour voir l'écran de chargement (plus long pour voir l'animation complète)
  setTimeout(() => {
    // Utilisation de la fonction loadContractFromFile définie dans useContractIO.js
    loadContractFromFile(file, (contract) => {
      isLoading.value = false;
      
      // Vérification que le contrat est valide
      if (!contract) {
        toast.error('Fichier invalide ou corrompu');
        event.target.value = '';
        return;
      }
      
      // Vérifier que le contrat a les propriétés requises
      if (!contract.id || !contract.name) {
        toast.error('Format de contrat non valide');
        event.target.value = '';
        return;
      }

      // Utiliser saveContractToPinia au lieu de manipuler directement le store
      saveContractToPinia(contract);
      
      toast.success(`Importation réussie : "${contract.name}"`);
      event.target.value = ''; // Réinitialiser l'input après importation réussie
    });
  }, 2500); // Délai de 2.5 secondes pour voir l'animation complète
};

// Fonction pour activer l'animation SVG
const activateSvgAnimation = () => {
  // Attendre que le DOM soit prêt
  setTimeout(() => {
    const svgLogo = document.querySelector('.loading-logo');
    if (svgLogo) {
      svgLogo.classList.add('active');
      
      // Attendre que l'animation de traçage soit terminée avant de démarrer le pulse
      // La dernière transition dure 1s et commence après 0.48s, donc attendre ~1.5s
      setTimeout(() => {
        svgLogo.classList.add('pulse-ready');
      }, 1500);
    }
  }, 100);
};

// Suppression d'un contrat
const openDeleteModal = (contract) => {
  contractToDelete.value = contract;
  showDeleteModal.value = true;
};

const confirmDeleteContract = () => {
  if (!contractToDelete.value) return;
  
  isLoading.value = true;
  loadingMessage.value = 'Suppression en cours...';
  
  // Activer l'animation immédiatement
  activateSvgAnimation();
  
  // Simuler un délai pour voir l'écran de chargement
  setTimeout(() => {
    try {
      // Appel au store pour supprimer le contrat
      contractStore.deleteContract(contractToDelete.value.id);
      toast.success(`Le contrat "${contractToDelete.value.name}" a été supprimé`);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du contrat');
    } finally {
      isLoading.value = false;
      showDeleteModal.value = false;
      contractToDelete.value = null;
    }
  }, 2000);
};

const cancelDeleteContract = () => {
  showDeleteModal.value = false;
  contractToDelete.value = null;
};
</script>

<style scoped>
/* Importer les styles d'animation du SVG */
@import '../../assets/css/loading-animation.css';
</style>

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
          <option value="deployed">Deployé</option>
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
        :key="contract.id" 
        class="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 relative overflow-hidden group"
      >
        <!-- Indicateur coloré (barre latérale suivant le statut) -->
        <div 
          :class="`absolute left-0 top-0 bottom-0 w-1 ${
            contract.status === 'Deployer' ? 'bg-green-500' : 'bg-yellow-500'
          }`"
        ></div>
        
        <div class="pl-2">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{{ contract.name }}</h3>
            <div :class="`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[contract.status]}`">
              {{ contract.status }}
            </div>
          </div>

          <div class="flex flex-col space-y-3 mb-5">
            <div class="flex items-center text-sm">
              <LucideHash class="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
              <span class="text-gray-700 dark:text-gray-300 truncate">ID: {{ contract.id }}</span>
            </div>
            <div class="flex items-center text-sm">
              <LucideBox class="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
              <span class="text-gray-700 dark:text-gray-300">{{ contract.automates.length }} automate(s)</span>
            </div>
            <div class="flex items-center text-sm">
              <LucideCalendar class="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
              <span class="text-gray-700 dark:text-gray-300">Créé le: {{ formatDate(contract.createdAt) }}</span>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <!-- Actions disponibles selon le statut -->
            <div class="flex space-x-2">
              <!-- Boutons d'édition et suppression uniquement pour les contrats en "Brouillon" -->
              <template v-if="contract.status === 'Brouillon'">
                <button 
                  @click="editContract(contract.id)" 
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
              </template>
              <!-- Pour les contrats deployés, juste un espace vide pour équilibrer -->
              <div v-else class="w-12"></div>
            </div>

            <div class="flex items-center space-x-2">
              <!-- Télécharger (disponible pour tous les contrats) -->
              <button
                class="p-2 rounded-lg text-sm bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center"
                @click="exportContract(contract)"
                title="Télécharger"
              >
                <LucideDownload class="h-4 w-4" />
              </button>
              
              <!-- Bouton Détails -->
              <button 
              v-if="contract.status === 'Deployer'"
                class="px-4 py-1.5 rounded-lg text-sm bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200 shadow-sm flex items-center space-x-1"
                @click="viewContract(contract.id)"
              >
                <LucideEye  class="h-3.5 w-3.5 mr-1" />
                <span>Détails</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- État vide amélioré -->
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
  <Transition name="fade">
    <div v-if="isLoading" class="loading-overlay">
      <svg width="105" height="126" viewBox="0 0 105 126" fill="none" xmlns="http://www.w3.org/2000/svg" class="loading-logo mb-6">
        <path d="M52.4167 3L102.833 33V93L52.4167 123L2 93V33L52.4167 3Z" stroke="url(#paint0_linear_75_60)" stroke-width="4" class="svg-elem-1"></path>
        <path d="M66.5333 38H38.3C34.9587 38 32.25 40.6863 32.25 44V82C32.25 85.3137 34.9587 88 38.3 88H66.5333C69.8747 88 72.5833 85.3137 72.5833 82V44C72.5833 40.6863 69.8747 38 66.5333 38Z" fill="#3A82F6" stroke="#3B82F6" stroke-width="1.5" class="svg-elem-2"></path>
        <path d="M38.2998 48H66.5331" stroke="white" stroke-width="2" class="svg-elem-3"></path>
        <path d="M38.2998 56H62.4998" stroke="white" stroke-width="2" class="svg-elem-4"></path>
        <path d="M38.2998 64H58.4665" stroke="white" stroke-width="2" class="svg-elem-5"></path>
        <defs>
          <linearGradient id="paint0_linear_75_60" x1="2" y1="3" x2="10085.3" y2="3" gradientUnits="userSpaceOnUse">
            <stop stop-color="#3B82F6"></stop>
            <stop offset="1" stop-color="#06B6D4"></stop>
          </linearGradient>
        </defs>
      </svg>
      <p class="text-lg font-medium text-gray-800 dark:text-gray-200">{{ loadingMessage }}</p>
    </div>
  </Transition>
  
  <!-- Container pour les toasts -->
  <UiToastContainer />
</template>