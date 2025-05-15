<template>
    <div>
      <div v-for="(func, index) in modelValue" :key="index" class="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Fonction #{{ index + 1 }}</h3>
          <button type="button" @click="removeFunction(index)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
            <LucideTrash2 class="w-4 h-4" />
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom (affiché)
            </label>
            <input
              type="text"
              v-model="modelValue[index].label"
              required
              placeholder="Nom de la fonction"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Identifiant technique
            </label>
            <input
              type="text"
              v-model="modelValue[index].id"
              required
              placeholder="function_id"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            v-model="modelValue[index].description"
            rows="2"
            placeholder="Description de la fonction"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          ></textarea>
        </div>
        
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Code Solidity
          </label>
          <div class="border border-gray-300 dark:border-gray-600 rounded-lg code-editor-container overflow-hidden">
            <div class="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-1 border-b border-gray-300 dark:border-gray-600">
              <span class="text-xs text-gray-500 dark:text-gray-400">Solidity</span>
              <div class="flex space-x-2">
                <button type="button" @click="clearCode(index)" class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Effacer</button>
              </div>
            </div>
            <textarea
              v-model="modelValue[index].code"
              rows="8"
              placeholder="// Entrez votre code Solidity ici"
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
            Fonction par défaut
          </label>
        </div>
      </div>
      
      <button
        type="button"
        @click="addFunction"
        class="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-blue-600 dark:text-blue-400 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
      >
        <LucidePlus class="w-4 h-4 mr-2" />
        Ajouter une fonction
      </button>
    </div>
  </template>
  
  <script setup>
  import { LucideTrash2, LucidePlus } from 'lucide-vue-next';
  
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
    const newFunctions = [...props.modelValue];
    newFunctions.splice(index, 1);
    emit('update:modelValue', newFunctions);
  }
  
  function clearCode(index) {
    const newFunctions = [...props.modelValue];
    newFunctions[index] = { ...newFunctions[index], code: '' };
    emit('update:modelValue', newFunctions);
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