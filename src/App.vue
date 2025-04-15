<script setup>
import { ref } from 'vue';
import MainLayout from './layouts/MainLayout.vue';
import DashboardView from './views/DashboardView.vue';

// En attendant la configuration du routeur, nous utilisons une référence simple
const currentView = ref('dashboard');
</script>

<template>
  <MainLayout>
    <DashboardView v-if="currentView === 'dashboard'" />
  </MainLayout>
</template>