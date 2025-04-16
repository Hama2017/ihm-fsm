// src/components/layout/TheSidebar.vue
<template>
    <aside
      :class="[
        'transition-all duration-300 ease-in-out flex flex-col',
        isCollapsed ? 'w-20' : 'w-64',
        isDarkMode 
          ? 'bg-gray-900 border-gray-800 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      ]"
      class="border-r"
    >
      <div class="p-4 border-b flex items-center justify-between"
        :class="isDarkMode ? 'border-gray-800' : 'border-gray-200'"
      >
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <LucideRocket class="w-5 h-5 text-white" />
          </div>
          <span v-if="!isCollapsed" class="text-xl font-semibold">FSM</span>
        </div>
        <button @click="$emit('toggleSidebar')" 
          class="hover:bg-gray-200 dark:hover:bg-gray-800 p-1 rounded"
          :class="isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'"
        >
          <LucideChevronsLeft v-if="!isCollapsed" class="w-5 h-5" />
          <LucideChevronsRight v-else class="w-5 h-5" />
        </button>
      </div>
      
      <div class="overflow-y-auto py-4 flex-grow">
        <ul class="space-y-1 px-3">
          <!-- Menu items sans groupe -->
          <li v-for="item in standardMenuItems" :key="item.name">
            <router-link 
              :to="{ name: item.name }" 
              class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
              :class="[
                $route.name === item.name 
                  ? isDarkMode 
                    ? 'bg-blue-900 text-white' 
                    : 'bg-blue-50 text-blue-600'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              ]"
            >
              <component :is="getIconComponent(item.meta.icon)" class="w-5 h-5" />
              <span v-if="!isCollapsed">{{ item.meta.title }}</span>
            </router-link>
          </li>
          
          <!-- Menu Contrats avec sous-menus -->
          <li class="mt-4" v-if="contractsMenuItems.length > 0">
            <div v-if="!isCollapsed" class="px-3 py-2 text-xs font-semibold uppercase tracking-wider" 
              :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
              Contrats
            </div>
            <div v-else class="border-t my-2" :class="isDarkMode ? 'border-gray-800' : 'border-gray-200'"></div>
            
            <ul class="mt-1 space-y-1">
              <li v-for="item in contractsMenuItems" :key="item.name">
                <router-link 
                  :to="{ name: item.name }" 
                  class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                  :class="[
                    $route.name === item.name 
                      ? isDarkMode 
                        ? 'bg-blue-900 text-white' 
                        : 'bg-blue-50 text-blue-600'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  ]"
                >
                  <component :is="getIconComponent(item.meta.icon)" class="w-5 h-5" />
                  <span v-if="!isCollapsed">{{ item.meta.title }}</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div class="p-4 border-t text-xs flex items-center"
        :class="isDarkMode ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'"
      >
        <span v-if="!isCollapsed">Réseau actif :</span>
        <span :class="isDarkMode ? 'text-green-400 ml-1' : 'text-green-600 ml-1'">Ethereum</span>
      </div>
    </aside>
  </template>
  
  <script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '../../stores/theme';
import { 
  LucideRocket, 
  LucideChevronsLeft, 
  LucideChevronsRight, 
  LucideLayoutDashboard,
  LucideSettings,
  LucideBox,
  LucideFileText,
  LucideFilePlus
} from 'lucide-vue-next';

// Props
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggleSidebar']);

// Router
const router = useRouter();

// Theme
const themeStore = useThemeStore();
const { darkMode } = storeToRefs(themeStore);
const isDarkMode = darkMode;

// Computed
const menuItems = computed(() => {
  return router.options.routes[0].children.map(route => ({
    name: route.name,
    path: route.path,
    meta: route.meta
  }));
});

// Séparer les éléments de menu par groupe
const standardMenuItems = computed(() => {
  return menuItems.value.filter(item => !item.meta.group);
});

const contractsMenuItems = computed(() => {
  return menuItems.value.filter(item => item.meta.group === 'Contrats');
});

// Méthodes
const getIconComponent = (iconName) => {
  const iconMap = {
    'dashboard': LucideLayoutDashboard,
    'automation': LucideBox,
    'settings': LucideSettings,
    'contract': LucideFileText
  };
  
  return iconMap[iconName] || LucideLayoutDashboard;
};

</script>