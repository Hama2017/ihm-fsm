<template>
  <form @submit.prevent="validateAndSave" class="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-6">
    <!-- Informations générales -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ t('common.name') }}
        </label>
        <input
          type="text"
          v-model="packageData.label"
          required
          :placeholder="t('packages.namePlaceholder')"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          :class="{ 'border-red-500 dark:border-red-400': validationErrors.label }"
        />
        <p v-if="validationErrors.label" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ validationErrors.label }}
        </p>
        <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ t('packages.nameHint') }}
        </p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          ID
        </label>
        <div class="relative">
          <input
            type="text"
            v-model="packageData.id"
            required
            placeholder="package_id"
            :disabled="!isNew"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            :class="{ 
              'opacity-75 cursor-not-allowed': !isNew,
              'border-red-500 dark:border-red-400': validationErrors.id 
            }"
            @input="validatePackageId"
          />
          <div v-if="isIdChecking" class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <div v-else-if="isIdValid === false" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
            <LucideAlertCircle class="h-4 w-4" />
          </div>
          <div v-else-if="isIdValid === true" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
            <LucideCheck class="h-4 w-4" />
          </div>
        </div>
        <p v-if="validationErrors.id" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ validationErrors.id }}
        </p>
        <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ t('packages.idHint') }}
          <span v-if="!isNew">({{ t('packages.notModifiable') }})</span>
        </p>
      </div>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {{ t('common.description') }}
      </label>
      <textarea
        v-model="packageData.description"
        rows="3"
        :placeholder="t('packages.descriptionPlaceholder')"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      ></textarea>
    </div>

    <!-- Onglets pour Fonctions, Variables, Structs -->
    <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div class="flex border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 focus:outline-none transition',
            currentTab === tab.id
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          <span>{{ tab.label }}</span>
          <span v-if="tab.id === 'functions'" class="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {{ packageData.functions.length }}
          </span>
          <span v-if="tab.id === 'variables'" class="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {{ packageData.variables.length }}
          </span>
          <span v-if="tab.id === 'structs'" class="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {{ packageData.structs.length }}
          </span>
        </button>
      </div>

      <!-- Conteneur des onglets -->
      <div class="p-4">
        <!-- Fonctions -->
        <functions-list 
          v-if="currentTab === 'functions'" 
          v-model="packageData.functions"
          @validate="validateFunctions"
        />
        
        <!-- Variables -->
        <variables-list 
          v-if="currentTab === 'variables'" 
          v-model="packageData.variables"
        />
        
        <!-- Structs -->
        <structs-list 
          v-if="currentTab === 'structs'" 
          v-model="packageData.structs"
        />
      </div>
    </div>

    <!-- Erreurs de validation -->
    <div v-if="hasValidationErrors" class="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
      <h3 class="font-medium">{{ t('errors.form.validation_failed') }}:</h3>
      <ul class="list-disc list-inside mt-1">
        <li v-for="(error, field) in validationErrors" :key="field">
          {{ error }}
        </li>
      </ul>
    </div>

    <!-- Boutons d'action -->
    <div class="flex justify-end gap-3">
      <button
        type="button"
        @click="emitCancel"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        :disabled="isSaving"
      >
        <span v-if="isSaving" class="flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
          {{ t('common.saving') }}
        </span>
        <span v-else>
          {{ props.isNew ? t('packages.create') : t('packages.edit') }}
        </span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useI18n } from '@/composables/i18n/useI18n';
import { usePackageStore } from '@/stores/packageStore';
import FunctionsList from '@/components/package/FunctionsList.vue';
import VariablesList from '@/components/package/VariablesList.vue';
import StructsList from '@/components/package/StructsList.vue';
import { LucideAlertCircle, LucideCheck } from 'lucide-vue-next';
import { debounce } from 'lodash';

// Composables
const { t } = useI18n();
const packageStore = usePackageStore();

// Props
const props = defineProps({
  package: {
    type: Object,
    required: true
  },
  isNew: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['save', 'cancel']);

// État
const currentTab = ref('functions');
const packageData = reactive({
  id: '',
  name: '',
  label: '',
  description: '',
  functions: [],
  variables: [],
  structs: []
});
const validationErrors = reactive({});
const isSaving = ref(false);
const isIdChecking = ref(false);
const isIdValid = ref(null);

// Computed
const hasValidationErrors = computed(() => Object.keys(validationErrors).length > 0);

// Définition des onglets
const tabs = computed(() => [
  { id: 'functions', label: t('packages.function.title') },
  { id: 'variables', label: t('packages.variable.title') },
  { id: 'structs', label: t('packages.struct.title') }
]);

// Initialisation des données
watch(() => props.package, (newValue) => {
  if (newValue) {
    // Copie profonde pour éviter les problèmes de réactivité
    Object.assign(packageData, JSON.parse(JSON.stringify(newValue)));
  }
}, { immediate: true, deep: true });

// Validation de l'ID du package (debouncé)
const validatePackageId = debounce(async () => {
  // Si l'ID est vide ou on n'est pas en mode création, sortir
  if (!packageData.id || !props.isNew) {
    isIdValid.value = null;
    return;
  }
  
  // Vérifier si l'ID respecte le format attendu
  if (!/^[a-z0-9_]+$/.test(packageData.id)) {
    validationErrors.id = t('errors.package.invalid_id_format');
    isIdValid.value = false;
    return;
  }
  
  // Vérifier si l'ID existe déjà
  isIdChecking.value = true;
  
  try {
    const existingPackage = packageStore.getPackageById(packageData.id);
    
    if (existingPackage) {
      validationErrors.id = t('errors.package.already_exists');
      isIdValid.value = false;
    } else {
      delete validationErrors.id;
      isIdValid.value = true;
    }
  } catch (error) {
    console.error('Error checking package ID:', error);
  } finally {
    isIdChecking.value = false;
  }
}, 300);

// Validation des fonctions
function validateFunctions() {
  // Vérifier si les IDs des fonctions sont uniques
  const functionIds = new Set();
  const duplicateIds = [];
  
  packageData.functions.forEach(func => {
    const funcId = func.id || func.name;
    
    if (!funcId) {
      return; // Ignorer pour le moment, une autre validation s'en occupera
    }
    
    if (functionIds.has(funcId)) {
      duplicateIds.push(funcId);
    } else {
      functionIds.add(funcId);
    }
  });
  
  if (duplicateIds.length > 0) {
    const duplicates = duplicateIds.join(', ');
    validationErrors.functions = t('errors.package.duplicate_functions', { ids: duplicates });
    return false;
  }
  
  delete validationErrors.functions;
  return true;
}

// Validation complète avant soumission
function validateForm() {
  // Réinitialiser les erreurs
  Object.keys(validationErrors).forEach(key => delete validationErrors[key]);
  
  // Valider les champs obligatoires
  if (!packageData.label) {
    validationErrors.label = t('errors.form.required');
  }
  
  if (!packageData.id) {
    validationErrors.id = t('errors.form.required');
  } else if (!/^[a-z0-9_]+$/.test(packageData.id)) {
    validationErrors.id = t('errors.package.invalid_id_format');
  }
  
  // Valider les fonctions
  validateFunctions();
  
  // Validation d'autres règles métier...
  
  return Object.keys(validationErrors).length === 0;
}

// Méthodes
function validateAndSave() {
  if (validateForm()) {
    isSaving.value = true;
    
    // Envoyer les données au composant parent
    emit('save', packageData);
    
    // Note: On laisse le composant parent désactiver l'état de chargement
    // car il gère la redirection après sauvegarde
  } else {
    // Scroll to the first error
    const firstError = document.querySelector('.border-red-500');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function emitCancel() {
  emit('cancel');
}

// Validation initiale
onMounted(() => {
  if (props.isNew && packageData.id) {
    validatePackageId();
  }
});
</script>