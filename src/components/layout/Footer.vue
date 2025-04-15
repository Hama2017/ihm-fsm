<script setup>
import { ref } from 'vue';

const appName = ref('FSM Dashboard');
const appVersion = ref('1.0');
const currentYear = ref(new Date().getFullYear());
</script>

<template>
  <footer class="bg-secondary-800 border-t border-secondary-700 py-3 px-6 text-center text-sm text-secondary-500">
    <p>{{ appName }} v{{ appVersion }} © {{ currentYear }} | Tous droits réservés</p>
  </footer>
</template>