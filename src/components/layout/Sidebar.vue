<script setup>
import { ref, computed } from 'vue';
import SvgIcon from '../ui/SvgIcon.vue';
import MenuItem from './MenuItem.vue';
import SubMenuItem from './SubMenuItem.vue';

// Définition des props
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  },
  isMobileOpen: {
    type: Boolean,
    default: false
  }
});

// Définition des émissions
const emit = defineEmits(['toggle-sidebar', 'close-sidebar']);

// Liste des items du menu
const menuItems = ref([
  {
    id: 'dashboard',
    title: 'Tableau de bord',
    icon: 'home',
    route: '/dashboard',
    isActive: true,
    hasSubmenu: false
  },
  {
    id: 'contracts',
    title: 'Smart Contracts',
    icon: 'document',
    hasSubmenu: true,
    isOpen: false,
    submenu: [
      { id: 'contract-list', title: 'Liste des contrats', route: '/contracts' },
      { id: 'contract-create', title: 'Créer un contrat', route: '/contracts/create' },
      { id: 'contract-interact', title: 'Interagir', route: '/contracts/interact' },
      { id: 'contract-audit', title: 'Audit de sécurité', route: '/contracts/audit' }
    ]
  },
  {
    id: 'automata',
    title: 'Automates',
    icon: 'puzzle',
    hasSubmenu: true,
    isOpen: false,
    submenu: [
      { id: 'automata-list', title: 'Liste des automates', route: '/automata' },
      { id: 'automata-create', title: 'Créer un automate', route: '/automata/create' },
      { id: 'automata-simulate', title: 'Simuler', route: '/automata/simulate' }
    ]
  },
  {
    id: 'transactions',
    title: 'Transactions',
    icon: 'arrows',
    hasSubmenu: true,
    isOpen: false,
    submenu: [
      { id: 'transactions-history', title: 'Historique', route: '/transactions/history' },
      { id: 'transactions-new', title: 'Nouvelle transaction', route: '/transactions/new' }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: 'chart',
    hasSubmenu: true,
    isOpen: false,
    submenu: [
      { id: 'analytics-dashboard', title: 'Tableau de bord', route: '/analytics' },
      { id: 'analytics-reports', title: 'Rapports', route: '/analytics/reports' }
    ]
  },
  {
    id: 'settings',
    title: 'Paramètres',
    icon: 'settings',
    route: '/settings',
    hasSubmenu: false
  }
]);

// Toggle submenu
const toggleSubmenu = (itemId) => {
  menuItems.value = menuItems.value.map(item => {
    if (item.id === itemId) {
      return { ...item, isOpen: !item.isOpen };
    }
    return item;
  });
};

// Classe dynamique pour le sidebar
const sidebarClasses = computed(() => {
  return [
    'sidebar bg-secondary-800 border-r border-secondary-700 h-full fixed lg:relative left-0 top-0 z-30 transition-all duration-300 transform-gpu custom-scrollbar',
    props.isCollapsed ? 'w-20' : 'w-64',
    props.isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
  ];
});
</script>

<template>
  <aside :class="sidebarClasses">
    <!-- Logo et Marque -->
    <div class="flex items-center justify-between p-4 border-b border-secondary-700">
      <div class="flex items-center" :class="isCollapsed ? 'justify-center w-full' : 'space-x-3'">
        <div class="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <SvgIcon name="lightning" size="sm" className="text-white" />
        </div>
        <span v-if="!isCollapsed" class="text-xl font-semibold text-white">FSM</span>
      </div>
      
      <div v-if="!isCollapsed" class="flex items-center">
        <!-- Bouton toggle sidebar -->
        <button 
          class="text-secondary-400 hover:text-white hidden lg:block"
          @click="$emit('toggle-sidebar')"
          aria-label="Toggle sidebar"
        >
          <SvgIcon :name="isCollapsed ? 'chevronRight' : 'chevronLeft'" />
        </button>
        
        <!-- Bouton fermeture mobile -->
        <button 
          class="lg:hidden text-secondary-400 hover:text-white"
          @click="$emit('close-sidebar')"
          aria-label="Close sidebar"
        >
          <SvgIcon name="close" />
        </button>
      </div>

      <!-- Bouton toggle sidebar quand il est replié -->
      <button 
        v-if="isCollapsed"
        class="text-secondary-400 hover:text-white hidden lg:block"
        @click="$emit('toggle-sidebar')"
        aria-label="Expand sidebar"
      >
        <SvgIcon name="chevronRight" />
      </button>
    </div>
    
    <!-- Profil utilisateur -->
    <div class="px-4 py-3">
      <div class="bg-secondary-700/50 rounded-lg p-3">
        <div class="flex items-center" :class="isCollapsed ? 'justify-center' : 'space-x-3'">
          <div class="h-10 w-10 rounded-full bg-secondary-600 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
            AD
          </div>
          <div v-if="!isCollapsed">
            <p class="text-sm text-white">Admin</p>
            <p class="text-xs text-secondary-400">admin@fsm.io</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Menu principal -->
    <div class="py-4 overflow-y-auto h-[calc(100%-170px)]">
      <ul class="space-y-1 px-3">
        <li v-for="item in menuItems" :key="item.id" class="menu-tooltip">
          <!-- Item de menu simple -->
          <MenuItem 
            v-if="!item.hasSubmenu" 
            :item="item" 
            :is-collapsed="isCollapsed" 
          />
          
          <!-- Item de menu avec sous-menu -->
          <template v-else>
            <button 
              type="button" 
              class="w-full px-3 py-2 rounded-lg text-secondary-400 hover:bg-secondary-700/50 hover:text-white transition-colors flex items-center justify-between"
              @click="toggleSubmenu(item.id)"
            >
              <div class="flex items-center" :class="isCollapsed ? 'justify-center w-full' : 'space-x-3'">
                <!-- Icône du menu -->
                <SvgIcon :name="item.icon" />
                <span v-if="!isCollapsed">{{ item.title }}</span>
              </div>
              
              <SvgIcon 
                v-if="!isCollapsed" 
                name="chevronDown"
                size="sm"
                :className="item.isOpen ? 'transform rotate-180 transition-transform' : 'transition-transform'"
              />
            </button>
            
            <!-- Tooltip pour le menu replié -->
            <span v-if="isCollapsed" class="tooltip-text">{{ item.title }}</span>
            
            <!-- Sous-menu -->
            <transition name="submenu">
              <ul 
                v-if="item.isOpen && !isCollapsed" 
                class="pl-10 mt-1 space-y-1 submenu-transition"
                :class="{ 'open': item.isOpen }"
              >
                <SubMenuItem 
                  v-for="subItem in item.submenu" 
                  :key="subItem.id" 
                  :item="subItem" 
                />
              </ul>
            </transition>
          </template>
        </li>
      </ul>
    </div>
    
    <!-- Statut du réseau -->
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-700">
      <div v-if="!isCollapsed" class="flex items-center justify-between text-xs">
        <div class="flex items-center">
          <div class="h-2 w-2 rounded-full bg-success mr-2"></div>
          <span class="text-success">Réseau actif</span>
        </div>
        <span class="text-secondary-400">Gas: 24 Gwei</span>
      </div>
      <div v-else class="flex justify-center">
        <div class="h-2 w-2 rounded-full bg-success"></div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.submenu-enter-active,
.submenu-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}
.submenu-enter-from,
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>