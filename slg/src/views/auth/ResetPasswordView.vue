<template>
    <div class="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div class="w-full max-w-md px-8 py-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <!-- Logo et titre -->
        <div class="text-center mb-6">
          <img src="@/assets/logo/logo.svg" alt="SLC Logo" class="h-20 mx-auto mb-4">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Réinitialiser votre mot de passe</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Créez un nouveau mot de passe sécurisé</p>
        </div>
  
        <!-- Formulaire de réinitialisation -->
        <form @submit.prevent="handleResetPassword" class="space-y-4">
          <!-- Nouveau mot de passe -->
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
            <div class="relative">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="newPassword" 
                v-model="newPassword" 
                required
                class="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="••••••••"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LucideLock class="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <button 
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                @click="showPassword = !showPassword"
              >
                <LucideEye v-if="showPassword" class="h-5 w-5" />
                <LucideEyeOff v-else class="h-5 w-5" />
              </button>
            </div>
            <p v-if="passwordError" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ passwordError }}</p>
          </div>
  
          <!-- Confirmer le nouveau mot de passe -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le mot de passe</label>
            <div class="relative">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                v-model="confirmPassword" 
                required
                class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="••••••••"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LucideLock class="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ confirmPasswordError }}</p>
          </div>
  
          <!-- Erreur générale -->
          <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-3 rounded-md text-sm">
            {{ errorMessage }}
          </div>
  
          <!-- Message de succès -->
          <div v-if="successMessage" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 p-3 rounded-md text-sm">
            {{ successMessage }}
          </div>
  
          <!-- Bouton d'envoi -->
          <div>
            <button 
              type="submit"
              class="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              :disabled="isLoading"
            >
              <LucideLoader v-if="isLoading" class="w-4 h-4 animate-spin mr-2" />
              <span>{{ isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe' }}</span>
            </button>
          </div>
        </form>
  
        <!-- Lien vers la connexion -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <router-link to="/auth/login" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Retour à la connexion
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { LucideLock, LucideEye, LucideEyeOff, LucideLoader } from 'lucide-vue-next';
  import toast from '@/composables/Toast/useToast';
  
  // Router
  const router = useRouter();
  const route = useRoute();
  
  // État local
  const newPassword = ref('');
  const confirmPassword = ref('');
  const showPassword = ref(false);
  const passwordError = ref('');
  const confirmPasswordError = ref('');
  const errorMessage = ref('');
  const successMessage = ref('');
  const isLoading = ref(false);
  
  // Récupérer le token depuis l'URL
  const token = route.query.token;
  
  // Vérifier la présence du token
  if (!token) {
    errorMessage.value = 'Token de réinitialisation invalide ou manquant.';
  }
  
  // Méthodes
  const validateForm = () => {
    let isValid = true;
    passwordError.value = '';
    confirmPasswordError.value = '';
    errorMessage.value = '';
  
    if (!newPassword.value) {
      passwordError.value = 'Le mot de passe est requis';
      isValid = false;
    } else if (newPassword.value.length < 6) {
      passwordError.value = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }
  
    if (!confirmPassword.value) {
      confirmPasswordError.value = 'La confirmation du mot de passe est requise';
      isValid = false;
    } else if (newPassword.value !== confirmPassword.value) {
      confirmPasswordError.value = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }
  
    return isValid;
  };
  
  const handleResetPassword = async () => {
  if (!validateForm()) return;

  try {
    isLoading.value = true;

    // Appel réel à l'API via le store
    await useAuthStore().resetPassword(token, newPassword.value);

    // Afficher un message de succès
    successMessage.value = 'Votre mot de passe a été réinitialisé avec succès.';
    toast.success('Mot de passe réinitialisé avec succès');

    // Rediriger vers la page de connexion après quelques secondes
    setTimeout(() => {
      router.push({ name: 'login' });
    }, 3000);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    errorMessage.value = 'Une erreur est survenue lors de la réinitialisation du mot de passe. Veuillez réessayer.';
  } finally {
    isLoading.value = false;
  }
};
  </script>