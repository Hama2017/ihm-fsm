<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{{ $t('profile.title') }}</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Colonne de gauche: Profil général -->
      <div class="md:col-span-2 space-y-6">
        <!-- Informations personnelles -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('profile.personalInfo') }}</h2>
            <button
              v-if="!isEditingProfile"
              @click="startEditingProfile"
              class="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <LucidePencil class="h-4 w-4 mr-1" />
              <span class="text-sm">{{ $t('profile.edit') }}</span>
            </button>
          </div>

          <!-- Mode affichage -->
          <div v-if="!isEditingProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('profile.firstName') }}</p>
                <p class="mt-1 text-gray-900 dark:text-white">{{ user.firstName }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('profile.lastName') }}</p>
                <p class="mt-1 text-gray-900 dark:text-white">{{ user.lastName }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('profile.email') }}</p>
                <p class="mt-1 text-gray-900 dark:text-white">{{ user.email }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('profile.createdAt') }}</p>
                <p class="mt-1 text-gray-900 dark:text-white">{{ formatDate(user.createdAt) }}</p>
              </div>
              <div v-if="user.role== 'admin'">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('profile.role') }}</p>
                <p class="mt-1">
                  <span
                    :class="user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'"
                    class="px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {{ user.role === 'admin' ? $t('profile.admin') : $t('profile.user') }}
                  </span>
                </p>
              </div>
           
            </div>
          </div>

          <!-- Mode édition -->
          <form v-else @submit.prevent="saveProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('profile.firstName') }}</label>
                <input 
                  type="text" 
                  id="firstName" 
                  v-model="editedUser.firstName" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('profile.lastName') }}</label>
                <input 
                  type="text" 
                  id="lastName" 
                  v-model="editedUser.lastName" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-4">
              <button 
                type="button"
                @click="cancelEditingProfile"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {{ $t('common.cancel') }}
              </button>
              <button 
                type="submit"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                :disabled="isLoading"
              >
                <LucideLoader v-if="isLoading" class="w-4 h-4 animate-spin mr-2 inline" />
                <span>{{ $t('common.save') }}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Changement de mot de passe -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('profile.security') }}</h2>
          </div>

          <div>
            <form @submit.prevent="changePassword" class="space-y-4">
              <h3 class="text-md font-medium text-gray-900 dark:text-white mb-3">{{ $t('profile.changePassword') }}</h3>
              
              <!-- Mot de passe actuel -->
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('profile.currentPassword') }}</label>
                <div class="relative">
                  <input 
                    :type="showPasswords.current ? 'text' : 'password'" 
                    id="currentPassword" 
                    v-model="passwordForm.currentPassword" 
                    required
                    class="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LucideLock class="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <button 
                    type="button"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    @click="showPasswords.current = !showPasswords.current"
                  >
                    <LucideEye v-if="showPasswords.current" class="h-5 w-5" />
                    <LucideEyeOff v-else class="h-5 w-5" />
                  </button>
                </div>
                <p v-if="passwordErrors.currentPassword" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ $t(`${passwordErrors.currentPassword}`) }}</p>
              </div>

              <!-- Nouveau mot de passe -->
              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('profile.newPassword') }}</label>
                <div class="relative">
                  <input 
                    :type="showPasswords.new ? 'text' : 'password'" 
                    id="newPassword" 
                    v-model="passwordForm.newPassword" 
                    required
                    class="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LucideLock class="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <button 
                    type="button"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    @click="showPasswords.new = !showPasswords.new"
                  >
                    <LucideEye v-if="showPasswords.new" class="h-5 w-5" />
                    <LucideEyeOff v-else class="h-5 w-5" />
                  </button>
                </div>
                <p v-if="passwordErrors.newPassword" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ $t(`${passwordErrors.newPassword}`) }}</p>
              </div>

              <!-- Confirmation du nouveau mot de passe -->
              <div>
                <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('profile.confirmPassword') }}</label>
                <div class="relative">
                  <input 
                    :type="showPasswords.confirm ? 'text' : 'password'" 
                    id="confirmNewPassword" 
                    v-model="passwordForm.confirmNewPassword" 
                    required
                    class="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LucideLock class="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <button 
                    type="button"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    @click="showPasswords.confirm = !showPasswords.confirm"
                  >
                    <LucideEye v-if="showPasswords.confirm" class="h-5 w-5" />
                    <LucideEyeOff v-else class="h-5 w-5" />
                  </button>
                </div>
                <p v-if="passwordErrors.confirmNewPassword" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ $t(`${passwordErrors.confirmNewPassword}`) }}</p>
              </div>

              <!-- Erreur générale -->
              <div v-if="passwordErrorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-3 rounded-md text-sm">
                {{ $t(`${passwordErrorMessage}`) }}
              </div>

              <div class="flex justify-end">
                <button 
                  type="submit"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  :disabled="isChangingPassword"
                >
                  <LucideLoader v-if="isChangingPassword" class="w-4 h-4 animate-spin mr-2 inline" />
                  <span>{{ $t('profile.updatePassword') }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Colonne de droite: Photo de profil et informations supplémentaires -->
      <div class="space-y-6">
        <!-- Photo de profil -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ $t('profile.profilePicture') }}</h2>
          
          <div class="flex flex-col items-center space-y-4">
            <div class="relative">
              <img 
  :src="tempProfilePicture ? tempProfilePicture.url : getProfilePictureUrl(user.profilePicture)" 
  :alt="$t('profile.profilePictureAlt')" 
  class="w-32 h-32 rounded-full object-cover border-2 transition-colors duration-300"
  :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'" 
/>

              <button
                class="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors duration-200"
                @click="openFileSelector"
              >
                <LucideCamera class="h-4 w-4" />
              </button>
              <input 
                type="file" 
                ref="fileInput" 
                accept="image/*" 
                class="hidden"
                @change="handleFileUpload" 
              />
            </div>
            
            <p class="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
              {{ $t('profile.supportedFormats') }}<br>
              {{ $t('profile.maxSize') }}
            </p>

            <div class="flex space-x-2">
              <button
                v-if="tempProfilePicture"
                @click="saveProfilePicture"
                class="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                :disabled="isUploadingPicture"
              >
                <LucideLoader v-if="isUploadingPicture" class="w-3 h-3 animate-spin mr-1 inline" />
                <span>{{ $t('common.save') }}</span>
              </button>
              <button
                v-if="tempProfilePicture"
                @click="cancelProfilePicture"
                class="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                v-if="user.profilePicture"
                @click="removeProfilePicture"
                class="px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors duration-200"
                :disabled="isUploadingPicture"
              >
                {{ $t('common.delete') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Préférences -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ $t('profile.preferences') }}</h2>
          
          <div class="space-y-3">
            <!-- Thème -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('profile.theme') }}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ $t('profile.chooseTheme') }}</p>
              </div>
              <div class="relative">
                <button 
                  @click="toggleDarkMode"
                  class="p-2 rounded transition-colors duration-200 border"
                  :class="isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200'"
                >
                  <LucideMoon v-if="!isDarkMode" class="w-5 h-5" />
                  <LucideSun v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Session active -->
            <div class="pt-4 mt-3 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">{{ $t('profile.activeSession') }}</h3>
              <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                    <LucideMonitor class="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('profile.currentDevice') }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ userDevice }}</p>
                  </div>
                </div>
                <button
                  @click="logout"
                  class="px-3 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors duration-200"
                >
                  {{ $t('profile.logout') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from '@/composables/i18n/useI18n'
import { useAuthStore } from '@/stores/AuthStore'
import { useProfileStore } from '@/stores/ProfileStore'
import toast from '@/composables/Toast/useToast'
import { formatErrorCode } from '@/utils/errorFormatter'
import {
  LucidePencil,
  LucideLock,
  LucideEye,
  LucideEyeOff,
  LucideLoader,
  LucideCamera,
  LucideMoon,
  LucideSun,
  LucideMonitor
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { getProfilePictureUrl } from '@/utils/imageUtils';

// Stores et composables
const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const { t, currentLocale, formatDate } = useI18n()

// Alias pour simplifier l'utilisation de la fonction de traduction dans le template
const $t = t

// État de l'utilisateur
const user = computed(() => authStore.user || {})
const editedUser = ref({
  firstName: '',
  lastName: ''
})

// État du formulaire de profil
const isEditingProfile = ref(false)
const isLoading = ref(false)

// État du formulaire de mot de passe
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})
const showPasswords = reactive({
  current: false,
  new: false,
  confirm: false
})
const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})
const passwordErrorMessage = ref('')
const isChangingPassword = ref(false)

// État de la photo de profil
const tempProfilePicture = ref(null)
const fileInput = ref(null)
const isUploadingPicture = ref(false)

// Détection du thème
const isDarkMode = computed(() => {
  return document.documentElement.classList.contains('dark')
})

// Détection du dispositif utilisateur
const userDevice = computed(() => {
  const userAgent = navigator.userAgent
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const browser = getBrowser(userAgent)
  
  return isMobile 
    ? `${browser} (${t('common.mobile')})` 
    : `${browser} (${t('common.desktop')})`
})

// Initialisation
onMounted(() => {
  if (!authStore.user) {
    router.push('/auth/login')
    return
  }
})

// === Fonctions de gestion du profil ===
function startEditingProfile() {
  editedUser.value = {
    firstName: user.value.firstName,
    lastName: user.value.lastName
  }
  isEditingProfile.value = true
}

function cancelEditingProfile() {
  isEditingProfile.value = false
}

async function saveProfile() {
  isLoading.value = true
  
  try {
    const result = await profileStore.updateProfile(editedUser.value)
    
    if (result.success) {
      isEditingProfile.value = false
      toast.success(t('auth.profile.update_success'))
    } else {
      const errorCode = formatErrorCode(result.errorCode || 'errors.general.update_failed', 'auth')
      toast.error(t(errorCode))
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    toast.error(t('errors.general.update_failed'))
  } finally {
    isLoading.value = false
  }
}

// === Fonctions de changement de mot de passe ===
function validatePasswordForm() {
  // Réinitialiser les erreurs
  passwordErrors.currentPassword = ''
  passwordErrors.newPassword = ''
  passwordErrors.confirmNewPassword = ''
  passwordErrorMessage.value = ''
  
  let isValid = true
  
  // Valider le mot de passe actuel
  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = 'errors.form.required'
    isValid = false
  }
  
  // Valider le nouveau mot de passe
  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = 'errors.form.required'
    isValid = false
  } else if (passwordForm.newPassword.length < 6) {
    passwordErrors.newPassword = 'errors.auth.password_too_weak'
    isValid = false
  }
  
  // Valider la confirmation du mot de passe
  if (!passwordForm.confirmNewPassword) {
    passwordErrors.confirmNewPassword = 'errors.form.required'
    isValid = false
  } else if (passwordForm.confirmNewPassword !== passwordForm.newPassword) {
    passwordErrors.confirmNewPassword = 'errors.form.password_match'
    isValid = false
  }
  
  return isValid
}

async function changePassword() {
  if (!validatePasswordForm()) return
  
  isChangingPassword.value = true
  
  try {
    const result = await profileStore.changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    )
    
    if (result.success) {
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmNewPassword = ''
      toast.success(t('auth.profile.password_change_success'))
    } else {
      // Gestion correcte des codes d'erreurs
      if (result.errorCode) {
        // Si l'API renvoie "auth.incorrect_current_password"
        if (result.errorCode.includes('.') && !result.errorCode.startsWith('errors.')) {
          passwordErrorMessage.value = `errors.${result.errorCode}`
        } 
        // Si l'API renvoie déjà "errors.auth.incorrect_current_password"
        else if (result.errorCode.startsWith('errors.')) {
          passwordErrorMessage.value = result.errorCode
        } 
        // Si l'API renvoie juste "incorrect_current_password"
        else {
          passwordErrorMessage.value = `errors.auth.${result.errorCode}`
        }
      } else {
        passwordErrorMessage.value = 'errors.auth.password_update_failed'
      }
      
      console.log('Erreur lors du changement de mot de passe:', result.errorCode)
    }
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error)
    passwordErrorMessage.value = 'errors.general.internal_error'
  } finally {
    isChangingPassword.value = false
  }
}

// === Fonctions de gestion de la photo de profil ===
function openFileSelector() {
  fileInput.value.click()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  // Vérifier le type de fichier
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    toast.error(t('errors.auth.invalid_file_format'))
    return
  }
  
  // Vérifier la taille du fichier (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    toast.error(t('errors.auth.file_too_large'))
    return
  }
  
  // Créer un objet contenant à la fois l'URL et le fichier
  tempProfilePicture.value = {
    url: URL.createObjectURL(file),
    file: file
  }
}

async function saveProfilePicture() {
  if (!tempProfilePicture.value || !tempProfilePicture.value.file) return
  
  isUploadingPicture.value = true
  
  try {
    const result = await profileStore.uploadProfilePicture(tempProfilePicture.value.file)
    
    if (result.success) {
      toast.success(t('common.success'))
      // Nettoyer l'URL temporaire
      URL.revokeObjectURL(tempProfilePicture.value.url)
      tempProfilePicture.value = null
    } else {
      // Gestion correcte des codes d'erreurs
      const errorMsg = result.errorCode || 'general.upload_failed'
      toast.error(t(errorMsg.startsWith('errors.') ? errorMsg : `errors.${errorMsg}`))
    }
  } catch (error) {
    console.error('Erreur lors de l\'upload de la photo de profil:', error)
    toast.error(t('errors.general.upload_failed'))
  } finally {
    isUploadingPicture.value = false
  }
}

function cancelProfilePicture() {
  if (tempProfilePicture.value) {
    URL.revokeObjectURL(tempProfilePicture.value.url)
    tempProfilePicture.value = null
  }
}

async function removeProfilePicture() {
  if (!user.value.profilePicture) return
  
  isUploadingPicture.value = true
  
  try {
    const result = await profileStore.deleteProfilePicture()
    
    if (result.success) {
      toast.success(t('common.success'))
    } else {
      // Gestion correcte des codes d'erreurs
      const errorCode = result.errorCode || 'general.delete_failed'
      toast.error(t(errorCode.startsWith('errors.') ? errorCode : `errors.${errorCode}`))
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo de profil:', error)
    toast.error(t('errors.general.delete_failed'))
  } finally {
    isUploadingPicture.value = false
  }
}

// === Fonctions de préférences ===
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark')
  // Sauvegarder la préférence dans localStorage
  const isDark = document.documentElement.classList.contains('dark')
  localStorage.setItem('darkMode', isDark ? 'true' : 'false')
}

// === Fonctions d'authentification ===
async function logout() {
  try {
    await authStore.logout()
    router.push('/auth/login')
    toast.success(t('auth.logout.success'))
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    toast.error(t('auth.logout.failed'))
  }
}

// === Fonctions utilitaires ===
function getBrowser(userAgent) {
  if (userAgent.indexOf('Firefox') > -1) {
    return 'Firefox'
  } else if (userAgent.indexOf('SamsungBrowser') > -1) {
    return 'Samsung Internet'
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    return 'Opera'
  } else if (userAgent.indexOf('Trident') > -1) {
    return 'Internet Explorer'
  } else if (userAgent.indexOf('Edge') > -1) {
    return 'Microsoft Edge'
  } else if (userAgent.indexOf('Chrome') > -1) {
    return 'Chrome'
  } else if (userAgent.indexOf('Safari') > -1) {
    return 'Safari'
  } else {
    return 'Unknown'
  }
}
</script>
