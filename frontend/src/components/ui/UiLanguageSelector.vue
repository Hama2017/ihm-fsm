<template>
    <div class="relative">
      <!-- Bouton du sélecteur de langue -->
      <button
        id="language-toggle"
        @click.stop="toggleDropdown"
        class="flex items-center p-2 rounded-lg transition-colors duration-200"
        :class="darkMode
          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'"
      >
        <span class="mr-1 text-sm font-medium">{{ getCurrentLanguageDisplay() }}</span>
        <LucideChevronDown class="w-4 h-4" :class="{ 'transform rotate-180': showDropdown }" />
      </button>
      
      <!-- Menu déroulant des langues -->
      <div
        v-if="showDropdown"
        id="language-dropdown"
        class="absolute right-0 mt-2 py-2 w-40 rounded-lg shadow-xl z-50 border transition-colors duration-300"
        :class="darkMode
          ? 'bg-gray-900 border-gray-700'
          : 'bg-white border-gray-200'"
        @click.stop
      >
        <button
          v-for="locale in safeLocales"
          :key="locale.code"
          @click="changeLanguage(locale.code)"
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          :class="currentLocale.value === locale.code
            ? 'font-medium text-blue-600 dark:text-blue-400'
            : 'text-gray-700 dark:text-gray-300'"
        >
          {{ locale.label }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
  import { useI18n } from '@/composables/i18n/useI18n';
  import { useThemeStore } from '@/stores/theme';
  import { storeToRefs } from 'pinia';
  import { LucideChevronDown } from 'lucide-vue-next';
  
  // Props et émissions
  const props = defineProps({
    // Option pour utiliser une version plus compacte du sélecteur
    compact: {
      type: Boolean,
      default: false
    }
  });
  
  // Theme store pour le style adaptatif
  const themeStore = useThemeStore();
  const { darkMode } = storeToRefs(themeStore);
  
  // I18n composable
  const { currentLocale, availableLocales, setLocale } = useI18n();
  
  // État du dropdown
  const showDropdown = ref(false);
  
  // Computed property for safely accessing availableLocales
  const safeLocales = computed(() => {
    try {
      return availableLocales.value || [
        { code: 'fr', label: 'Français' },
        { code: 'en', label: 'English' }
      ];
    } catch (e) {
      console.error('Error accessing availableLocales:', e);
      return [
        { code: 'fr', label: 'Français' },
        { code: 'en', label: 'English' }
      ];
    }
  });
  
  /**
   * Affiche ou masque le menu déroulant des langues
   */
  const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
  };
  
  /**
   * Change la langue de l'application
   * @param {string} locale - Code de la langue à utiliser
   */
  const changeLanguage = (locale) => {
    setLocale(locale);
    showDropdown.value = false;
  };
  
  /**
   * Obtient le nom de la langue courante pour l'affichage
   * @returns {string} Nom de la langue courante
   */
  const getCurrentLanguageDisplay = () => {
    try {
      // Make sure we have data to work with
      if (!currentLocale || !availableLocales) {
        return 'FR'; // Default fallback
      }
      
      if (props.compact) {
        // Version compacte: juste le code langue
        return currentLocale.value.toUpperCase();
      } else {
        // Version standard: cherche le label dans la liste des langues disponibles
        // Utiliser safeLocales pour la sécurité
        const locale = safeLocales.value.find(loc => loc.code === currentLocale.value);
        return locale ? locale.label : currentLocale.value.toUpperCase();
      }
    } catch (error) {
      console.error('Error in getCurrentLanguageDisplay:', error);
      return 'FR'; // Fallback in case of any error
    }
  };
  
  /**
   * Gère les clics en dehors du composant pour fermer le dropdown
   */
  const handleClickOutside = (event) => {
    const toggleElement = document.getElementById('language-toggle');
    const dropdownElement = document.getElementById('language-dropdown');
      
    if (showDropdown.value && 
        event.target !== toggleElement && 
        !toggleElement?.contains(event.target) && 
        event.target !== dropdownElement && 
        !dropdownElement?.contains(event.target)) {
      showDropdown.value = false;
    }
  };
  
  // Gestion des événements de clic
  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });
  
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
  });
  </script>