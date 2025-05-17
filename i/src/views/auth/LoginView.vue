<template>
    <div class="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div class="w-full max-w-md px-8 py-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <!-- Logo et titre -->
        <div class="text-center mb-6">
          <img src="@/assets/logo/logo.svg" alt="SLC Logo" class="h-20 mx-auto mb-4">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Connexion</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Connectez-vous à votre compte</p>
        </div>
  
        <!-- Formulaire de connexion -->
        <form @submit.prevent="handleLogin" class="space-y-4">
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
                <LucideUser class="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <p v-if="errors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.email }}</p>
          </div>
  
          <!-- Mot de passe -->
          <div>
            <div class="relative">
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
              <div class="relative">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="password" 
                  v-model="password" 
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
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.password }}</p>
          </div>
  
          <!-- Erreur générale -->
          <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-3 rounded-md text-sm">
            {{ errorMessage }}
          </div>
  
          <!-- Boutons d'action -->
          <div>
            <button 
              type="submit"
              class="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              :disabled="isLoading"
            >
              <LucideLoader v-if="isLoading" class="w-4 h-4 animate-spin mr-2" />
              <span>{{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}</span>
            </button>
          </div>
        </form>
  
        <!-- Lien vers l'inscription -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Vous n'avez pas de compte? 
            <router-link to="/auth/register" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Créer un compte
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/AuthStore';
  import toast from '@/composables/Toast/useToast';
  import { getErrorMessage } from '@/utils/errorMapper.js';
  import { 
    LucideUser, 
    LucideLock, 
    LucideEye, 
    LucideEyeOff, 
    LucideLoader 
  } from 'lucide-vue-next';
  
  const router = useRouter();
  const authStore = useAuthStore();
  
  const email = ref('');
  const password = ref('');
  const showPassword = ref(false);
  const isLoading = ref(false);
  const errorMessage = ref('');
  const errors = ref({
    email: '',
    password: ''
  });
  
  const resetErrors = () => {
    for (const key in errors.value) {
      errors.value[key] = '';
    }
  };
  
  const validateForm = () => {
    resetErrors();
    let isValid = true;
  
    if (!email.value) {
      errors.value.email = "L'email est requis";
      isValid = false;
    } 
  
    if (!password.value) {
      errors.value.password = "Le mot de passe est requis";
      isValid = false;
    } 
  
    return isValid;
  };
  
  const handleLogin = async () => {
    if (!validateForm()) return;
    isLoading.value = true;
    errorMessage.value = '';
  
    try {
      const result = await authStore.login(email.value, password.value);
      console.log('Résultat de la connexion :', result);
      if (result.success) {
        toast.success('Connexion réussie');
        // Rediriger vers le splash screen
        router.push({ name: 'splash' });
      } else {
        errorMessage.value = getErrorMessage(result.code);
      }
    } catch (error) {
      console.error('Erreur de connexion :', error);
      errorMessage.value = "Une erreur technique est survenue.";
    } finally {
      isLoading.value = false;
    }
  };
  </script>
  
  