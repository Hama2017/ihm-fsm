<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {{ isNewPackage ? t('packages.create') : t('packages.edit') }}
      </h1>
      <router-link :to="{name: 'packages'}" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
        <LucideX class="w-5 h-5" />
      </router-link>
    </div>

    <!-- État de chargement initial -->
    <div v-if="isInitialLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p class="ml-4 text-gray-600 dark:text-gray-400">{{ t('common.loading') }}</p>
    </div>

    <!-- Formulaire d'édition -->
    <package-form 
      v-else
      :package="currentPackage" 
      :is-new="isNewPackage"
      @save="savePackage"
      @cancel="cancelEdit"
    />

    <!-- Modal d'erreur -->
    <modal
      v-if="showErrorModal"
      v-model="showErrorModal"
      :title="t('common.error')"
      variant="danger"
      :show-cancel="false"
      :confirm-text="t('common.close')"
      @confirm="showErrorModal = false"
    >
      <p class="text-gray-700 dark:text-gray-300">
        {{ errorMessage }}
      </p>
    </modal>

    <!-- Écran de chargement -->
    <ui-loading 
      :visible="isLoading" 
      :message="loadingMessage"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import packageService from '@/services/packageService';
import { useToast } from '@/composables/Toast/useToast';
import { useI18n } from '@/composables/i18n/useI18n';
import PackageForm from '@/components/package/PackageForm.vue';
import Modal from '@/components/ui/UiModal.vue';
import UiLoading from '@/components/ui/UiLoading.vue';
import { LucideX } from 'lucide-vue-next';

// Router et composables
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

// État
const isInitialLoading = ref(false); // Changé à false par défaut pour le mode création
const isLoading = ref(false);
const loadingMessage = ref(t('common.loading'));
const showErrorModal = ref(false);
const errorMessage = ref('');
const currentPackage = reactive({
  id: '',
  name: '',
  label: '',
  description: '',
  functions: [],
  variables: [],
  structs: []
});

// Computed
const isNewPackage = computed(() => route.name === 'package-new');
const packageId = computed(() => route.params.id);

// Méthodes
async function loadPackage() {
  try {
    // Si c'est un nouveau package, simplement initialiser un objet vide
    if (isNewPackage.value) {
      console.log('Initializing new package template');
      resetPackage();
      isInitialLoading.value = false;
      return; // Sortir de la fonction immédiatement
    }
    
    // Sinon, charger un package existant
    console.log('Loading existing package:', packageId.value);
    isInitialLoading.value = true;
    
    try {
      const apiPackage = await packageService.getPackage(packageId.value);
      console.log('Package loaded from API:', apiPackage);
      
      // Convertir au format interne
      const internalPackage = packageService.convertToInternalFormat(apiPackage);
      console.log('Package converted to internal format:', internalPackage);
      
      // Mettre à jour le package courant
      Object.assign(currentPackage, internalPackage);
      console.log('Current package updated:', currentPackage);
    } catch (error) {
      console.error('Failed to load package:', error);
      
      // Plan B: Essayer de le trouver dans la liste des packages
      try {
        console.log('Trying to find package in the list of all packages');
        const allPackages = await packageService.getAllPackages();
        
        if (Array.isArray(allPackages)) {
          const foundPackage = allPackages.find(pkg => pkg.id === packageId.value);
          
          if (foundPackage) {
            console.log('Package found in list:', foundPackage);
            
            // Convertir au format interne
            const internalPackage = packageService.convertToInternalFormat(foundPackage);
            
            // Mettre à jour le package courant
            Object.assign(currentPackage, internalPackage);
            console.log('Current package updated from list:', currentPackage);
          } else {
            throw new Error('Package not found in list');
          }
        } else {
          throw new Error('Failed to get list of packages');
        }
      } catch (backupError) {
        console.error('Backup plan failed:', backupError);
        throw error; // Relancer l'erreur originale
      }
    }
  } catch (error) {
    console.error('Error loading package:', error);
    
    if (error.response && error.response.status === 404) {
      toast.error(t('errors.package.not_found'));
      router.push({ name: 'packages' });
    } else {
      errorMessage.value = t('errors.package.not_found');
      showErrorModal.value = true;
    }
  } finally {
    isInitialLoading.value = false;
  }
}

function resetPackage() {
  // Réinitialise le package avec des valeurs par défaut
  Object.assign(currentPackage, {
    id: '',
    name: '',
    label: '',
    description: '',
    functions: [{
      id: '',
      name: '',
      label: '',
      description: '',
      code: '',
      default: false
    }],
    variables: [],
    structs: []
  });
}

async function savePackage(packageData) {
  try {
    // Activer l'écran de chargement
    isLoading.value = true;
    loadingMessage.value = isNewPackage.value 
      ? t('packages.importingMessage') 
      : t('packages.exportingMessage');
    
    // Valider les données
    if (!packageData.id || !packageData.label) {
      toast.error(t('errors.form.required'));
      isLoading.value = false;
      return;
    }
    
    if (isNewPackage.value) {
      // Créer un nouveau package
      console.log('Creating new package:', packageData);
      await packageService.createPackage(packageData);
      toast.success(t('packages.createSuccess'));
    } else {
      // Mettre à jour le package
      console.log('Updating package:', packageData);
      await packageService.updatePackage(packageId.value, packageData);
      toast.success(t('packages.updateSuccess'));
    }
    
    // Rediriger vers la liste (après un court délai pour voir l'animation)
    setTimeout(() => {
      isLoading.value = false;
      router.push({ name: 'packages' });
    }, 1500);
  } catch (error) {
    console.error('Error saving package:', error);
    
    if (error.response && error.response.status === 409) {
      toast.error(t('errors.package.already_exists'));
    } else {
      errorMessage.value = isNewPackage.value 
        ? t('errors.package.import_failed') 
        : t('errors.package.update_failed');
      showErrorModal.value = true;
    }
    isLoading.value = false;
  }
}

function cancelEdit() {
  router.push({ name: 'packages' });
}

// Lifecycle hooks
onMounted(async () => {
  console.log('PackageEditorView mounted, route:', route.name);
  await loadPackage();
});

// Surveillance des changements de route
watch(() => route.params.id, async (newId, oldId) => {
  console.log(`Route param 'id' changed from ${oldId} to ${newId}`);
  if (newId) {
    isInitialLoading.value = true;
    await loadPackage();
  }
});

// Surveillez également les changements de nom de route
watch(() => route.name, (newName, oldName) => {
  console.log(`Route name changed from ${oldName} to ${newName}`);
  if (newName === 'package-new') {
    // Réinitialiser pour un nouveau package
    resetPackage();
  }
});
</script>