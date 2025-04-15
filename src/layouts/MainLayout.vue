<template>
    <div class="flex min-h-screen" :class="{ 'dark': isDarkMode }">
      <!-- Sidebar -->
      <TheSidebar
        :is-collapsed="isSidebarCollapsed"
        @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed"
      />
  
      <!-- Main content -->
      <div class="flex flex-col flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <!-- Header -->
        <TheHeader 
          @toggle-theme="toggleTheme"
          :dark-mode="isDarkMode"
        />
  
        <!-- Main content area -->
        <main class="flex-1 p-6">
          <router-view />
        </main>
  
        <!-- Footer -->
        <TheFooter />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, provide, onMounted } from 'vue';
  import TheSidebar from '../components/layout/TheSidebar.vue';
  import TheHeader from '../components/layout/TheHeader.vue';
  import TheFooter from '../components/layout/TheFooter.vue';
  import { useThemeStore } from '../stores/theme';
  
  // Sidebar state
  const isSidebarCollapsed = ref(false);
  
  // Theme state
  const themeStore = useThemeStore();
  const isDarkMode = ref(themeStore.isDarkMode);
  
  // Méthodes
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    themeStore.setDarkMode(isDarkMode.value);
  };
  
  // Fournir l'état du thème aux composants enfants
  provide('isDarkMode', isDarkMode);
  
  // Initialiser le thème au chargement
  onMounted(() => {
    // Restaurer l'état du thème depuis le store
    isDarkMode.value = themeStore.isDarkMode;
    
    // Appliquer les classes dark au document si nécessaire
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });
  </script>