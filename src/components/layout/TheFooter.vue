<template>
  <footer class="w-full border-t text-center text-sm py-4 px-6
                 bg-white text-gray-500 border-gray-200
                 dark:bg-gray-900 dark:text-white dark:border-gray-700">
    &copy; {{ currentYear }} Smart Legal Contract (SLC) - Tous droits réservés

    <p class="text-xs mt-2">
      Mode actuel : {{ darkMode ? '🌙 Sombre' : '☀️ Clair' }}
    </p>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../../stores/theme'
import { storeToRefs } from 'pinia'

const theme = useThemeStore()
const { darkMode } = storeToRefs(theme)

const currentYear = computed(() => new Date().getFullYear())
</script>
