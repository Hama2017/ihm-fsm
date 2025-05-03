<template>
    <div class="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div class="w-full max-w-md px-8 py-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <!-- Logo et titre -->
        <div class="text-center mb-6">
          <img src="@/assets/logo/logo.svg" alt="SLC Logo" class="h-20 mx-auto mb-4">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Mot de passe oublié</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Entrez votre email pour réinitialiser votre mot de passe</p>
        </div>
  
        <!-- Formulaire de récupération -->
        <form @submit.prevent="handleForgotPassword" class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div class="relative">
              <input 
                type="email" 
                id="email" 
                v-model="email" 
                required
                class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="nom@exemple.com"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LucideMail class="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <p v-if="emailError" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ emailError }}</p>
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
              <span>{{ isLoading ? 'Envoi en cours...' : 'Réinitialiser le mot de passe' }}</span>
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
  import { LucideMail, LucideLoader } from 'lucide-vue-next';
  import toast from '@/composables/Toast/useToast';
  
  // État local
  const email = ref('');
  const emailError = ref('');
  const errorMessage = ref('');
  const successMessage = ref('');
  const isLoading = ref(false);
  
  // Méthodes
  const handleForgotPassword = async () => {
    // Réinitialiser les erreurs
    emailError.value = '';
    errorMessage.value = '';
    successMessage.value = '';
  
    // Validation email
    if (!email.value) {
      emailError.value = 'L\'email est requis';
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      emailError.value = 'Format d\'email invalide';
      return;
    }
  
    try {
      isLoading.value = true;
  
      // Simuler l'envoi d'un email de réinitialisation (à remplacer par l'appel API réel)
      await new Promise(resolve => setTimeout(resolve, 1500));
  
      // Afficher un message de succès
      successMessage.value = 'Un email de réinitialisation de mot de passe a été envoyé à votre adresse email.';
      toast.success('Email de réinitialisation envoyé');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      errorMessage.value = 'Une erreur est survenue lors de l\'envoi de l\'email. Veuillez réessayer plus tard.';
    } finally {
      isLoading.value = false;
    }
  };
  </script>
  