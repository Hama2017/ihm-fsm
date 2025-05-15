<template>
    <div>
      <!-- Boutons standards -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900 mb-6 transition-colors duration-300">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Boutons</h2>
        <div class="space-x-4">
          <button
            v-for="(btn, index) in buttons"
            :key="index"
            :class="[
              'px-4 py-2 rounded transition-colors duration-200',
              btn.class
            ]"
            @click="btn.action"
          >
            {{ btn.label }}
          </button>
        </div>
      </div>
  
      <!-- Boutons avec icônes -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900 transition-colors duration-300">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Boutons avec icônes</h2>
        <div class="space-x-4">
          <button
            v-for="(btn, index) in buttonsWithIcons"
            :key="index"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded transition-colors duration-200',
              btn.class
            ]"
            @click="btn.action"
          >
            <component :is="btn.icon" class="w-4 h-4" />
            {{ btn.label }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { LucidePlus, LucidePencil, LucideTrash2 } from 'lucide-vue-next';
  
  // Boutons standards
  const buttons = [
    {
      label: 'Principal',
      class: 'bg-blue-600 text-white hover:bg-blue-700',
      action: () => console.log('Action principale')
    },
    {
      label: 'Valider',
      class: 'bg-green-600 text-white hover:bg-green-700',
      action: () => console.log('Action de validation')
    },
    {
      label: 'Annuler',
      class: 'bg-red-600 text-white hover:bg-red-700',
      action: () => console.log('Action d\'annulation')
    },
    {
      label: 'Neutre',
      class: 'bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
      action: () => console.log('Action neutre')
    }
  ];
  
  // Boutons avec icônes
  const buttonsWithIcons = [
    {
      label: 'Ajouter',
      icon: LucidePlus,
      class: 'bg-blue-600 text-white hover:bg-blue-700',
      action: () => console.log('Action d\'ajout')
    },
    {
      label: 'Modifier',
      icon: LucidePencil,
      class: 'bg-yellow-500 text-white hover:bg-yellow-600',
      action: () => console.log('Action de modification')
    },
    {
      label: 'Supprimer',
      icon: LucideTrash2,
      class: 'bg-red-600 text-white hover:bg-red-700',
      action: () => console.log('Action de suppression')
    }
  ];
  </script>