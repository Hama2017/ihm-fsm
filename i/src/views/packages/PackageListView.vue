<template>
  <div 
    @dragenter="handleDragEnter"
    @dragover.prevent
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{{ t('packages.title') }}</h1>
    
    <!-- Zone de drag and drop -->
    <div 
      v-if="isDragOver"
      class="fixed inset-0 z-50 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl border-2 border-dashed border-blue-500 text-center max-w-md pointer-events-none">
        <LucideUpload class="w-12 h-12 mx-auto text-blue-500 mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ t('packages.dropToImport') }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('packages.dropDescription') }}
        </p>
      </div>
    </div>
    
    <!-- Barre d'outils -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-4">
        <!-- Recherche -->
        <div class="relative">
          <LucideSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="t('common.search')"
            class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors duration-300"
          />
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <!-- Input file caché pour l'import -->
        <input 
          type="file" 
          ref="fileInput" 
          accept=".json" 
          class="hidden" 
          @change="handleFileUpload" 
        />
        
        <!-- Bouton d'import -->
        <button 
          @click="triggerFileInput"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200 shadow-sm"
          :disabled="isLoading"
        >
          <LucideUpload class="h-4 w-4" />
          <span>{{ t('packages.import') }}</span>
        </button>
        
        <!-- Nouveau package -->
        <router-link 
          :to="{name: 'package-new'}"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200 shadow-sm"
        >
          <LucideFilePlus class="h-4 w-4" />
          <span>{{ t('packages.create') }}</span>
        </router-link >
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="packageStore.loading || isFirstLoading" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-2"></div>
      <p class="text-gray-500 dark:text-gray-400">{{ t('common.loading') }}</p>
    </div>
    
    <!-- Liste des packages -->
    <div v-else-if="!packageStore.loading && !isFirstLoading">
      <div v-if="filteredPackages.length > 0" class="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ t('packages.title') }} ({{ filteredPackages.length }})</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ t('common.name') }}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ t('common.description') }}</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ t('packages.function.title') }}</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="pkg in filteredPackages" :key="pkg.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ pkg.label || pkg.id }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">ID: {{ pkg.id }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-500 dark:text-gray-300">{{ truncateText(pkg.description, 100) }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-500 dark:text-gray-300">{{ Array.isArray(pkg.functions) ? pkg.functions.length : 0 }} {{ t('packages.function.title').toLowerCase() }}</div>
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                  <router-link 
                    :to="{name: 'package-details', params: {id: pkg.id}}" 
                    class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 mr-3"
                  >
                    <LucideEye class="w-4 h-4 inline" />
                    <span class="sr-only">{{ t('common.details') }}</span>
                  </router-link>

                  <router-link 
                    :to="{name: 'package-edit', params: {id: pkg.id}}" 
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                  >
                    <LucidePencil class="w-4 h-4 inline" />
                    <span class="sr-only">{{ t('common.edit') }}</span>
                  </router-link>
                  <button 
                    @click="openDeleteModal(pkg)" 
                    class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 mr-3"
                  >
                    <LucideTrash2 class="w-4 h-4 inline" />
                    <span class="sr-only">{{ t('common.delete') }}</span>
                  </button>
                  <button 
                    @click="handleExport(pkg)" 
                    class="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                  >
                    <LucideDownload class="w-4 h-4 inline" />
                    <span class="sr-only">{{ t('common.export') }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
        <LucidePackage class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ t('packages.noPackages') }}
        </h3>

        <div class="flex justify-center space-x-4">
          <button 
            @click="triggerFileInput"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200"
          >
            <LucideUpload class="h-4 w-4" />
            <span>{{ t('packages.import') }}</span>
          </button>
          <router-link 
            :to="{name: 'package-new'}"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200"
          >
            <LucideFilePlus class="h-4 w-4" />
            <span>{{ t('packages.create') }}</span>
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- Modal suppression -->
    <delete-package-modal
      v-model="showDeleteModal"
      :package="packageToDelete"
      @confirm="confirmDeletePackage"
    />

    <!-- Écran de chargement -->
    <ui-loading 
      :visible="isLoading" 
      :message="loadingMessage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePackageStore } from '@/stores/packageStore';
import { useToast } from '@/composables/Toast/useToast';
import { useI18n } from '@/composables/i18n/useI18n';
import DeletePackageModal from '@/components/package/DeletePackageModal.vue';
import UiLoading from '@/components/ui/UiLoading.vue';
import {
  LucideSearch,
  LucideFilePlus,
  LucideUpload,
  LucidePencil,
  LucideTrash2,
  LucideDownload,
  LucidePackage,
  LucideEye
} from 'lucide-vue-next';

// Constantes
const MIN_FILE_OPERATION_DELAY = 1500; // 1.5 secondes pour animation

// Store et composables
const packageStore = usePackageStore();
const toast = useToast();
const { t } = useI18n();

// Refs
const searchQuery = ref('');
const fileInput = ref(null);
const showDeleteModal = ref(false);
const packageToDelete = ref(null);
const isLoading = ref(false);
const isFirstLoading = ref(true);
const loadingMessage = ref(t('common.loading'));

// Drag and drop states
const isDragOver = ref(false);
const isDragOverEmpty = ref(false);
const dragCounter = ref(0);

// Computed
const filteredPackages = computed(() => {
  const packages = packageStore.packages || [];
  
  if (!searchQuery.value) return packages;
  
  const query = searchQuery.value.toLowerCase();
  return packages.filter(pkg => 
    (pkg.label && pkg.label.toLowerCase().includes(query)) || 
    (pkg.description && pkg.description.toLowerCase().includes(query)) ||
    pkg.id.toLowerCase().includes(query)
  );
});

// Méthodes
function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function triggerFileInput() {
  if (isLoading.value) return;
  fileInput.value.click();
}

// Drag and Drop handlers
function handleDragEnter(e) {
  e.preventDefault();
  e.stopPropagation();
  dragCounter.value++;
  
  // Vérifier si on a des fichiers
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
    toast.error(t('errors.package.no_file_dropped'));
    return;
  }
  
  if (files.length > 1) {
    toast.error(t('errors.package.multiple_files'));
    return;
  }
  
  const file = files[0];
  
  // Vérifier le type de fichier
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    toast.error(t('errors.package.invalid_format'));
    return;
  }
  
  // Traiter le fichier comme s'il était uploadé via l'input
  processFile(file);
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  
  if (!file) return;
  
  // Vérifier le type de fichier
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    toast.error(t('errors.package.invalid_format'));
    event.target.value = null; // Réinitialiser l'input
    return;
  }
  
  await processFile(file);
  
  // Réinitialiser l'input file
  event.target.value = null;
}

async function processFile(file) {
  try {
    // Activer le chargement
    isLoading.value = true;
    loadingMessage.value = t('packages.importingMessage');
    
    // Étape 1: Analyser le fichier JSON pour obtenir l'ID du package
    const fileContent = await readFileAsText(file);
    let packageData;
    
    try {
      packageData = JSON.parse(fileContent);
    } catch (parseError) {
      throw new Error('invalid_format');
    }
    
    // Vérifier la structure minimale requise
    if (!packageData || !packageData.id) {
      throw new Error('invalid_structure');
    }
    
    // NOUVELLE LOGIQUE: Gérer le name/label
    // Si le name/label est null, vide ou non défini, utiliser l'ID
    if (!packageData.name || packageData.name.trim() === '') {
      packageData.name = packageData.id;
    }
    
    // Si vous utilisez 'label' au lieu de 'name', faire la même chose
    if (!packageData.label || packageData.label.trim() === '') {
      packageData.label = packageData.id;
    }
    
    // Étape 2: Vérifier si un package avec cet ID existe déjà
    const existingPackage = packageStore.getPackageById(packageData.id);
    
    if (existingPackage) {
      // Le package existe déjà, afficher un message d'erreur
      toast.error(t('errors.package.already_exists'));
      isLoading.value = false;
      return;
    }
    
    // Étape 3: Importer le package modifié (via l'API)
    // Créer un nouveau fichier avec les données modifiées
    const modifiedContent = JSON.stringify(packageData, null, 2);
    const modifiedFile = new File([modifiedContent], file.name, { type: 'application/json' });
    
    const result = await packageStore.importPackage(modifiedFile);
    
    // Attendre avec un délai minimum pour l'animation
    await new Promise(resolve => setTimeout(resolve, MIN_FILE_OPERATION_DELAY));
    
    if (result.success) {
      // Rafraîchir la liste des packages depuis le serveur pour garantir qu'ils sont à jour
      await packageStore.fetchPackages();
      
      toast.success(t('packages.importSuccess'));
    } else {
      toast.error(t(result.errorCode) || t('errors.package.import_failed'));
    }
  } catch (error) {
    console.error('Error handling file:', error);
    
    // Gestion d'erreurs spécifiques
    if (error.message === 'invalid_format') {
      toast.error(t('errors.package.invalid_format'));
    } else if (error.message === 'invalid_structure') {
      toast.error(t('errors.package.invalid_structure'));
    } else {
      toast.error(t('errors.package.import_failed'));
    }
  } finally {
    isLoading.value = false;
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

function openDeleteModal(pkg) {
  packageToDelete.value = pkg;
  showDeleteModal.value = true;
}

async function confirmDeletePackage() {
  if (!packageToDelete.value) return;
  
  try {
    // Activer le chargement
    isLoading.value = true;
    loadingMessage.value = t('packages.deletingMessage');
    
    const result = await packageStore.deletePackage(packageToDelete.value.id);
    
    // Attendre avec un délai minimum pour l'animation
    await new Promise(resolve => setTimeout(resolve, MIN_FILE_OPERATION_DELAY));
    
    if (result.success) {
      toast.success(t('packages.deleteSuccess'));
    } else {
      toast.error(t(result.errorCode) || t('errors.package.deletion_failed'));
    }
    
    // Fermer le modal
    showDeleteModal.value = false;
    packageToDelete.value = null;
  } catch (error) {
    console.error('Error deleting package:', error);
    toast.error(t('errors.package.deletion_failed'));
  } finally {
    isLoading.value = false;
  }
}

async function handleExport(pkg) {
  try {
    // Activer le chargement
    isLoading.value = true;
    loadingMessage.value = t('packages.exportingMessage');
    
    const result = await packageStore.exportPackage(pkg.id);
    
    if (result.success && result.data) {
      // Créer un lien pour télécharger le fichier
      const a = document.createElement('a');
      a.href = result.data;
      a.download = `${pkg.id}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(result.data);
      }, 100);
      
      // Attendre avec un délai minimum pour l'animation
      await new Promise(resolve => setTimeout(resolve, MIN_FILE_OPERATION_DELAY));
      
      toast.success(t('packages.exportSuccess'));
    } else {
      toast.error(t(result.errorCode) || t('errors.package.export_failed'));
    }
  } catch (error) {
    console.error('Error exporting package:', error);
    toast.error(t('errors.package.export_failed'));
  } finally {
    isLoading.value = false;
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    isFirstLoading.value = true;
    
    console.log('Chargement des packages...');
    const result = await packageStore.fetchPackages();
    
    console.log('Résultat:', result);
    
    if (!result.success) {
      toast.error(t(result.errorCode) || t('errors.general.get_failed'));
    }
  } catch (error) {
    console.error('Failed to load packages:', error);
    toast.error(t('errors.general.get_failed'));
  } finally {
    isFirstLoading.value = false;
  }
});
</script>