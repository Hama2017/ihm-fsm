<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Gestion des packages</h1>
    
    <!-- Barre d'outils -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-4">
        <!-- Recherche -->
        <div class="relative">
          <LucideSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher un package..."
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
          <span>Importer</span>
        </button>
        
        <!-- Nouveau package -->
        <router-link 
          :to="{name: 'package-new'}"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200 shadow-sm"
        >
          <LucideFilePlus class="h-4 w-4" />
          <span>Nouveau package</span>
        </router-link>
      </div>
    </div>

    <!-- Liste des packages -->
    <package-list-component 
      :packages="filteredPackages" 
      :loading="isListLoading"
      @delete="openDeleteModal"
      @export="handleExport"
    />
    
    <!-- Modal suppression -->
    <delete-package-modal
      v-if="showDeleteModal"
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
import { useRouter } from 'vue-router';
import packageService from '@/services/packageService';
import PackageListComponent from '@/components/package/PackageList.vue';
import DeletePackageModal from '@/components/package/DeletePackageModal.vue';
import UiLoading from '@/components/ui/UiLoading.vue';
import { useToast } from '@/composables/Toast/useToast';
import {
  LucideSearch,
  LucideFilePlus,
  LucideUpload
} from 'lucide-vue-next';
import { withMinDelay } from '@/utils/services/delayService';

// Router
const router = useRouter();
const toast = useToast();

// Refs
const searchQuery = ref('');
const fileInput = ref(null);
const showDeleteModal = ref(false);
const packageToDelete = ref(null);
const packages = ref([]);
const isListLoading = ref(true);
const isLoading = ref(false);
const loadingMessage = ref('Chargement en cours...');

// Computed
const filteredPackages = computed(() => {
  if (!searchQuery.value) return packages.value;
  
  const query = searchQuery.value.toLowerCase();
  return packages.value.filter(pkg => 
    pkg.label.toLowerCase().includes(query) || 
    pkg.description.toLowerCase().includes(query) ||
    pkg.id.toLowerCase().includes(query)
  );
});

// Méthodes
async function loadPackages() {
  try {
    isListLoading.value = true;
    const apiPackages = await packageService.getAllPackages();
    
    // Convertir du format API au format interne
    packages.value = apiPackages.map(pkg => packageService.convertToInternalFormat(pkg));

    console.log( packages.value )

  } catch (error) {
    console.error('Failed to load packages:', error);
    toast.error('Erreur lors du chargement des packages');
  } finally {
    isListLoading.value = false;
  }
}

function triggerFileInput() {
  fileInput.value.click();
}


// Constantes
const MIN_FILE_OPERATION_DELAY = 1500; // 1.5 secondes pour animation

async function handleFileUpload(event) {
  const file = event.target.files[0];
  
  if (!file) return;
  
  if (file.type !== 'application/json') {
    toast.error('Veuillez sélectionner un fichier JSON valide');
    return;
  }
  
  try {
    // Activer le chargement
    isLoading.value = true;
    loadingMessage.value = 'Importation en cours...';
    
    // Lire le fichier avec délai minimum
    const readFilePromise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      
      // Lire le fichier comme texte
      reader.readAsText(file);
    });
    
    // Attendre avec un délai minimum
    const fileContent = await withMinDelay(readFilePromise, MIN_FILE_OPERATION_DELAY);
    
    try {
      const packageData = JSON.parse(fileContent);
      
      // Vérifier que le package a un nom
      if (!packageData.name) {
        toast.error('Le fichier JSON ne contient pas de nom de package valide');
        isLoading.value = false;
        return;
      }
      
      // Vérifier si le package existe déjà en cherchant par son nom
      const exists = packages.value.some(p => p.id === packageData.name);
      
      if (exists) {
        // Mettre à jour le package existant
        await packageService.updatePackage(packageData.name, packageData);
        toast.warning(`Le package "${packageData.label || packageData.name}" a été mis à jour`);
      } else {
        // Créer un nouveau package
        await packageService.createPackage(packageData);
        toast.success(`Le package "${packageData.label || packageData.name}" a été importé`);
      }
      
      // Recharger les packages
      await loadPackages();
    } catch (error) {
      console.error('Error importing package:', error);
      
      // Message d'erreur spécifique en fonction du type d'erreur
      if (error.response && error.response.data) {
        toast.error(`Erreur lors de l'import: ${error.response.data.detail || 'Format de fichier invalide'}`);
      } else {
        toast.error('Erreur lors de l\'import: format de fichier invalide');
      }
    } finally {
      isLoading.value = false;
    }
    
    // Réinitialiser l'input file
    event.target.value = null;
  } catch (error) {
    console.error('Error handling file upload:', error);
    toast.error('Erreur lors de l\'import du package');
    isLoading.value = false;
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
    loadingMessage.value = 'Suppression en cours...';
    
    await packageService.deletePackage(packageToDelete.value.name);
    
    // Mettre à jour la liste
    packages.value = packages.value.filter(p => p.id !== packageToDelete.value.id);
    
    toast.success(`Le package "${packageToDelete.value.label}" a été supprimé`);
    
    // Fermer le modal
    showDeleteModal.value = false;
    packageToDelete.value = null;
  } catch (error) {
    console.error('Error deleting package:', error);
    toast.error('Erreur lors de la suppression du package');
  } finally {
    isLoading.value = false;
  }
}

function handleExport(pkg) {
  try {
    // Activer le chargement
    isLoading.value = true;
    loadingMessage.value = 'Préparation du téléchargement...';
    
    // Obtenir l'URL blob
    const url = packageService.exportPackage(pkg);
    
    // Créer un lien pour télécharger le fichier
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pkg.id}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Nettoyer
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      isLoading.value = false;
    }, 1500); // Délai pour voir l'animation
    
    toast.success(`Package "${pkg.label}" exporté avec succès`);
  } catch (error) {
    console.error('Error exporting package:', error);
    toast.error('Erreur lors de l\'exportation du package');
    isLoading.value = false;
  }
}

// Lifecycle hooks
onMounted(async () => {
  await loadPackages();
});
</script>