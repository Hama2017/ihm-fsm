<template>
    <div class="space-y-4">
      <div class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg text-center">
        <LucideCheck class="w-6 h-6 text-green-500 dark:text-green-400 mx-auto mb-2" />
        <p class="text-green-700 dark:text-green-300 font-medium">
          Simulation de déploiement terminée avec succès!
        </p>
      </div>
      
      <h3 class="font-medium text-gray-800 dark:text-gray-200">Ordre de déploiement:</h3>
      <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <ol class="list-decimal list-inside space-y-2">
          <li v-for="(automateId, index) in deploymentOrder" :key="index" class="flex items-center py-1">
            <span class="ml-2 text-gray-800 dark:text-gray-200">
              {{ getAutomateName(automateId) }}
            </span>
          </li>
        </ol>
      </div>
      
      <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Cette simulation montre l'ordre dans lequel les automates seront déployés en fonction de leurs dépendances.
          Vous pouvez maintenant procéder au déploiement réel ou modifier vos automates si nécessaire.
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  import { LucideCheck } from 'lucide-vue-next';
  
  const props = defineProps({
    deploymentOrder: {
      type: Array,
      default: () => []
    },
    getAutomateName: {
      type: Function,
      default: (id) => `Automate ${id}`
    }
  });
  </script>