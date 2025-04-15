<template>
    <div class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-inner h-96 relative transition-colors duration-300">
      <p class="text-center pt-10 text-gray-500 dark:text-gray-400 font-medium">Zone d'édition de l'automate</p>
      
      <!-- Cette zone pourrait contenir un canvas ou une interface de drag-and-drop -->
      <!-- C'est ici que vous implémenteriez la logique d'édition des automates -->
      
      <button 
        class="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium flex items-center space-x-2 shadow-lg transition-colors duration-200"
        @click="deployAutomate"
      >
        <LucideRocket class="w-4 h-4" />
        <span>Déployer</span>
      </button>
    </div>
  </template>
  
  <script setup>
  import { LucideRocket } from 'lucide-vue-next';
  
  // Methods
  const deployAutomate = () => {
    // Ici, vous implémenteriez la logique pour déployer l'automate
    alert('Déploiement de l\'automate...');
  };
  </script>