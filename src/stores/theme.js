// src/stores/theme.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  // État initial, lire depuis localStorage ou préférer le dark mode du système
  const darkMode = ref((() => {
    const storedMode = localStorage.getItem('darkMode');
    if (storedMode !== null) {
      return JSON.parse(storedMode);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  })());
  
  // Couleurs personnalisables de l'application
  const colors = ref({
    // Couleurs de base
    primary: '#3B82F6', // blue-500
    secondary: '#6B7280', // gray-500
    success: '#10B981', // green-500
    danger: '#EF4444', // red-500
    warning: '#F59E0B', // amber-500
    info: '#3B82F6', // blue-500
    
    // Couleurs spécifiques au sidebar
    sidebarBg: '#FFFFFF',
    sidebarText: '#1F2937',
    sidebarActiveBg: '#EFF6FF',
    sidebarActiveText: '#3B82F6',
    
    // En mode sombre
    darkSidebarBg: '#111827',
    darkSidebarText: '#F9FAFB',
    darkSidebarActiveBg: '#1E3A8A',
    darkSidebarActiveText: '#FFFFFF',
  });
  
  function setDarkMode(value) {
    darkMode.value = value;
    
    // Persister le choix dans localStorage
    localStorage.setItem('darkMode', JSON.stringify(value));
    
    // Appliquer les classes dark au document
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  // Méthode pour personnaliser une couleur spécifique
  function setColor(colorKey, value) {
    if (colors.value[colorKey] !== undefined) {
      colors.value[colorKey] = value;
      
      // Mettre à jour les variables CSS pour appliquer immédiatement
      updateCssVariables();
    }
  }
  
  // Mettre à jour les variables CSS en fonction des couleurs actuelles
  function updateCssVariables() {
    const root = document.documentElement;
    
    // Appliquer chaque couleur comme variable CSS
    Object.entries(colors.value).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }
  
  // Réinitialiser les couleurs par défaut
  function resetColors() {
    colors.value = {
      primary: '#3B82F6',
      secondary: '#6B7280',
      success: '#10B981',
      danger: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
      sidebarBg: '#FFFFFF',
      sidebarText: '#1F2937',
      sidebarActiveBg: '#EFF6FF',
      sidebarActiveText: '#3B82F6',
      darkSidebarBg: '#111827',
      darkSidebarText: '#F9FAFB',
      darkSidebarActiveBg: '#1E3A8A',
      darkSidebarActiveText: '#FFFFFF',
    };
    
    updateCssVariables();
  }

  return {
    darkMode,
    colors,
    setDarkMode,
    setColor,
    updateCssVariables,
    resetColors
  };
});