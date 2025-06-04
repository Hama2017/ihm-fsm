<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <TheSidebar/>

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
import { onMounted, watch } from 'vue';
import TheSidebar from '@/components/layout/Sidebar.vue';
import TheHeader from '@/components/layout/Header.vue';
import TheFooter from '@/components/layout/Footer.vue';
import { useThemeStore } from '@/stores/theme';
import { storeToRefs } from 'pinia';


// Theme store
const themeStore = useThemeStore();
const { darkMode } = storeToRefs(themeStore);
const isDarkMode = darkMode;

const toggleTheme = () => {
  themeStore.setDarkMode(!isDarkMode.value);
};

// Watch for dark mode and apply class to HTML
watch(isDarkMode, (newVal) => {
  document.documentElement.classList.toggle('dark', newVal);
}, { immediate: true });

// Provide theme to child components (optional)
import { provide } from 'vue';
provide('isDarkMode', isDarkMode);

// Init on mount
onMounted(() => {
  document.documentElement.classList.toggle('dark', isDarkMode.value);
});
</script>
