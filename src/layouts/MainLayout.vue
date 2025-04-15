<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import Header from '@/components/layout/Header.vue';
import Footer from '@/components/layout/Footer.vue';

const isSidebarCollapsed = ref(false);
const isMobileSidebarOpen = ref(false);

// Fonction pour gérer le toggle du sidebar sur desktop
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

// Fonction pour gérer l'ouverture/fermeture du sidebar sur mobile
const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
};

// Fonction pour fermer le sidebar mobile
const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false;
};

// Fonction pour gérer les clics en dehors du sidebar pour le fermer
const handleClickOutside = (event) => {
  const sidebar = document.getElementById('sidebar');
  const openButton = document.getElementById('open-sidebar-btn');
  
  if (
    isMobileSidebarOpen.value && 
    sidebar && 
    openButton && 
    !sidebar.contains(event.target) && 
    !openButton.contains(event.target)
  ) {
    closeMobileSidebar();
  }
};

// Ajouter/supprimer les écouteurs d'événements
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="flex h-screen custom-scrollbar hash-bg">
    <!-- Sidebar -->
    <Sidebar 
      id="sidebar"
      :is-collapsed="isSidebarCollapsed" 
      :is-mobile-open="isMobileSidebarOpen"
      @toggle-sidebar="toggleSidebar"
      @close-sidebar="closeMobileSidebar"
    />
    
    <!-- Overlay pour mobile quand le sidebar est ouvert -->
    <div 
      v-if="isMobileSidebarOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
      @click="closeMobileSidebar"
    ></div>
    
    <!-- Contenu principal -->
    <div 
      class="flex-1 flex flex-col h-screen transition-all duration-300"
      :class="isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'"
    >
      <!-- Header -->
      <Header 
        :title="'Tableau de bord'" 
        @open-sidebar="toggleMobileSidebar" 
        id="open-sidebar-btn"
      />
      
      <!-- Contenu principal -->
      <main class="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <slot></slot>
      </main>
      
      <!-- Footer -->
      <Footer />
    </div>
  </div>
</template>