<template>
    <div class="deployment-summary bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Récapitulatif de la simulation de déploiement
        </h3>
        <button 
          @click="$emit('close')"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          title="Fermer"
        >
          <LucideX class="w-4 h-4" />
        </button>
      </div>
  
      <div class="space-y-2 text-sm">
        <div class="flex items-center text-green-600 dark:text-green-400">
          <LucideCheckCircle class="w-4 h-4 mr-2" />
          Simulation terminée avec succès !
        </div>
  
        <div class="text-gray-700 dark:text-gray-300">
          Ordre de déploiement des états :
        </div>
  
        <ul class="list-disc list-inside text-gray-800 dark:text-gray-100">
          <li v-for="(label, index) in orderedLabels" :key="index">
            <span class="font-medium">{{ index + 1 }}.</span> {{ label }}
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { LucideCheckCircle, LucideX } from 'lucide-vue-next';
  
  const props = defineProps({
    deployedOrder: {
      type: Array,
      default: () => []
    },
    nodes: {
      type: Array,
      default: () => []
    }
  });
  
  // Obtenir les labels des états déployés
  const orderedLabels = computed(() => {
    return props.deployedOrder.map(id => {
      const node = props.nodes.find(n => n.id === id);
      return node ? node.data.label : id;
    });
  });
  
  const emit = defineEmits(['close']);
  </script>
  
  <style scoped>
  .deployment-summary {
    max-width: 400px;
  }
  </style>
  