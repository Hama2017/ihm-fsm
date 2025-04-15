<script setup>
import { ref } from 'vue';
import SvgIcon from '../ui/SvgIcon.vue';

defineProps({
  title: {
    type: String,
    default: 'Tableau de bord'
  }
});

defineEmits(['open-sidebar']);

const notificationsCount = ref(3);
</script>

<template>
  <header class="bg-secondary-800 border-b border-secondary-700 py-3 px-4 flex items-center justify-between">
    <!-- Bouton menu mobile -->
    <button 
      id="open-sidebar-btn"
      class="lg:hidden text-secondary-400 hover:text-white"
      @click="$emit('open-sidebar')"
      aria-label="Open menu"
    >
      <SvgIcon name="menu" />
    </button>
    
    <!-- Titre de la page -->
    <h1 class="text-xl font-semibold text-white lg:ml-0 ml-4">{{ title }}</h1>
    
    <!-- Actions header -->
    <div class="flex items-center space-x-4">
      <button class="text-secondary-400 hover:text-white transition-colors relative">
        <SvgIcon name="notification" />
        <span 
          v-if="notificationsCount > 0" 
          class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-danger text-white text-xs flex items-center justify-center"
        >
          {{ notificationsCount }}
        </span>
      </button>
      <div class="h-8 w-8 rounded-full bg-secondary-600 text-white flex items-center justify-center text-sm font-medium">
        AD
      </div>
    </div>
  </header>
</template>