<template>
  <div class="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Packages disponibles</h2>
    
    <!-- État de chargement -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-2"></div>
      <p class="text-gray-500 dark:text-gray-400">Chargement des packages...</p>
    </div>
    
    <!-- Liste des packages -->
    <div v-else-if="packages.length > 0" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fonctions</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="pkg in packages" :key="pkg.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ pkg.label || pkg.id }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">ID: {{ pkg.id }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-500 dark:text-gray-300">{{ truncateText(pkg.description, 100) }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-500 dark:text-gray-300">{{ pkg.functions.length }} fonction(s)</div>
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
              <router-link 
                :to="{name: 'package-details', params: {id: pkg.id}}" 
                class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 mr-3"
              >
                <LucideEye class="w-4 h-4 inline" />
                <span class="sr-only">Détails</span>
              </router-link>

              <router-link 
                :to="{name: 'package-edit', params: {id: pkg.id}}" 
                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
              >
                <LucidePencil class="w-4 h-4 inline" />
                <span class="sr-only">Modifier</span>
              </router-link>
              <button 
                @click="$emit('delete', pkg)" 
                class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 mr-3"
              >
                <LucideTrash2 class="w-4 h-4 inline" />
                <span class="sr-only">Supprimer</span>
              </button>
              <button 
                @click="$emit('export', pkg)" 
                class="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              >
                <LucideDownload class="w-4 h-4 inline" />
                <span class="sr-only">Exporter</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- État vide -->
    <div v-else class="text-center py-8">
      <LucidePackage class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
      <p class="mt-2 text-gray-500 dark:text-gray-400">Aucun package disponible</p>
      <p class="mt-1 text-sm text-gray-400 dark:text-gray-500">
        Créez un nouveau package ou importez-en un pour commencer
      </p>
    </div>
  </div>
</template>

<script setup>
import {
  LucidePencil,
  LucideTrash2,
  LucideDownload,
  LucidePackage,
  LucideEye

} from 'lucide-vue-next';

// Props
const props = defineProps({
  packages: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Emits
defineEmits(['delete', 'export']);

// Méthodes
function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
</script>