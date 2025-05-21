<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Barre supérieure avec logo, sélecteur de langue et thème -->
    <div class="flex justify-between items-center px-6 py-4">
      <div>
        <!-- Vous pouvez ajouter un logo ici si vous le souhaitez -->
      </div>

      <div class="flex items-center space-x-3">
        <!-- Sélecteur de langue (composant réutilisable) -->
        <LanguageSelector />

        <!-- Bouton de thème -->
        <button
          @click="toggleTheme"
          class="p-2 rounded-lg transition-colors duration-200"
          :class="darkMode
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'"
        >
          <LucideMoon v-if="!darkMode" class="w-5 h-5" />
          <LucideSun v-else class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="container mx-auto py-8">
      <router-view />
    </div>

    <!-- Footer simple -->
    <footer class="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
      &copy; {{ new Date().getFullYear() }} Smart Legal Contract - {{ t('footer.rights_reserved') }}
    </footer>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme';
import { storeToRefs } from 'pinia';
import { LucideSun, LucideMoon } from 'lucide-vue-next';
import { useI18n } from '@/composables/i18n/useI18n';
import LanguageSelector from '@/components/ui/UiLanguageSelector.vue';

const { t } = useI18n();

// Theme store
const themeStore = useThemeStore();
const { darkMode } = storeToRefs(themeStore);

/**
 * Bascule le mode sombre/clair
 */
const toggleTheme = () => {
  themeStore.setDarkMode(!darkMode.value);
};
</script>