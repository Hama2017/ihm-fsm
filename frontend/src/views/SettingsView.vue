<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Paramètres</h1>
        
    <div class="space-y-8">
      <!-- Section API Keys -->
      <ApiKeysSection v-if="isAdmin" />
      
      <!-- Message pour les utilisateurs non-admin -->
      <div v-else class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <p class="text-gray-600 dark:text-gray-400 text-center">
          Vous devez être administrateur pour accéder aux paramètres des API Keys.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/AuthStore';
import { useApiKeysStore } from '@/stores/ApiKeysStore';
import { storeToRefs } from 'pinia';
import ApiKeysSection from '@/components/settings/ApiKeysSection.vue';

// Stores
const authStore = useAuthStore();
const apiKeysStore = useApiKeysStore();
const { user } = storeToRefs(authStore);

// Vérifier si l'utilisateur est admin
const isAdmin = computed(() => {
  return user.value && user.value.role === 'admin';
});

// Charger les API keys au montage si l'utilisateur est admin
onMounted(async () => {
  if (isAdmin.value) {
    await apiKeysStore.fetchApiKeys();
  }
});
</script>