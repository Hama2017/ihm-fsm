<template>
  <aside
    :class="[
      'transition-all duration-300 ease-in-out flex flex-col border-r',
      isSidebarCollapsed ? 'w-20' : 'w-64',
      isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
    ]"
  >
    <!-- Header avec logo et bouton de repli -->
    <div class="p-4 border-b flex items-center justify-between"
         :class="isDarkMode ? 'border-gray-800' : 'border-gray-200'">
      <img 
        :src="isSidebarCollapsed ? logoCollapsed : logo" 
        alt="SLC logo" 
        :class="isSidebarCollapsed ? 'h-10 w-10' : 'h-20 w-48'" 
      />
      <button @click="toggleSidebarCollapsed"
              class="hover:bg-gray-200 dark:hover:bg-gray-800 p-1 rounded"
              :class="isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'">
        <LucideChevronsLeft v-if="!isSidebarCollapsed" class="w-5 h-5" />
        <LucideChevronsRight v-else class="w-5 h-5" />
      </button>
    </div>

    <!-- Menu principal -->
    <nav class="overflow-y-auto py-4 flex-grow">
      <ul class="space-y-1 px-3">
        <SidebarItem 
          v-for="item in standardMenuItems" 
          :key="item.name" 
          :item="item" 
          :is-dark="isDarkMode" 
          :is-collapsed="isSidebarCollapsed" 
        />
      </ul>

      <!-- Groupe Contrats -->
      <div v-if="contractsMenuItems.length > 0" class="mt-4">
        <div v-if="!isSidebarCollapsed" class="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
             :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
          Contrats
        </div>
        <div v-else class="border-t my-2" :class="isDarkMode ? 'border-gray-800' : 'border-gray-200'"></div>
        <ul class="mt-1 space-y-1 px-3">
          <SidebarItem 
            v-for="item in contractsMenuItems" 
            :key="item.name" 
            :item="item" 
            :is-dark="isDarkMode" 
            :is-collapsed="isSidebarCollapsed" 
          />
        </ul>
      </div>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t text-xs flex items-center"
         :class="isDarkMode ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'">
      <span v-if="!isSidebarCollapsed">Réseau actif :</span>
      <span :class="isDarkMode ? 'text-green-400 ml-1' : 'text-green-600 ml-1'">Ethereum</span>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores/theme';
import { useLayoutStore } from '@/stores/layoutStore';

import logo from '@/assets/logo/logo.svg';
import logoCollapsed from '@/assets/logo/logo-collapsed.svg';

import { 
  LucideChevronsLeft, 
  LucideChevronsRight 
} from 'lucide-vue-next';

import SidebarItem from '@/components/layout/SidebarItem.vue';

// Stores
const layoutStore = useLayoutStore();
const { isSidebarCollapsed } = storeToRefs(layoutStore);
const { toggleSidebarCollapsed } = layoutStore;

const themeStore = useThemeStore();
const { darkMode } = storeToRefs(themeStore);
const isDarkMode = darkMode;

// Router
const router = useRouter();

// Obtenir les routes enfants du layout principal
const menuItems = computed(() => {
  return router.options.routes[0].children
    .filter(route => !route.path.includes(':')) // Ne pas inclure les routes avec paramètres
    .map(route => ({
      name: route.name,
      path: route.path,
      meta: route.meta
    }));
});

// Séparer les éléments de menu par groupe
const standardMenuItems = computed(() => {
  return menuItems.value.filter(item => !item.meta?.group);
});
const contractsMenuItems = computed(() => {
  return menuItems.value.filter(item => item.meta?.group === 'Contrats');
});
</script>
