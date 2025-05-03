<template>
    <div class="flex items-center justify-center pt-8 pb-16">
      <div class="w-full max-w-lg px-8 py-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <!-- Logo et titre -->
        <div class="text-center mb-6">
          <img src="@/assets/logo/logo.svg" alt="SLC Logo" class="h-20 mx-auto mb-4">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Créer un compte</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Inscrivez-vous pour accéder à la plateforme</p>
        </div>
  
        <!-- Formulaire d'inscription -->
        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Nom et prénom sur la même ligne -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Prénom -->
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
              <input 
                type="text" 
                id="firstName" 
                v-model="formData.firstName" 
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Jean"
              >
              <p v-if="errors.firstName" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.firstName }}</p>
            </div>
  
            <!-- Nom -->
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
              <input 
                type="text" 
                id="lastName" 
                v-model="formData.lastName" 
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Dupont"
              >
              <p v-if="errors.lastName" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.lastName }}</p>
            </div>
          </div>
  
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div class="relative">
              <input 
                type="email" 
                id="email" 
                v-model="formData.email" 
                required
                class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="nom@exemple.com"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LucideMail class="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <p v-if="errors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.email }}</p>
          </div>
  
          <!-- Organisation -->
          <div>
            <label for="organization" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organisation (facultatif)</label>
            <div class="relative">
              <input 
                type="text" 
                id="organization" 
                v-model="formData.organization" 
                class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Société XYZ"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LucideBuilding class="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          </div>
  
          <!-- Mot de passe et confirmation sur la même ligne -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Mot de passe -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
              <div class="relative">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="password" 
                  v-model="formData.password" 
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
              <p v-if="errors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.password }}</p>
            </div>
  
            <!-- Confirmation mot de passe -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le mot de passe</label>
              <div class="relative">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="confirmPassword" 
                  v-model="formData.confirmPassword" 
                  required
                  class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="••••••••"
                >
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LucideLock class="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.confirmPassword }}</p>
            </div>
          </div>
  
          <!-- Conditions d'utilisation -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                v-model="formData.acceptTerms"
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              >
            </div>
            <div class="ml-3 text-sm">
              <label for="terms" class="font-medium text-gray-700 dark:text-gray-300">
                J'accepte les <a href="#" class="text-blue-600 dark:text-blue-400 hover:underline">conditions d'utilisation</a> et la <a href="#" class="text-blue-600 dark:text-blue-400 hover:underline">politique de confidentialité</a>
              </label>
              <p v-if="errors.acceptTerms" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.acceptTerms }}</p>
            </div>
          </div>
  
          <!-- Erreur générale -->
          <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-3 rounded-md text-sm">
            {{ errorMessage }}
          </div>
  
          <!-- Bouton d'inscription -->
          <div>
            <button 
              type="submit"
              class="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              :disabled="isLoading"
            >
              <LucideLoader v-if="isLoading" class="w-4 h-4 animate-spin mr-2" />
              <span>{{ isLoading ? 'Création du compte...' : 'Créer un compte' }}</span>
            </button>
          </div>
        </form>
  
        <!-- Lien vers la connexion -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Vous avez déjà un compte? 
            <router-link to="/auth/login" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Se connecter
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  import toast from '@/composables/Toast/useToast';
  import { 
    LucideMail, 
    LucideLock, 
    LucideEye, 
    LucideEyeOff,
    LucideBuilding,
    LucideLoader 
  } from 'lucide-vue-next';
  
  // Router
  const router = useRouter();
  
  // Auth store
  const authStore = useAuthStore();
  
  // État local
  const formData = reactive({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  const showPassword = ref(false);
  const isLoading = ref(false);
  const errorMessage = ref('');
  const errors = ref({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: ''
  });
  
  // Méthodes
  const validateForm = () => {
    let isValid = true;
    errors.value = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: ''
    };
  
    // Validation prénom
    if (!formData.firstName) {
      errors.value.firstName = 'Le prénom est requis';
      isValid = false;
    }
  
    // Validation nom
    if (!formData.lastName) {
      errors.value.lastName = 'Le nom est requis';
      isValid = false;
    }
  
    // Validation email
    if (!formData.email) {
      errors.value.email = 'L\'email est requis';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.value.email = 'Format d\'email invalide';
      isValid = false;
    }
  
    // Validation mot de passe
    if (!formData.password) {
      errors.value.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.value.password = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }
  
    // Validation confirmation mot de passe
    if (!formData.confirmPassword) {
      errors.value.confirmPassword = 'La confirmation du mot de passe est requise';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.value.confirmPassword = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }
  
    // Validation acceptation conditions
    if (!formData.acceptTerms) {
      errors.value.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
      isValid = false;
    }
  
    return isValid;
  };
  
  const handleRegister = async () => {
    if (!validateForm()) return;
  
    try {
      isLoading.value = true;
      errorMessage.value = '';
  
      // Simuler l'appel API (à remplacer par l'appel réel lorsque le backend sera prêt)
      const success = await authStore.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        organization: formData.organization,
        password: formData.password
      });
  
      if (success) {
        toast.success('Compte créé avec succès');
        // Redirection vers la page de connexion
        router.push({ name: 'login' });
      } else {
        errorMessage.value = 'Une erreur est survenue lors de la création du compte.';
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      if (error.message === 'EMAIL_EXISTS') {
        errorMessage.value = 'Cet email est déjà utilisé.';
      } else {
        errorMessage.value = 'Une erreur est survenue lors de la création du compte.';
      }
    } finally {
      isLoading.value = false;
    }
  };
  </script>