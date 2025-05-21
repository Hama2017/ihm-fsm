<template>
  <div class="flex items-center justify-center pt-8 pb-16">
    <div class="w-full max-w-lg px-8 py-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">

      <!-- Logo et titre -->
      <div class="text-center mb-6">
        <img src="@/assets/logo/logo.svg" alt="SLC Logo" class="h-20 mx-auto mb-4">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ t('auth.register.title') }}</h2>
      </div>

      <!-- Formulaire d'inscription -->
      <form @submit.prevent="handleRegister" class="space-y-4">

        <!-- Prénom et Nom -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('auth.register.first_name') }}
            </label>
            <input type="text" id="firstName" v-model="formData.firstName" required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              :placeholder="t('auth.register.first_name')" />
            <p v-if="errors.firstName" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.firstName }}</p>
          </div>

          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('auth.register.last_name') }}
            </label>
            <input type="text" id="lastName" v-model="formData.lastName" required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              :placeholder="t('auth.register.last_name')" />
            <p v-if="errors.lastName" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.lastName }}</p>
          </div>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('auth.register.email') }}
          </label>
          <div class="relative">
            <input type="email" id="email" v-model="formData.email" required
              class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="nom@exemple.com" />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LucideMail class="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <p v-if="errors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.email }}</p>
        </div>

        <!-- Mot de passe et confirmation -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('auth.register.password') }}
            </label>
            <div class="relative">
              <input :type="showPassword ? 'text' : 'password'" id="password" v-model="formData.password" required
                class="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                :placeholder="t('auth.register.password')" />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LucideLock class="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <button type="button" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click="showPassword = !showPassword">
                <LucideEye v-if="showPassword" class="h-5 w-5" />
                <LucideEyeOff v-else class="h-5 w-5" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.password }}</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('auth.register.confirm_password') }}
            </label>
            <div class="relative">
              <input :type="showPassword ? 'text' : 'password'" id="confirmPassword" v-model="formData.confirmPassword" required
                class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                :placeholder="t('auth.register.confirm_password')" />
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
            <input id="terms" type="checkbox" v-model="formData.acceptTerms" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
          </div>
          <div class="ml-3 text-sm">
            <label for="terms" class="font-medium text-gray-700 dark:text-gray-300">
              {{ t('auth.register.terms') }}
            </label>
            <p v-if="errors.acceptTerms" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.acceptTerms }}</p>
          </div>
        </div>

        <!-- Erreur générale -->
        <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-3 rounded-md text-sm">
          {{ errorMessage }}
        </div>

        <!-- Bouton -->
        <div>
          <button type="submit"
            class="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            :disabled="isLoading">
            <LucideLoader v-if="isLoading" class="w-4 h-4 animate-spin mr-2" />
            <span>{{ isLoading ? t('common.loading') : t('auth.register.submit') }}</span>
          </button>
        </div>
      </form>

      <!-- Lien vers la connexion -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('auth.register.have_account') }}
          <router-link to="/auth/login" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            {{ t('auth.register.login') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import toast from '@/composables/Toast/useToast'
import { useI18n } from '@/composables/i18n/useI18n'
import { formatErrorCode } from '@/utils/errorFormatter'

import {
  LucideMail,
  LucideLock,
  LucideEye,
  LucideEyeOff,
  LucideLoader
} from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: ''
})

/**
 * Réinitialise les messages d'erreur
 */
function resetErrors() {
  for (const key in errors) {
    if (Object.hasOwn(errors, key)) {
      errors[key] = ''
    }
  }
  errorMessage.value = ''
}

/**
 * Valide le formulaire d'inscription
 * @returns {boolean} true si le formulaire est valide
 */
function validateForm() {
  resetErrors()
  let isValid = true

  // Validation du prénom
  if (!formData.firstName) {
    errors.firstName = t('errors.form.required')
    isValid = false
  }

  // Validation du nom
  if (!formData.lastName) {
    errors.lastName = t('errors.form.required')
    isValid = false
  }

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email) {
    errors.email = t('errors.form.required')
    isValid = false
  } else if (!emailRegex.test(formData.email)) {
    errors.email = t('errors.form.email')
    isValid = false
  }

  // Validation du mot de passe
  if (!formData.password) {
    errors.password = t('errors.form.required')
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = t('errors.form.min_length', { min: 6 })
    isValid = false
  }

  // Validation de la confirmation du mot de passe
  if (!formData.confirmPassword) {
    errors.confirmPassword = t('errors.form.required')
    isValid = false
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = t('errors.form.password_match')
    isValid = false
  }

  // Validation de l'acceptation des conditions
  if (!formData.acceptTerms) {
    errors.acceptTerms = t('errors.form.required')
    isValid = false
  }

  return isValid
}

/**
 * Gère la soumission du formulaire d'inscription
 */
async function handleRegister() {
  if (!validateForm()) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await authStore.register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password
    })

    if (result.success) {
      toast.success(t('auth.register.success'))
      // Rediriger vers la page de connexion avec l'email pré-rempli
      router.push({ 
        name: 'login',
        query: { email: formData.email }
      })
    } else {
      // Formater le code d'erreur avant traduction
      const formattedCode = formatErrorCode(result.errorCode || result.code, 'auth')
      errorMessage.value = t(formattedCode)
      
      // Si c'est une erreur d'email déjà utilisé, mettre l'erreur sur le champ email
      if (formattedCode === 'errors.auth.email_already_used') {
        errors.email = t(formattedCode)
      }
    }
  } catch (error) {
    console.error('Erreur d\'inscription :', error)
    errorMessage.value = t('errors.general.internal_error')
  } finally {
    isLoading.value = false
  }
}
</script>