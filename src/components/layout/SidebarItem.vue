<template>
    <router-link 
      :to="{ name: item.name }"
      class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
      :class="[
        isActive 
          ? isDark ? 'bg-blue-900 text-white' : 'bg-blue-50 text-blue-600'
          : isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      ]"
    >
      <component :is="getIconComponent(item.meta?.icon)" class="w-5 h-5" />
      <span v-if="!isCollapsed">{{ item.meta?.title }}</span>
    </router-link>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import {
    LucideLayoutDashboard,
    LucideSettings,
    LucideFileText,
    LucideBox,
    LucideBoxes,
    LucideFileStack,
    LucideFilePlus
  } from 'lucide-vue-next';
  
  const props = defineProps({
    item: Object,
    isDark: Boolean,
    isCollapsed: Boolean
  });
  
  const route = useRoute();
  
  const isActive = computed(() => route.name === props.item.name);
  
  const getIconComponent = (icon) => {
    const iconMap = {
      dashboard: LucideLayoutDashboard,
      contractCreate: LucideFilePlus,
      contractList:LucideFileStack,
      settings: LucideSettings,
      automation: LucideBox
    };
    return iconMap[icon] || LucideLayoutDashboard;
  };
  </script>
  