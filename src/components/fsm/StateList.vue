<template>
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-5 transition-colors duration-300">
      <div class="flex justify-between items-center mb-5">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">ETATS</h2>
        <div class="group relative inline-flex items-center space-x-2 cursor-pointer">
          <button 
            class="bg-gradient-to-tr from-purple-100 to-purple-200 text-purple-700 dark:from-purple-900 dark:to-purple-800 dark:text-purple-300 px-2 py-1 rounded-full hover:scale-105 transition flex items-center"
            @click="addState"
          >
            <LucidePlus class="w-4 h-4" />
            <span class="ml-2 text-sm font-medium">Ajouter</span>
          </button>
          <div class="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
            Cliquer pour ajouter un état
          </div>
        </div>
      </div>
      
      <ul class="space-y-3">
        <li v-for="(state, index) in states" :key="index">
          <button 
            :class="[
              'w-full px-4 py-2 text-sm font-medium shadow-sm rounded-full transition-colors duration-200',
              activeState === state.id 
                ? 'bg-gradient-to-tr from-blue-500 to-blue-700 text-white font-semibold shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            ]"
            @click="selectState(state.id)"
          >
            {{ state.name }}
          </button>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { LucidePlus } from 'lucide-vue-next';
  
  // Sample data
  const states = ref([
    { id: 1, name: 'ETAT1' },
    { id: 2, name: 'FONCTION 02' }, // Notez que dans votre template original, c'était écrit ainsi
    { id: 3, name: 'FONCTION 03' }  // Vous pourriez vouloir changer ces noms
  ]);
  
  const activeState = ref(2); // ID 2 est actif par défaut
  
  const selectState = (id) => {
    activeState.value = id;
    // Ici, vous pourriez émettre un événement pour informer le composant parent
  };
  
  const addState = () => {
    const newId = Math.max(...states.value.map(s => s.id)) + 1;
    states.value.push({
      id: newId,
      name: `ETAT${newId}`
    });
  };
  </script>