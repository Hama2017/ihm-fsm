<template>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Paramètres</h1>
      
      <div class="space-y-8">
        <!-- Section Thème -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h2 class="text-xl font-medium text-gray-900 dark:text-white mb-4">Apparence</h2>
          
          <div class="space-y-4">
            <!-- Option de thème -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-medium text-gray-900 dark:text-white">Thème</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Choisir entre le mode clair et sombre</p>
              </div>
              <div class="flex items-center gap-4">
                <label class="inline-flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="light" 
                    class="sr-only peer" 
                    :checked="!themeStore.darkMode"
                    @change="themeStore.setDarkMode(false)"
                  />
                  <div class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 peer-checked:bg-blue-100 peer-checked:text-blue-800 dark:peer-checked:bg-blue-900 dark:peer-checked:text-blue-200">
                    <LucideSun class="w-5 h-5" />
                    <span>Clair</span>
                  </div>
                </label>
                <label class="inline-flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="dark" 
                    class="sr-only peer" 
                    :checked="themeStore.darkMode"
                    @change="themeStore.setDarkMode(true)"
                  />
                  <div class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 peer-checked:bg-blue-100 peer-checked:text-blue-800 dark:peer-checked:bg-blue-900 dark:peer-checked:text-blue-200">
                    <LucideMoon class="w-5 h-5" />
                    <span>Sombre</span>
                  </div>
                </label>
              </div>
            </div>
            
            <!-- Option suivre système -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-medium text-gray-900 dark:text-white">Suivre le système</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Utiliser le thème défini par votre système</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="systemTheme" 
                  class="sr-only peer"
                  @change="followSystemTheme"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Section Personnalisation des couleurs -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h2 class="text-xl font-medium text-gray-900 dark:text-white mb-4">Couleurs personnalisées</h2>
          
          <div class="space-y-4">
            <!-- Couleur primaire -->
            <div>
              <h3 class="text-base font-medium text-gray-900 dark:text-white mb-2">Couleur primaire</h3>
              <div class="flex flex-wrap gap-2">
                <template v-for="color in predefinedColors" :key="color.name">
                  <button 
                    class="w-8 h-8 rounded-full border-2 transition-all duration-200"
                    :class="[
                      themeStore.colors.primary === color.value 
                        ? 'border-gray-900 dark:border-white scale-110' 
                        : 'border-transparent hover:scale-105'
                    ]"
                    :style="{ backgroundColor: color.value }"
                    @click="updatePrimaryColor(color.value)"
                  ></button>
                </template>
                
                <!-- Sélecteur de couleur personnalisée -->
                <div class="relative">
                  <button 
                    class="w-8 h-8 rounded-full border-2 flex items-center justify-center hover:scale-105 transition-all duration-200"
                    :class="customColorActive ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'"
                    @click="customColorActive = !customColorActive"
                  >
                    <LucidePlus class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  <div v-if="customColorActive" class="absolute left-0 top-full mt-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Couleur hexadécimale</label>
                    <div class="flex">
                      <input 
                        type="text" 
                        v-model="customColor"
                        placeholder="#3B82F6" 
                        class="w-24 px-2 py-1 rounded-l-md border-l border-y border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-r-md"
                        @click="updatePrimaryColor(customColor)"
                      >
                        Définir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Réinitialiser -->
            <div class="pt-2">
              <button 
                class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                @click="themeStore.resetColors"
              >
                Réinitialiser les couleurs
              </button>
            </div>
          </div>
        </div>
        
        <!-- Section Interface utilisateur -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h2 class="text-xl font-medium text-gray-900 dark:text-white mb-4">Interface utilisateur</h2>
          
          <div class="space-y-4">
            <!-- Sidebar compact -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-medium text-gray-900 dark:text-white">Barre latérale compacte</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Afficher la barre latérale en mode compact par défaut</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="sidebarCompact" 
                  class="sr-only peer"
                  @change="updateSidebarPreference"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <!-- Animations -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-medium text-gray-900 dark:text-white">Animations</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Activer les animations de l'interface</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="enableAnimations" 
                  class="sr-only peer"
                  @change="updateAnimationPreference"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useThemeStore } from '../stores/theme';
  import { LucideSun, LucideMoon, LucidePlus } from 'lucide-vue-next';
  
  // Store
  const themeStore = useThemeStore();
  
  // State
  const systemTheme = ref(false);
  const customColorActive = ref(false);
  const customColor = ref('#3B82F6');
  const sidebarCompact = ref(false);
  const enableAnimations = ref(true);
  
  // Couleurs prédéfinies
  const predefinedColors = [
    { name: 'Bleu', value: '#3B82F6' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Violet', value: '#8B5CF6' },
    { name: 'Rose', value: '#EC4899' },
    { name: 'Rouge', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Jaune', value: '#EAB308' },
    { name: 'Vert', value: '#22C55E' },
    { name: 'Emeraude', value: '#10B981' },
    { name: 'Cyan', value: '#06B6D4' },
  ];
  
  // Méthodes
  const followSystemTheme = () => {
    if (systemTheme.value) {
      // Écouter les changements de préférence du système
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeFromSystem);
      // Appliquer immédiatement
      updateThemeFromSystem();
    } else {
      // Arrêter d'écouter les changements
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', updateThemeFromSystem);
    }
  };
  
  const updateThemeFromSystem = () => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    themeStore.setDarkMode(isDarkMode);
  };
  
  const updatePrimaryColor = (color) => {
    themeStore.setColor('primary', color);
    customColorActive.value = false;
  };
  
  const updateSidebarPreference = () => {
    localStorage.setItem('sidebarCompact', JSON.stringify(sidebarCompact.value));
    // Cette valeur pourrait être lue par le composant MainLayout ou App
    // pour initialiser l'état du sidebar
  };
  
  const updateAnimationPreference = () => {
    localStorage.setItem('enableAnimations', JSON.stringify(enableAnimations.value));
    
    // Appliquer le paramètre à l'ensemble du document
    if (enableAnimations.value) {
      document.documentElement.classList.remove('no-animations');
    } else {
      document.documentElement.classList.add('no-animations');
    }
  };
  
  // Initialisation
  onMounted(() => {
    // Vérifier si l'utilisateur a activé "suivre système" auparavant
    const savedSystemTheme = localStorage.getItem('followSystemTheme');
    if (savedSystemTheme !== null) {
      systemTheme.value = JSON.parse(savedSystemTheme);
      if (systemTheme.value) {
        followSystemTheme();
      }
    }
    
    // Restaurer préférences de sidebar
    const savedSidebarCompact = localStorage.getItem('sidebarCompact');
    if (savedSidebarCompact !== null) {
      sidebarCompact.value = JSON.parse(savedSidebarCompact);
    }
    
    // Restaurer préférences d'animations
    const savedAnimations = localStorage.getItem('enableAnimations');
    if (savedAnimations !== null) {
      enableAnimations.value = JSON.parse(savedAnimations);
      if (!enableAnimations.value) {
        document.documentElement.classList.add('no-animations');
      }
    }
  });
  </script>