<template>
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-5 transition-colors duration-300">
      <div class="flex justify-between items-center mb-5">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">FONCTIONS</h2>
        <div class="group relative inline-flex items-center space-x-2 cursor-pointer">
          <button 
            class="bg-gradient-to-tr from-indigo-100 to-indigo-200 text-indigo-700 dark:from-indigo-900 dark:to-indigo-800 dark:text-indigo-300 px-2 py-1 rounded-full hover:scale-105 transition flex items-center"
            @click="addFunction"
          >
            <LucidePlus class="w-4 h-4" />
            <span class="ml-2 text-sm font-medium">Ajouter</span>
          </button>
          <div class="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
            Cliquer pour ajouter une fonction
          </div>
        </div>
      </div>
      
      <ul class="space-y-3">
        <li v-for="(func, index) in functions" :key="index">
          <button 
            :class="[
              'w-full px-4 py-2 text-sm font-medium shadow-sm rounded-full transition-colors duration-200',
              activeFunction === func.id 
                ? 'bg-gradient-to-tr from-blue-500 to-blue-700 text-white font-semibold shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            ]"
            @click="selectFunction(func.id)"
          >
            {{ func.name }}
          </button>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { LucidePlus } from 'lucide-vue-next';
  
  // Sample data
  const functions = ref([
    { id: 1, name: 'FONCTION 01' },
    { id: 2, name: 'FONCTION 02' },
    { id: 3, name: 'FONCTION 03' }
  ]);
  
  const activeFunction = ref(2); // ID 2 est actif par défaut
  
  const selectFunction = (id) => {
    activeFunction.value = id;
    // Ici, vous pourriez émettre un événement pour informer le composant parent
  };
  
  const addFunction = () => {
    const newId = Math.max(...functions.value.map(f => f.id)) + 1;
    functions.value.push({
      id: newId,
      name: `FONCTION ${String(newId).padStart(2, '0')}`
    });
  };
  </script>