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
      <div class="text-gray-700 dark:text-gray-300">
        <p class="font-medium mb-2">{{ errorTitle }}</p>
        <p>{{ errorMessage }}</p>
      </div>
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
import { usePackageStore } from '@/stores/packageStore';
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
const packageStore = usePackageStore();
const toast = useToast();
const { t } = useI18n();

// État
const isInitialLoading = ref(false); // Changé à false par défaut pour le mode création
const isLoading = ref(false);
const loadingMessage = ref(t('common.loading'));
const showErrorModal = ref(false);
const errorMessage = ref('');
const errorTitle = ref('');

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

// Validation des données du package
function validatePackage(pkg) {
  // Vérifier les ID de package
  if (!pkg.id) {
    throw new Error('missing_id');
  }
  
  if (!pkg.label) {
    throw new Error('missing_label');
  }
  
  // Vérifier les fonctions pour les doublons d'ID
  if (Array.isArray(pkg.functions) && pkg.functions.length > 0) {
    const functionIds = new Set();
    
    for (const func of pkg.functions) {
      if (!func.id && !func.name) {
        throw new Error('missing_function_id');
      }
      
      const funcId = func.id || func.name;
      
      if (functionIds.has(funcId)) {
        throw new Error('duplicate_function_id');
      }
      
      functionIds.add(funcId);
      
      if (!func.label) {
        throw new Error('missing_function_label');
      }
    }
  }
  
  return true;
}

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
      // Essayer d'abord de trouver le package dans le store
      let pkg = packageStore.getPackageById(packageId.value);
      
      if (pkg) {
        console.log('Package found in store:', pkg);
        Object.assign(currentPackage, JSON.parse(JSON.stringify(pkg)));
      } else {
        // Si pas dans le store, charger depuis l'API
        console.log('Package not found in store, fetching from API...');
        const apiPackage = await packageService.getPackage(packageId.value);
        console.log('Package loaded from API:', apiPackage);
        
        // Convertir au format interne
        const internalPackage = packageService.convertToInternalFormat(apiPackage);
        console.log('Package converted to internal format:', internalPackage);
        
        // Mettre à jour le package courant
        Object.assign(currentPackage, internalPackage);
        console.log('Current package updated:', currentPackage);
        
        // Ajouter au store pour les prochaines fois
        if (!packageStore.getPackageById(packageId.value)) {
          packageStore.packages.push(internalPackage);
        }
      }
    } catch (error) {
      console.error('Failed to load package:', error);
      
      errorTitle.value = t('errors.package.not_found');
      errorMessage.value = t('errors.package.not_found_message', { id: packageId.value });
      showErrorModal.value = true;
      
      // Rediriger vers la liste après fermeture du modal
      setTimeout(() => {
        router.push({ name: 'packages' });
      }, 2000);
    }
  } catch (error) {
    console.error('Error in loadPackage:', error);
    
    errorTitle.value = t('errors.general.unknown_error');
    errorMessage.value = t('errors.general.try_again');
    showErrorModal.value = true;
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
    // Valider les données du package
    try {
      validatePackage(packageData);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      
      // Afficher les erreurs de validation appropriées
      if (validationError.message === 'missing_id') {
        toast.error(t('errors.package.missing_id'));
        return;
      } else if (validationError.message === 'missing_label') {
        toast.error(t('errors.package.missing_label'));
        return;
      } else if (validationError.message === 'duplicate_function_id') {
        errorTitle.value = t('errors.package.duplicate_function');
        errorMessage.value = t('errors.package.duplicate_function_message');
        showErrorModal.value = true;
        return;
      } else if (validationError.message === 'missing_function_id') {
        toast.error(t('errors.package.missing_function_id'));
        return;
      } else if (validationError.message === 'missing_function_label') {
        toast.error(t('errors.package.missing_function_label'));
        return;
      }
      
      toast.error(t('errors.form.validation_failed'));
      return;
    }
    
    // Activer l'écran de chargement
    isLoading.value = true;
    loadingMessage.value = isNewPackage.value 
      ? t('packages.createSuccess') 
      : t('packages.updateSuccess');
    
    // Sauvegarder le package
    if (isNewPackage.value) {
      // Créer un nouveau package
      console.log('Creating new package:', packageData);
      const result = await packageStore.createPackage(packageData);
      
      if (result.success) {
        toast.success(t('packages.createSuccess'));
      } else {
        // Gérer les erreurs spécifiques
        if (result.errorCode === 'errors.package.already_exists') {
          errorTitle.value = t('errors.package.already_exists');
          errorMessage.value = t('errors.package.already_exists_message', { id: packageData.id });
          showErrorModal.value = true;
          isLoading.value = false;
          return;
        } else if (result.errorCode === 'errors.package.duplicate_function') {
          errorTitle.value = t('errors.package.duplicate_function');
          errorMessage.value = t('errors.package.duplicate_function_message');
          showErrorModal.value = true;
          isLoading.value = false;
          return;
        } else {
          throw new Error(result.errorCode);
        }
      }
    } else {
      // Mettre à jour le package
      console.log('Updating package:', packageData);
      const result = await packageStore.updatePackage(packageId.value, packageData);
      
      if (result.success) {
        toast.success(t('packages.updateSuccess'));
      } else {
        // Gérer les erreurs spécifiques
        if (result.errorCode === 'errors.package.duplicate_function') {
          errorTitle.value = t('errors.package.duplicate_function');
          errorMessage.value = t('errors.package.duplicate_function_message');
          showErrorModal.value = true;
          isLoading.value = false;
          return;
        } else {
          throw new Error(result.errorCode);
        }
      }
    }
    
    // Rediriger vers la liste (après un court délai pour voir l'animation)
    setTimeout(() => {
      isLoading.value = false;
      router.push({ name: 'packages' });
    }, 1500);
  } catch (error) {
    console.error('Error saving package:', error);
    
    errorTitle.value = isNewPackage.value 
      ? t('errors.package.creation_failed') 
      : t('errors.package.update_failed');
    
    errorMessage.value = t('errors.general.try_again');
    showErrorModal.value = true;
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
  if (newId && newId !== oldId) {
    isInitialLoading.value = true;
    await loadPackage();
  }
});

// Surveillez également les changements de nom de route
watch(() => route.name, (newName, oldName) => {
  console.log(`Route name changed from ${oldName} to ${newName}`);
  if (newName === 'package-new' && oldName !== 'package-new') {
    // Réinitialiser pour un nouveau package
    resetPackage();
  }
});
</script>