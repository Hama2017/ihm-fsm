<!-- TransitionForm.vue -->
<template>
    <div class="space-y-4">
      <!-- Source -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          État source
        </label>
        <select 
          v-model="modelValue.source"
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option v-for="node in nodes" :key="node.id" :value="node.id">
            {{ node.data.label }}
          </option>
        </select>
      </div>
      
      <!-- Destination -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          État destination
        </label>
        <select 
          v-model="modelValue.target"
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option v-for="node in nodes" :key="node.id" :value="node.id">
            {{ node.data.label }}
          </option>
        </select>
      </div>
      
      <!-- Fonction / Déclencheur -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Déclencheur
        </label>
        <select 
          v-model="modelValue.function"
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option v-for="func in availableFunctions" :key="func.value" :value="func.value">
            {{ func.label }}
          </option>
        </select>
      </div>
      
      <!-- Section pour les conditions -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Conditions associées
          </label>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ modelValue.conditions?.length || 0 }} sélectionnée(s)
          </span>
        </div>
        
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <div v-for="(packageC, index) in packetCondition" :key="packageC.id" class="border-b last:border-b-0 border-gray-200 dark:border-gray-700">
            <div class="bg-gray-50 dark:bg-gray-700 px-3 py-2 font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                 @click="togglePackage(index)">
              {{ packageC.label }}
              <div>
                <LucideChevronDown v-if="expandedPackages[index]" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <LucideChevronRight v-else class="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div v-show="expandedPackages[index]" class="p-2 bg-white dark:bg-gray-800">
              <div v-for="condition in packageC.functions" :key="condition.id" class="mb-1 last:mb-0">
                <label class="flex items-center px-3 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                  <input 
                    type="checkbox" 
                    :value="condition.id" 
                    v-model="modelValue.conditions"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ condition.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Affichage des conditions sélectionnées -->
        <div v-if="modelValue.conditions?.length > 0" class="mt-3 space-y-2">
          <div 
            v-for="conditionId in modelValue.conditions" 
            :key="conditionId"
            class="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800/50"
          >
            <span class="text-sm text-blue-700 dark:text-blue-300 truncate pr-2">
              {{ getConditionLabel(conditionId) }}
            </span>
            <button 
              @click="removeCondition(conditionId)"
              class="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 transition-colors"
              title="Retirer la condition"
            >
              <LucideX class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      
      <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400 mt-2 p-2 bg-red-50 dark:bg-red-900/10 rounded border border-red-100 dark:border-red-800/30">
        {{ errorMessage }}
      </p>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { LucideChevronDown, LucideChevronRight, LucideX } from 'lucide-vue-next';
  
  const props = defineProps({
    nodes: {
      type: Array,
      default: () => []
    },
    availableFunctions: {
      type: Array,
      default: () => []
    },
    packetCondition: {
      type: Array,
      default: () => []
    },
    errorMessage: {
      type: String,
      default: ''
    }
  });
  
  const modelValue = defineModel({
    default: () => ({
      source: '',
      target: '',
      function: '',
      conditions: []
    })
  });
  
  // Si conditions est undefined, initialiser avec un tableau vide
  if (!modelValue.value.conditions) {
    modelValue.value.conditions = [];
  }
  
  // État pour les packages d'expansion
  const expandedPackages = ref([]);
  
  // Ouvrir les packages par défaut si des conditions sont sélectionnées
  onMounted(() => {
    // Initialiser tous les packages comme fermés par défaut
    expandedPackages.value = props.packetCondition.map(() => false);
    
    if (modelValue.value.conditions && modelValue.value.conditions.length > 0) {
      // Trouve quels packages contiennent les conditions sélectionnées
      props.packetCondition.forEach((pkg, index) => {
        const hasSelectedCondition = pkg.functions.some(func => 
          modelValue.value.conditions.includes(func.id)
        );
        if (hasSelectedCondition) {
          expandedPackages.value[index] = true;
        }
      });
    }
  });
  
  // Fonction pour basculer l'expansion d'un package
  const togglePackage = (index) => {
    expandedPackages.value[index] = !expandedPackages.value[index];
  };
  
  // Fonction pour obtenir le label d'une condition par son ID
  const getConditionLabel = (conditionId) => {
    for (const pkg of props.packetCondition) {
      const condition = pkg.functions.find(c => c.id === conditionId);
      if (condition) {
        return condition.label;
      }
    }
    return conditionId;
  };
  
  // Fonction pour supprimer une condition
  const removeCondition = (conditionId) => {
    const index = modelValue.value.conditions.indexOf(conditionId);
    if (index !== -1) {
      const newConditions = [...modelValue.value.conditions];
      newConditions.splice(index, 1);
      modelValue.value.conditions = newConditions;
    }
  };
  </script>
  
  <style scoped>
  /* Personnalisation de la barre de défilement pour les navigateurs compatibles */
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  .scrollbar-thumb-gray-300 {
    scrollbar-color: #d1d5db transparent;
  }
  .dark .scrollbar-thumb-gray-600 {
    scrollbar-color: #4b5563 transparent;
  }
  
  /* Styles pour les navigateurs webkit (Chrome, Safari, etc.) */
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 6px;
  }
  .dark .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #4b5563;
  }
  </style>