<template>
    <footer class="w-full bg-white border-t border-gray-200 text-center text-sm text-gray-500 py-4 px-6">
      &copy; {{ currentYear }} FSM Web3 - Tous droits réservés
    </footer>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const currentYear = computed(() => new Date().getFullYear());
  </script>