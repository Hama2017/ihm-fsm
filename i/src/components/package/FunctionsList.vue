<template>
  <div>
    <div v-for="(func, index) in modelValue" :key="index" class="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('packages.function.title') }} #{{ index + 1 }}</h3>
        <button 
          type="button" 
          @click="removeFunction(index)" 
          class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          :aria-label="t('common.delete')"
        >
          <LucideTrash2 class="w-4 h-4" />
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('common.name') }}
          </label>
          <input
            type="text"
            v-model="modelValue[index].label"
            required
            :placeholder="t('packages.function.namePlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            :class="{ 'border-red-500 dark:border-red-400': hasError(index, 'label') }"
          />
          <p v-if="hasError(index, 'label')" class="mt-1 text-xs text-red-600 dark:text-red-400">
            {{ getError(index, 'label') }}
          </p>
        </div>
        
        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            ID
          </label>
          <div class="relative">
            <input
              type="text"
              v-model="modelValue[index].id"
              required
              placeholder="function_id"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              :class="{ 'border-red-500 dark:border-red-400': hasError(index, 'id') }"
              @input="checkDuplicateId(index)"
            />
            <div v-if="hasDuplicateId(index)" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              <LucideAlertCircle class="h-4 w-4" />
            </div>
          </div>
          <p v-if="hasError(index, 'id')" class="mt-1 text-xs text-red-600 dark:text-red-400">
            {{ getError(index, 'id') }}
          </p>
        </div>
      </div>
      
      <div class="mb-4">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ t('common.description') }}
        </label>
        <textarea
          v-model="modelValue[index].description"
          rows="2"
          :placeholder="t('packages.function.descriptionPlaceholder')"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        ></textarea>
      </div>
      
      <div class="mb-4">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ t('packages.function.code') }}
        </label>
        <div class="border border-gray-300 dark:border-gray-600 rounded-lg code-editor-container overflow-hidden">
          <div class="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-1 border-b border-gray-300 dark:border-gray-600">
            <span class="text-xs text-gray-500 dark:text-gray-400">Solidity</span>
            <div class="flex space-x-2">
              <button type="button" @click="clearCode(index)" class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">{{ t('common.clear') }}</button>
            </div>
          </div>
          <textarea
            v-model="modelValue[index].code"
            rows="8"
            placeholder="// Solidity code here"
            class="w-full px-3 py-2 font-mono text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
          ></textarea>
        </div>
      </div>
      
      <div class="flex items-center">
        <input
          type="checkbox"
          :id="`function-default-${index}`"
          v-model="modelValue[index].default"
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 dark:border-gray-600 dark:bg-gray-700"
        />
        <label :for="`function-default-${index}`" class="ml-2 text-xs text-gray-700 dark:text-gray-300">
          {{ t('packages.function.default') }}
        </label>
      </div>
    </div>
    
    <button
      type="button"
      @click="addFunction"
      class="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-blue-600 dark:text-blue-400 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
    >
      <LucidePlus class="w-4 h-4 mr-2" />
      {{ t('packages.function.add') }}
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from '@/composables/i18n/useI18n';
import { LucideTrash2, LucidePlus, LucideAlertCircle } from 'lucide-vue-next';

// Composables
const { t } = useI18n();

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'validate']);

// État
const errors = reactive({});

// Computed
const functionIds = computed(() => {
  const ids = new Map();
  props.modelValue.forEach((func, index) => {
    const id = func.id || '';
    if (id) {
      if (ids.has(id)) {
        ids.set(id, [...ids.get(id), index]);
      } else {
        ids.set(id, [index]);
      }
    }
  });
  return ids;
});

// Méthodes pour la gestion des erreurs
function hasError(index, field) {
  return errors[`${index}_${field}`] !== undefined;
}

function getError(index, field) {
  return errors[`${index}_${field}`];
}

function setError(index, field, message) {
  errors[`${index}_${field}`] = message;
}

function clearError(index, field) {
  delete errors[`${index}_${field}`];
}

function hasDuplicateId(index) {
  const func = props.modelValue[index];
  const id = func.id || '';
  
  if (!id) return false;
  
  const indexes = functionIds.value.get(id) || [];
  return indexes.length > 1;
}

function checkDuplicateId(index) {
  const func = props.modelValue[index];
  const id = func.id || '';
  
  // Effacer l'erreur existante
  clearError(index, 'id');
  
  if (!id) {
    setError(index, 'id', t('errors.form.required'));
    emitValidate();
    return;
  }
  
  // Vérifier le format de l'ID
  if (!/^[a-z0-9_]+$/.test(id)) {
    setError(index, 'id', t('errors.package.invalid_function_id_format'));
    emitValidate();
    return;
  }
  
  // Vérifier les doublons
  if (hasDuplicateId(index)) {
    setError(index, 'id', t('errors.package.duplicate_function'));
    emitValidate();
    return;
  }
  
  emitValidate();
}

// Méthodes pour la gestion des fonctions
function addFunction() {
  const newFunctions = [...props.modelValue, {
    id: '',
    name: '',
    label: '',
    description: '',
    code: '',
    default: false
  }];
  
  emit('update:modelValue', newFunctions);
}

function removeFunction(index) {
  // Supprimer les erreurs associées à cette fonction
  Object.keys(errors).forEach(key => {
    if (key.startsWith(`${index}_`)) {
      delete errors[key];
    }
  });
  
  const newFunctions = [...props.modelValue];
  newFunctions.splice(index, 1);
  emit('update:modelValue', newFunctions);
  
  // Émettre la validation
  emitValidate();
}

function clearCode(index) {
  const newFunctions = [...props.modelValue];
  newFunctions[index] = { ...newFunctions[index], code: '' };
  emit('update:modelValue', newFunctions);
}

function emitValidate() {
  // Vérifier les IDs pour les doublons
  props.modelValue.forEach((func, index) => {
    checkDuplicateId(index);
  });
  
  // Vérifier les noms obligatoires
  props.modelValue.forEach((func, index) => {
    if (!func.label) {
      setError(index, 'label', t('errors.form.required'));
    } else {
      clearError(index, 'label');
    }
  });
  
  // Émettre l'événement de validation avec le résultat
  emit('validate', Object.keys(errors).length === 0);
}

// Surveiller les changements et valider
watch(() => props.modelValue, () => {
  emitValidate();
}, { deep: true });
</script>

<style scoped>
.code-editor-container {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
}

.code-editor-container textarea {
  resize: none;
}
</style>