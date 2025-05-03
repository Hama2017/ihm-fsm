<template>
    <div class="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div class="text-center">
        <div class="flex justify-center">
          <LucideShieldAlert class="h-24 w-24 text-red-500" />
        </div>
        <h1 class="mt-5 text-3xl font-bold text-gray-900 dark:text-white">Accès non autorisé</h1>
        <p class="mt-3 text-lg text-gray-600 dark:text-gray-400">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
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
  import { LucideShieldAlert, LucideHome } from 'lucide-vue-next';
  </script>