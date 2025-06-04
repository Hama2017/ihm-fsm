<template>
  <div>
    <div v-for="(struct, index) in modelValue" :key="index" class="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('packages.struct.name') }} #{{ index + 1 }}</h3>
        <button type="button" @click="removeStruct(index)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
          <LucideTrash2 class="w-4 h-4" />
        </button>
      </div>
      
      <div class="mb-4">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ t('common.name') }}
        </label>
        <input
          type="text"
          v-model="modelValue[index].name"
          required
          :placeholder="t('packages.struct.name')"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>
      
      <div>
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ t('packages.struct.code') }}
        </label>
        <div class="border border-gray-300 dark:border-gray-600 rounded-lg code-editor-container overflow-hidden">
          <div class="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-1 border-b border-gray-300 dark:border-gray-600">
            <span class="text-xs text-gray-500 dark:text-gray-400"></span>
            <div class="flex space-x-2">
              <button type="button" @click="clearCode(index)" class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">{{ t('common.clear') }}</button>
            </div>
          </div>
          <textarea
            v-model="modelValue[index].code"
            rows="5"
            placeholder="code here"
            class="w-full px-3 py-2 font-mono text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
          ></textarea>
        </div>
      </div>
    </div>
    
    <button
      type="button"
      @click="addStruct"
      class="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-blue-600 dark:text-blue-400 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
    >
      <LucidePlus class="w-4 h-4 mr-2" />
      {{ t('packages.struct.add') }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from '@/composables/i18n/useI18n';
import { LucideTrash2, LucidePlus } from 'lucide-vue-next';

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
const emit = defineEmits(['update:modelValue']);

// Méthodes
function addStruct() {
  const newStructs = [...props.modelValue, {
    name: '',
    code: ''
  }];
  
  emit('update:modelValue', newStructs);
}

function removeStruct(index) {
  const newStructs = [...props.modelValue];
  newStructs.splice(index, 1);
  emit('update:modelValue', newStructs);
}

function clearCode(index) {
  const newStructs = [...props.modelValue];
  newStructs[index] = { ...newStructs[index], code: '' };
  emit('update:modelValue', newStructs);
}
</script>

<style scoped>
.code-editor-container {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
}

.code-editor-container textarea {
  resize: none;
}
</style>