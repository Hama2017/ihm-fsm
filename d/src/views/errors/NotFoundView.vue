<template>
    <div class="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div class="text-center">
        <div class="flex justify-center">
          <h1 class="text-9xl font-bold text-gray-200 dark:text-gray-800">404</h1>
        </div>
        <h2 class="mt-5 text-3xl font-bold text-gray-900 dark:text-white">Page non trouvée</h2>
        <p class="mt-3 text-lg text-gray-600 dark:text-gray-400">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div class="mt-6">
          <router-link 
            to="/" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 inline-flex items-center"
          >
            <LucideHome class="h-4 w-4 mr-2" />
            Retour à l'accueil
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { LucideHome } from 'lucide-vue-next';
  </script>
  