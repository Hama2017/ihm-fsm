import { inject } from 'vue';

export function useLayout() {
  const isSidebarCollapsed = inject('isSidebarCollapsed');
  const setSidebarCollapsed = inject('setSidebarCollapsed');
  const toggleSidebarCollapsed = inject('toggleSidebarCollapsed');

  return {
    isSidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebarCollapsed,
  };
}
