<script setup>
import { defineProps } from 'vue';
import SvgIcon from '../ui/SvgIcon.vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isCollapsed: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <router-link 
    :to="item.route" 
    class="group relative flex items-center px-3 py-2 rounded-lg transition-colors"
    :class="[
      item.isActive 
        ? 'menu-active' 
        : 'text-secondary-400 hover:bg-secondary-700/50 hover:text-white'
    ]"
  >
    <div class="flex items-center" :class="isCollapsed ? 'justify-center w-full' : 'space-x-3'">
      <SvgIcon :name="item.icon" />
      <span v-if="!isCollapsed">{{ item.title }}</span>
    </div>
    
    <!-- Tooltip pour le menu replié -->
    <span v-if="isCollapsed" class="tooltip-text">{{ item.title }}</span>
  </router-link>
</template>