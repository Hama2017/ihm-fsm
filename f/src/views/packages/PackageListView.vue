// Constantes
const MIN_FILE_OPERATION_DELAY = 1500; // 1.5 secondes pour animation// Constantes
const MIN_FILE_OPERATION_DELAY = 1500; // 1.5 secondes pour animation<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{{ t('packages.title') }}</h1>
    
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
        </router-link>
      </div>
    </div>

    <!-- Liste des packages -->
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ t('packages.title') }}</h2>
      
      <!-- État de chargement -->
      <div v-if="packageStore.loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-2"></div>
        <p class="text-gray-500 dark:text-gray-400">{{ t('common.loading') }}</p>
      </div>
      
      <!-- Liste des packages -->
      <div v-else-if="filteredPackages.length > 0" class="overflow-x-auto">
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
                <div class="text-sm text-gray-500 dark:text-gray-300">{{ pkg.functions.length }} fonction(s)</div>
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
      
      <!-- État vide -->
      <div v-else class="text-center py-8">
        <LucidePackage class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
        <p class="mt-2 text-gray-500 dark:text-gray-400">          {{ t('packages.noPackages') }}
        </p>
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
import { withMinDelay } from '@/utils/services/delayService';

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
const loadingMessage = ref(t('common.loading'));

// Computed
const filteredPackages = computed(() => {
  if (!searchQuery.value) return packageStore.packages;
  
  const query = searchQuery.value.toLowerCase();
  return packageStore.packages.filter(pkg => 
    (pkg.label && pkg.label.toLowerCase().includes(query)) || 
    (pkg.description && pkg.description.toLowerCase().includes(query)) ||
    pkg.id.toLowerCase().includes(query)
  );
});

// Fonction utilitaire simple pour traduire les codes d'erreur
const translateError = (errorCode) => {
  if (!errorCode) return t('errors.general.unknown_error');
  return t(errorCode) || t('errors.general.unknown_error');
};

// Méthodes
function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function triggerFileInput() {
  fileInput.value.click();
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  
  if (!file) return;
  
  if (file.type !== 'application/json') {
    toast.error(t('errors.package.invalid_format'));
    return;
  }
  
  try {
    // Activer le chargement
    isLoading.value = true;
    loadingMessage.value = t('packages.importingMessage');
    
    const result = await packageStore.importPackage(file);
    
    // Attendre avec un délai minimum pour l'animation
    await new Promise(resolve => setTimeout(resolve, MIN_FILE_OPERATION_DELAY));
    
    if (result.success) {
      if (result.isUpdate) {
        toast.warning(t('packages.updateSuccess'));
      } else {
        toast.success(t('packages.importSuccess'));
      }
    } else {
      toast.error(t(result.errorCode) || t('errors.package.import_failed'));
    }
  } catch (error) {
    console.error('Error handling file upload:', error);
    toast.error(t('errors.package.import_failed'));
  } finally {
    isLoading.value = false;
    // Réinitialiser l'input file
    event.target.value = null;
  }
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
      // Correction pour éviter le double préfixe
      const errorKey = result.errorCode || 'deletion_failed';
      toast.error(t(`errors.package.${errorKey}`) || t(`errors.general.${errorKey}`) || t('errors.general.unknown_error'));
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
    console.log('Chargement des packages...');
    const result = await packageStore.fetchPackages();
    
    console.log('Résultat:', result);
    
    if (!result.success) {
      toast.error(t(result.errorCode));
    }
  } catch (error) {
    console.error('Failed to load packages:', error);
    toast.error(t('errors.general.get_failed'));
  }
});
</script>