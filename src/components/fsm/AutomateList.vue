<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-5 transition-colors duration-300">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">AUTOMATES</h2>
      <div class="group relative inline-flex items-center space-x-2 cursor-pointer">
        <button 
          class="bg-gradient-to-tr from-blue-100 to-blue-200 text-blue-700 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300 px-2 py-1 rounded-full hover:scale-105 transition flex items-center"
          @click="$emit('add-automate')"
        >
          <LucidePlus class="w-4 h-4" />
          <span class="ml-2 text-sm font-medium">Ajouter</span>
        </button>
        <div class="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
          Cliquer pour ajouter un automate
        </div>
      </div>
    </div>
    
    <!-- Message si vide -->
    <div v-if="automates.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
      Cliquer sur le bouton <strong>"Ajouter"</strong> pour créer un automate.
    </div>
    
    <!-- Liste des automates -->
    <ul v-else class="space-y-3">
      <li v-for="automate in automates" :key="automate.id" class="relative group">
        <div class="flex items-center">
          <!-- Bouton automate -->
          <button 
            :class="[
              'flex-grow px-4 py-2 text-sm font-medium shadow-sm rounded-full transition-colors duration-200 text-left',
              activeAutomate === automate.id 
                ? 'bg-gradient-to-tr from-blue-500 to-blue-700 text-white font-semibold shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            ]"
            @click="$emit('select-automate', automate.id)"
          >
            {{ automate.name }}
          </button>

          <!-- Actions -->
          <div class="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
            <button @click.stop="$emit('edit-automate', automate.id)" class="flex items-center p-1 rounded-full transition bg-yellow-500 text-white hover:bg-yellow-600">
              <LucidePencil class="w-4 h-4" />
            </button>

            <button @click.stop="$emit('remove-automate', automate.id)" class="flex items-center p-1 rounded-full transition bg-red-600 text-white hover:bg-red-700">
              <LucideTrash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { LucidePlus, LucidePencil, LucideTrash2 } from 'lucide-vue-next';

// Props
const props = defineProps({
  automates: {
    type: Array,
    default: () => []
  },
  activeAutomate: {
    type: String,
    default: null
  }
});

// Événements émis
defineEmits(['select-automate', 'add-automate', 'edit-automate', 'remove-automate']);
</script>