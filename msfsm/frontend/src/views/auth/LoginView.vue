<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-200px)]">
    <div class="w-full max-w-md px-8 py-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      
      <!-- Logo et titre -->
      <div class="text-center mb-6">
        <img src="@/assets/logo/logo.svg" alt="SLC Logo" class="h-20 mx-auto mb-4">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ t('auth.login.title') }}</h2>
      </div>

      <!-- Formulaire de connexion -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('auth.login.email') }}</label>
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
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('auth.login.password') }}</label>
            <div class="relative">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password" 
                required
                class="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                :placeholder="t('auth.login.password')"
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
            <span>{{ isLoading ? t('common.loading') : t('auth.login.submit') }}</span>
          </button>
        </div>
      </form>

      <!-- Lien vers l'inscription -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('auth.login.no_account') }}
          <router-link to="/auth/register" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            {{ t('auth.login.register') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import toast from '@/composables/Toast/useToast'
import { useI18n } from '@/composables/i18n/useI18n'
import { formatErrorCode } from '@/utils/errorFormatter'
import {
  LucideUser,
  LucideLock,
  LucideEye,
  LucideEyeOff,
  LucideLoader
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const errors = ref({
  email: '',
  password: ''
})

const resetErrors = () => {
  errors.value.email = ''
  errors.value.password = ''
  errorMessage.value = ''
}

const validateForm = () => {
  resetErrors()
  let isValid = true

  if (!email.value) {
    errors.value.email = t('errors.form.required')
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    errors.value.email = t('errors.form.email')
    isValid = false
  }

  if (!password.value) {
    errors.value.password = t('errors.form.required')
    isValid = false
  } else if (password.value.length < 6) {
    errors.value.password = t('errors.auth.password_too_weak')
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await authStore.login(email.value, password.value)
    if (result.success) {
      toast.success(t('auth.login.success'))
      router.push({ name: 'splash' })
    } else {
      // Formater le code d'erreur avant traduction
      const formattedCode = formatErrorCode(result.errorCode || result.code, 'auth')
      errorMessage.value = t(formattedCode)
    }
  } catch (error) {
    console.error('Erreur de connexion :', error)
    errorMessage.value = t('errors.general.internal_error')
  } finally {
    isLoading.value = false
  }
}
</script>