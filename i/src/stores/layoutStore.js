import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLayoutStore = defineStore('layoutStore', () => {
  const isSidebarCollapsed = ref(false);

  function toggleSidebarCollapsed() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
  }

  function setSidebarCollapsed(val) {
    isSidebarCollapsed.value = val;
  }

  return {
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    setSidebarCollapsed
  };
});
