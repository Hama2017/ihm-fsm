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
   
  // Fonction pour obtenir les options de thème de base pour SweetAlert
  function getSwalThemeOptions() {
    return {
      background: darkMode.value ? colors.value.darkSidebarBg : colors.value.sidebarBg,
      color: darkMode.value ? colors.value.darkSidebarText : colors.value.sidebarText,
      confirmButtonColor: colors.value.primary,
      cancelButtonColor: colors.value.secondary
    };
  }

  // Nouvelle fonction pour obtenir les classes Tailwind pour SweetAlert2
  function getSwalCustomClasses() {
    return {
      // Conteneur global
      container: 'z-50',
      
      // Popup principal
      popup: `rounded-lg shadow-xl border border-gray-200 ${darkMode.value ? 'dark:border-gray-700 dark:bg-gray-800' : ''}`,
      
      // Section d'en-tête
      header: `border-b ${darkMode.value ? 'dark:border-gray-700' : 'border-gray-100'} pb-2`,
      
      // Titre du dialogue
      title: `text-lg font-semibold ${darkMode.value ? 'dark:text-white' : 'text-gray-900'}`,
      
      // Bouton de fermeture
      closeButton: `text-gray-400 hover:text-gray-600 ${darkMode.value ? 'dark:text-gray-500 dark:hover:text-gray-300' : ''} transition-colors`,
      
      // Icône
      icon: 'mx-auto mb-4',
      
      // Image
      image: 'rounded-md mx-auto mb-4',
      
      // Conteneur HTML
      htmlContainer: `${darkMode.value ? 'dark:text-gray-300' : 'text-gray-700'} my-3`,
      
      // Champ de saisie
      input: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-${colors.value.primary} focus:border-${colors.value.primary} text-sm ${
        darkMode.value ? 'dark:border-gray-600 dark:bg-gray-700 dark:text-white' : 'border-gray-300'
      }`,
      
      // Étiquette du champ
      inputLabel: `block text-sm font-medium mb-1 text-left ${darkMode.value ? 'dark:text-gray-300' : 'text-gray-700'}`,
      
      // Message de validation/erreur
      validationMessage: `py-2 px-3 my-2 rounded-md text-sm text-center font-medium ${
        darkMode.value 
          ? 'text-red-300 bg-red-900/50 border-red-800' 
          : 'text-red-700 bg-red-100 border-red-300'
      } border`,
      
      // Zone des boutons d'action
      actions: 'mt-5 sm:mt-6 flex space-x-2 justify-end',
      
      // Bouton de confirmation (OK, Ajouter, etc.)
      confirmButton: `inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
        darkMode.value 
          ? `bg-${colors.value.darkSidebarActiveBg} hover:bg-opacity-90 focus:ring-${colors.value.primary}` 
          : `bg-${colors.value.primary} hover:bg-opacity-90 focus:ring-${colors.value.primary}`
      }`,
      
      // Bouton refuser (si utilisé)
      denyButton: `inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
        darkMode.value 
          ? 'bg-red-700 hover:bg-red-800 focus:ring-red-500' 
          : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      }`,
      
      // Bouton annuler
      cancelButton: `inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
        darkMode.value 
          ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 focus:ring-gray-500' 
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-gray-500'
      }`,
      
      // Indicateur de chargement
      loader: darkMode.value ? 'text-gray-300' : 'text-gray-700',
      
      // Pied de page
      footer: `mt-2 text-xs text-center ${darkMode.value ? 'text-gray-400' : 'text-gray-500'}`,
      
      // Barre de progression du timer
      timerProgressBar: darkMode.value ? 'bg-blue-700' : 'bg-blue-600'
    };
  }

  // Fonction combinée pour obtenir toutes les options SweetAlert
  function getAllSwalOptions() {
    return {
      ...getSwalThemeOptions(),
      customClass: getSwalCustomClasses()
    };
  }
  

// Fonction pour obtenir les options SweetAlert pour les actions de suppression
function getDangerSwalOptions() {
  return {
    ...getSwalThemeOptions(),
    customClass: {
      ...getSwalCustomClasses(),
      confirmButton: 'inline-flex justify-center rounded-md px-4 py-2 bg-red-600 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800 transition-colors',
      icon: 'swal2-icon-show text-red-600 dark:text-red-500'
    },
    buttonsStyling: false
  };
}

// Fonction pour obtenir les options SweetAlert pour les sélections (dropdowns)
function getSelectSwalOptions() {
  const isDark = darkMode.value;
  
  return {
    ...getSwalThemeOptions(),
    customClass: getSwalCustomClasses(),
    didOpen: (popup) => {
      // Fonction qui va styliser les éléments select dans la popup
      const selects = popup.querySelectorAll('select');
      
      selects.forEach(select => {
        select.style.display = 'block';
        select.style.width = '100%';
        select.style.padding = '0.5rem 0.75rem';
        select.style.borderRadius = '0.375rem';
        select.style.fontSize = '0.875rem';
        select.style.lineHeight = '1.25rem';
        select.style.transition = 'all 150ms ease';
        
        if (isDark) {
          select.style.backgroundColor = '#374151'; // dark:bg-gray-700
          select.style.color = '#f3f4f6'; // dark:text-gray-100
          select.style.borderColor = '#4b5563'; // dark:border-gray-600
        } else {
          select.style.backgroundColor = '#ffffff'; // bg-white
          select.style.color = '#111827'; // text-gray-900
          select.style.borderColor = '#d1d5db'; // border-gray-300
        }
        
        // Styles au focus
        select.addEventListener('focus', () => {
          select.style.outline = 'none';
          select.style.boxShadow = `0 0 0 2px ${isDark ? '#93c5fd' : '#3b82f6'}20`; // ring-blue-500/20
          select.style.borderColor = isDark ? '#60a5fa' : '#3b82f6'; // focus:border-blue-500
        });
        
        // Styles au blur
        select.addEventListener('blur', () => {
          select.style.boxShadow = 'none';
          select.style.borderColor = isDark ? '#4b5563' : '#d1d5db';
        });
      });
    }
  };
}

// Exporter ces nouvelles fonctions
return {
  darkMode,
  colors,
  setDarkMode,
  setColor,
  updateCssVariables,
  resetColors,
  getSwalThemeOptions,
  getSwalCustomClasses,
  getAllSwalOptions,
  getDangerSwalOptions,
  getSelectSwalOptions
};
});