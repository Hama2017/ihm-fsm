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
      <router-link to="/">
        <img 
          :src="isSidebarCollapsed ? logoCollapsed : logo" 
          alt="SLC logo" 
          :class="isSidebarCollapsed ? 'h-10 w-10' : 'h-16 w-40'" 
        />
      </router-link>
      <button @click="toggleSidebarCollapsed"
              class="hover:bg-gray-200 dark:hover:bg-gray-800 p-1 rounded"
              :class="isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'">
        <LucideChevronsLeft v-if="!isSidebarCollapsed" class="w-5 h-5" />
        <LucideChevronsRight v-else class="w-5 h-5" />
      </button>
    </div>

    <!-- Profil utilisateur -->
    <div 
      v-if="!isSidebarCollapsed" 
      class="p-4 border-b flex items-center"
      :class="isDarkMode ? 'border-gray-800' : 'border-gray-200'"
    >
      <router-link to="/profile" class="flex items-center w-full">
        <img 
          :src="userAvatarUrl" 
          alt="Avatar utilisateur" 
          class="h-10 w-10 rounded-full object-cover border"
          :class="isDarkMode ? 'border-gray-700' : 'border-gray-300'"
        />
        <div class="ml-3 overflow-hidden">
          <p class="text-sm font-medium truncate" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            {{ user ? `${user.firstName} ${user.lastName}` : 'Utilisateur' }}
          </p>
          <p class="text-xs truncate" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
            {{ user?.role === 'admin' ? 'Administrateur' : 'Utilisateur' }}
          </p>
        </div>
      </router-link>
    </div>
    <div 
      v-else 
      class="p-2 border-b flex items-center justify-center"
      :class="isDarkMode ? 'border-gray-800' : 'border-gray-200'"
    >
      <router-link to="/profile">
        <img 
          :src="userAvatarUrl" 
          alt="Avatar utilisateur" 
          class="h-10 w-10 rounded-full object-cover border"
          :class="isDarkMode ? 'border-gray-700' : 'border-gray-300'"
        />
      </router-link>
    </div>

    <!-- Menu principal -->
    <nav class="overflow-y-auto py-4 flex-grow">
      <ul class="space-y-1 px-3">
        <SidebarItem 
          v-for="item in filteredStandardMenuItems" 
          :key="item.name" 
          :item="item" 
          :is-dark="isDarkMode" 
          :is-collapsed="isSidebarCollapsed" 
        />
      </ul>

      <!-- Groupe Contrats -->
      <div v-if="filteredContractsMenuItems.length > 0" class="mt-4">
        <div v-if="!isSidebarCollapsed" class="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
             :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
          Contrats
        </div>
        <div v-else class="border-t my-2" :class="isDarkMode ? 'border-gray-800' : 'border-gray-200'"></div>
        <ul class="mt-1 space-y-1 px-3">
          <SidebarItem 
            v-for="item in filteredContractsMenuItems" 
            :key="item.name" 
            :item="item" 
            :is-dark="isDarkMode" 
            :is-collapsed="isSidebarCollapsed" 
          />
        </ul>
      </div>

      <!-- Groupe Administration (visible uniquement pour les administrateurs) -->
      <div v-if="filteredAdminMenuItems.length > 0" class="mt-4">
        <div v-if="!isSidebarCollapsed" class="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
             :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
          Administration
        </div>
        <div v-else class="border-t my-2" :class="isDarkMode ? 'border-gray-800' : 'border-gray-200'"></div>
        <ul class="mt-1 space-y-1 px-3">
          <SidebarItem 
            v-for="item in filteredAdminMenuItems" 
            :key="item.name" 
            :item="item" 
            :is-dark="isDarkMode" 
            :is-collapsed="isSidebarCollapsed" 
          />
        </ul>
      </div>
    </nav>

    <!-- Footer -->
  <div class="p-4 border-t text-xs flex items-center justify-center"
       :class="isDarkMode ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'">
    <span 
      :class="user?.role === 'admin' 
        ? (isDarkMode ? 'text-purple-400' : 'text-purple-600') 
        : (isDarkMode ? 'text-green-400' : 'text-green-600')"
    >
      {{ user?.role === 'admin' ? 'Administrateur' : 'Utilisateur' }}
    </span>
  </div>
  </aside>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores/theme';
import { useLayoutStore } from '@/stores/layoutStore';
import { useAuthStore } from '@/stores/auth';

import logo from '@/assets/logo/logo.svg';
import logoCollapsed from '@/assets/logo/logo-collapsed.svg';

import { 
  LucideChevronsLeft, 
  LucideChevronsRight,
  LucideLogOut
} from 'lucide-vue-next';

import SidebarItem from '@/components/layout/SidebarItem.vue';

// Router
const router = useRouter();

// Stores
const layoutStore = useLayoutStore();
const { isSidebarCollapsed } = storeToRefs(layoutStore);
const { toggleSidebarCollapsed } = layoutStore;

const themeStore = useThemeStore();
const { darkMode } = storeToRefs(themeStore);
const isDarkMode = darkMode;

const authStore = useAuthStore();
const { user, isAuthenticated } = storeToRefs(authStore);

// URL de l'avatar utilisateur
const userAvatarUrl = computed(() => {
  return user.value?.profilePicture || 'https://i.pravatar.cc/100?img=1';
});

// Obtenir les routes enfants du layout principal
const menuItems = computed(() => {
  return router.options.routes[0].children
    .filter(route => !route.path.includes(':') && !route.meta?.hidden) // Ne pas inclure les routes avec paramètres ou cachées
    .map(route => ({
      name: route.name,
      path: route.path,
      meta: route.meta
    }));
});

// Filtrer les éléments de menu selon le rôle de l'utilisateur
const hasAccess = (item) => {
  // Si la route nécessite un rôle spécifique
  if (item.meta?.requiredRole) {
    // Vérifier si l'utilisateur a le rôle requis
    return authStore.hasAccess(item.meta.requiredRole);
  }
  // Par défaut, autoriser l'accès
  return true;
};

// Séparer les éléments de menu par groupe et filtrer selon le rôle
const filteredStandardMenuItems = computed(() => {
  return menuItems.value
    .filter(item => !item.meta?.group && hasAccess(item));
});

const filteredContractsMenuItems = computed(() => {
  return menuItems.value
    .filter(item => item.meta?.group === 'Contrats' && hasAccess(item));
});

const filteredAdminMenuItems = computed(() => {
  return menuItems.value
    .filter(item => item.meta?.group === 'Administration' && hasAccess(item));
});


// Initialisation: vérifier l'authentification
onMounted(async () => {
  if (isAuthenticated.value && !user.value) {
    await authStore.getUserProfile();
  }
});

// Observer les changements d'authentification
watch(isAuthenticated, async (newValue) => {
  if (newValue && !user.value) {
    await authStore.getUserProfile();
  }
});
</script>
