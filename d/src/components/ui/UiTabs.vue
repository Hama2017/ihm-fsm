<template>
    <div>
      <!-- Onglets horizontaux -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900 mb-6 transition-colors duration-300">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Onglets horizontaux</h2>
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8">
            <a 
              v-for="(tab, index) in horizontalTabs" 
              :key="index"
              href="#"
              :class="[
                'border-b-2 py-2 px-1 text-sm font-medium transition-colors duration-200',
                activeHorizontalTab === index 
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 border-transparent'
              ]"
              @click.prevent="activeHorizontalTab = index"
            >
              {{ tab.label }}
            </a>
          </nav>
        </div>
        <div class="mt-4 text-gray-600 dark:text-gray-300">
          {{ horizontalTabs[activeHorizontalTab].content }}
        </div>
      </div>
  
      <!-- Onglets verticaux -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900 transition-colors duration-300">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Onglets verticaux</h2>
        <div class="flex">
          <div class="flex flex-col w-48 border-r border-gray-200 dark:border-gray-700">
            <a 
              v-for="(tab, index) in verticalTabs" 
              :key="index"
              href="#"
              :class="[
                'py-2 px-4 border-l-4 transition-colors duration-200',
                activeVerticalTab === index 
                  ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              ]"
              @click.prevent="activeVerticalTab = index"
            >
              {{ tab.label }}
            </a>
          </div>
          <div class="flex-1 p-4 text-gray-600 dark:text-gray-300">
            {{ verticalTabs[activeVerticalTab].content }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // Onglets horizontaux
  const horizontalTabs = [
    { label: 'Onglet actif', content: 'Contenu de l\'onglet actif ici.' },
    { label: 'Autre onglet', content: 'Contenu du deuxième onglet.' },
    { label: 'Encore un', content: 'Contenu du troisième onglet.' }
  ];
  const activeHorizontalTab = ref(0);
  
  // Onglets verticaux
  const verticalTabs = [
    { label: 'Onglet actif', content: 'Contenu de l\'onglet vertical actif affiché ici.' },
    { label: 'Onglet 2', content: 'Contenu du deuxième onglet vertical.' },
    { label: 'Onglet 3', content: 'Contenu du troisième onglet vertical.' }
  ];
  const activeVerticalTab = ref(0);
  </script>