<template>
<div class="flex min-h-screen">
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
          <router-view  @collapseSideBar="(value)=> isSidebarCollapsed=value"  />
        </main>
  
        <!-- Footer -->
        <TheFooter />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, provide, onMounted, watch } from 'vue';
  import TheSidebar from '../components/layout/TheSidebar.vue';
  import TheHeader from '../components/layout/TheHeader.vue';
  import TheFooter from '../components/layout/TheFooter.vue';
  import { useThemeStore } from '../stores/theme';
  import { storeToRefs } from 'pinia';
  
  // Sidebar state
  const isSidebarCollapsed = ref(false);
  
  // Theme state
  const themeStore = useThemeStore();
  // Utilisation de storeToRefs pour préserver la réactivité
  const { darkMode } = storeToRefs(themeStore);
  const isDarkMode = darkMode;
  
  // Méthodes
  const toggleTheme = () => {
    themeStore.setDarkMode(!isDarkMode.value);
  };
  
  // Surveillez les changements de thème et appliquez-les au document HTML
  watch(isDarkMode, (newVal) => {
    if (newVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, { immediate: true });
  
  // Fournir l'état du thème aux composants enfants
  provide('isDarkMode', isDarkMode);
  
  // Initialiser le thème au chargement
  onMounted(() => {
    // Appliquer les classes dark au document si nécessaire
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });
  </script>