<template>
  <form @submit.prevent="emitSave" class="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-6">
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
          :placeholder="t('packages.title')"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          ID
        </label>
        <input
          type="text"
          v-model="packageData.id"
          required
          placeholder="package_id"
          :disabled="!isNew"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          :class="{ 'opacity-75 cursor-not-allowed': !isNew }"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
          {{ tab.label }}
        </button>
      </div>

      <!-- Conteneur des onglets -->
      <div class="p-4">
        <!-- Fonctions -->
        <functions-list 
          v-if="currentTab === 'functions'" 
          v-model="packageData.functions"
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
      >
        {{ props.isNew ? t('packages.create') : t('packages.edit') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { useI18n } from '@/composables/i18n/useI18n';
import FunctionsList from '@/components/package/FunctionsList.vue';
import VariablesList from '@/components/package/VariablesList.vue';
import StructsList from '@/components/package/StructsList.vue';

// Composables
const { t } = useI18n();

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

// Initialisation des données
watch(() => props.package, (newValue) => {
  if (newValue) {
    // Copie profonde pour éviter les problèmes de réactivité
    Object.assign(packageData, JSON.parse(JSON.stringify(newValue)));
  }
}, { immediate: true, deep: true });

// Définition des onglets
const tabs = computed(() => [
  { id: 'functions', label: t('packages.function.title') },
  { id: 'variables', label: t('packages.variable.title') },
  { id: 'structs', label: t('packages.struct.title') }
]);

// Méthodes
function emitSave() {
  // Valider les données avant émission
  if (!packageData.id || !packageData.label) {
    alert(t('errors.form.required'));
    return;
  }
  
  emit('save', packageData);
}

function emitCancel() {
  emit('cancel');
}
</script>