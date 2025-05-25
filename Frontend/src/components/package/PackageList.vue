<template>
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
        </router-link>
      </div>
    </div>

    <!-- Liste des packages -->
    <package-list 
      :packages="filteredPackages" 
      :loading="packageStore.loading"
      @delete="openDeleteModal"
      @export="handleExport"
    />
    
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
import PackageList from '@/components/package/PackageList.vue';
import UiLoading from '@/components/ui/UiLoading.vue';
import {
  LucideSearch,
  LucideFilePlus,
  LucideUpload,
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

// Méthodes
function triggerFileInput() {
  if (isLoading.value) return;
  fileInput.value.click();
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
    
    // Étape 2: Vérifier si un package avec cet ID existe déjà
    const existingPackage = packageStore.getPackageById(packageData.id);
    
    if (existingPackage) {
      // Le package existe déjà, afficher un message d'erreur
      toast.error(t('errors.package.already_exists'));
      event.target.value = null; // Réinitialiser l'input
      isLoading.value = false;
      return;
    }
    
    // Étape 3: Importer le package si tout est OK
    const result = await packageStore.importPackage(file);
    
    // Attendre avec un délai minimum pour l'animation
    await new Promise(resolve => setTimeout(resolve, MIN_FILE_OPERATION_DELAY));
    
    if (result.success) {
      toast.success(t('packages.importSuccess'));
    } else {
      toast.error(t(result.errorCode) || t('errors.package.import_failed'));
    }
  } catch (error) {
    console.error('Error handling file upload:', error);
    
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
    // Réinitialiser l'input file
    event.target.value = null;
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
      toast.success(`${t('packages.deleteSuccess')} (${packageToDelete.value.label || packageToDelete.value.id})`);
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
      
      toast.success(`${t('packages.exportSuccess')} (${pkg.label || pkg.id})`);
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
    isLoading.value = true;
    loadingMessage.value = t('common.loading');
    
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
    isLoading.value = false;
  }
});
</script>