<template>
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-5 transition-colors duration-300">
      <div class="flex justify-between items-center mb-5">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">AUTOMATES</h2>
        <div class="group relative inline-flex items-center space-x-2 cursor-pointer">
          <button 
            class="bg-gradient-to-tr from-blue-100 to-blue-200 text-blue-700 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300 px-2 py-1 rounded-full hover:scale-105 transition flex items-center"
            @click="addAutomate"
          >
            <LucidePlus class="w-4 h-4" />
            <span class="ml-2 text-sm font-medium">Ajouter</span>
          </button>
          <div class="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap z-10">
            Cliquer pour ajouter un automate
          </div>
        </div>
      </div>
      
      <ul class="space-y-3">
        <li v-for="(automate, index) in automates" :key="index">
          <button 
            :class="[
              'w-full px-4 py-2 text-sm font-medium shadow-sm rounded-full transition-colors duration-200',
              activeAutomate === automate.id 
                ? 'bg-gradient-to-tr from-blue-500 to-blue-700 text-white font-semibold shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            ]"
            @click="selectAutomate(automate.id)"
          >
            {{ automate.name }}
          </button>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref,watch } from 'vue';
  import { LucidePlus } from 'lucide-vue-next';
  import { useThemeStore } from '../../stores/theme';
  import { storeToRefs } from 'pinia';
  
  // Récupérer l'état du thème
  const themeStore = useThemeStore();
  const { darkMode } = storeToRefs(themeStore);

  // Appliquer la classe "dark" sur <html> selon le thème
watch(darkMode, (value) => {
  document.documentElement.classList.toggle('dark', value);
}, { immediate: true });

  // Sample data
  const automates = ref([
    { id: 1, name: 'ELEMENT 01' },
    { id: 2, name: 'AUTOMATE 02' },
    { id: 3, name: 'AUTOMATE 03' },
    { id: 4, name: 'AUTOMATE 04' },
    { id: 5, name: 'AUTOMATE 05' }
  ]);
  
  const activeAutomate = ref(4); // ID 4 est actif par défaut
  
  const selectAutomate = (id) => {
    activeAutomate.value = id;
    // Ici, vous pourriez émettre un événement pour informer le composant parent
  };
  
  const addAutomate = () => {
    const newId = Math.max(...automates.value.map(a => a.id)) + 1;
    automates.value.push({
      id: newId,
      name: `AUTOMATE ${String(newId).padStart(2, '0')}`
    });
  };
  </script>



