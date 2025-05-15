<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <!-- Logo et thème -->
      <div class="flex justify-between items-center px-6 py-4">
        <router-link to="/" class="flex items-center">
          <img src="@/assets/logo/logo.svg" alt="SLC Logo" class="h-10 w-auto" />
        </router-link>
        
        <button 
          @click="toggleTheme"
          class="p-2 rounded-full transition-colors duration-200"
          :class="darkMode 
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'"
        >
          <LucideMoon v-if="!darkMode" class="w-5 h-5" />
          <LucideSun v-else class="w-5 h-5" />
        </button>
      </div>
  
      <!-- Contenu principal -->
      <div class="container mx-auto py-8">
        <router-view />
      </div>
  
      <!-- Footer simple -->
      <footer class="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        &copy; {{ new Date().getFullYear() }} Smart Legal Contract - Tous droits réservés
      </footer>
    </div>
  </template>
  
  <script setup>
  import { useThemeStore } from '@/stores/theme';
  import { storeToRefs } from 'pinia';
  import { LucideSun, LucideMoon } from 'lucide-vue-next';
  
  // Theme store
  const themeStore = useThemeStore();
  const { darkMode } = storeToRefs(themeStore);
  
  const toggleTheme = () => {
    themeStore.setDarkMode(!darkMode.value);
  };
  </script>
  