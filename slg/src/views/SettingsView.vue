<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Paramètres</h1>
    
    <div class="space-y-8">
      <!-- Section API Keys -->
      <ApiKeysSection v-if="isAdmin" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/AuthStore';
import { storeToRefs } from 'pinia';
import ApiKeysSection from '@/components/settings/ApiKeysSection.vue';

// Store
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// Vérifier si l'utilisateur est admin
const isAdmin = computed(() => {
  return user.value && user.value.role === 'admin';
});
</script>