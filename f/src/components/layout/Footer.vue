<template>
  <footer class="w-full border-t text-center text-sm py-4 px-6
               bg-white text-gray-500 border-gray-200
               dark:bg-gray-900 dark:text-white dark:border-gray-700">
    &copy; {{ currentYear }} Smart Legal Contract (SLC) - {{ t('footer.rights_reserved') }}
    
    <p class="text-xs mt-2">
      {{ t('footer.current_mode') }}: {{ darkMode ? t('footer.dark_mode') : t('footer.light_mode') }}
    </p>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../../stores/theme'
import { storeToRefs } from 'pinia'
import { useI18n } from '@/composables/i18n/useI18n'

// Système de traduction
const { t } = useI18n()

// Theme store
const theme = useThemeStore()
const { darkMode } = storeToRefs(theme)

// Année courante pour le copyright
const currentYear = computed(() => new Date().getFullYear())
</script>