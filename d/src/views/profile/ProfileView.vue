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
                <p v-if="passwordErrors.currentPassword" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ $t(`errors.${passwordErrors.currentPassword}`) }}</p>
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
                <p v-if="passwordErrors.newPassword" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ $t(`errors.${passwordErrors.newPassword}`) }}</p>
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
                <p v-if="passwordErrors.confirmNewPassword" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ $t(`errors.${passwordErrors.confirmNewPassword}`) }}</p>
              </div>

              <!-- Erreur générale -->
              <div v-if="passwordErrorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-3 rounded-md text-sm">
                {{ $t(`errors.${passwordErrorMessage}`) }}
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
                :src="user.profilePicture || 'https://i.pravatar.cc/150?img=1'" 
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/AuthStore';
import { useThemeStore } from '@/stores/theme';
import { storeToRefs } from 'pinia';
import apiClient from '@/services/api.config';
import toast from '@/composables/Toast/useToast';
import { 
  LucidePencil, 
  LucideLock, 
  LucideEye, 
  LucideEyeOff,
  LucideLoader,
  LucideCamera,
  LucideSun,
  LucideMoon,
  LucideMonitor
} from 'lucide-vue-next';

// Composition d'erreurs correspondant aux codes d'erreur backend
const ERROR_KEYS = {
  'password_required': 'password_required',
  'password_too_short': 'password_too_short',
  'password_confirmation_required': 'password_confirmation_required',
  'passwords_not_match': 'passwords_not_match',
  'incorrect_current_password': 'incorrect_current_password',
  'password_update_failed': 'password_update_failed',
}

// Router
const router = useRouter();

// Stores
const authStore = useAuthStore();
const themeStore = useThemeStore();
const { darkMode } = storeToRefs(themeStore);
const isDarkMode = darkMode;

// État utilisateur
const user = ref({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  role: '',
  profilePicture: null,
  createdAt: new Date()
});

// États du formulaire
const isEditingProfile = ref(false);
const isLoading = ref(false);
const isChangingPassword = ref(false);
const isUploadingPicture = ref(false);
const fileInput = ref(null);
const tempProfilePicture = ref(null);

// Référence utilisateur édité
const editedUser = reactive({
  firstName: '',
  lastName: ''
});

// Formulaire changement mot de passe
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
});

const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
});

const passwordErrorMessage = ref('');

// Affichage des mots de passe
const showPasswords = reactive({
  current: false,
  new: false,
  confirm: false
});

// Informations de l'appareil
const userDevice = computed(() => {
  const browser = detectBrowser();
  const os = detectOS();
  return `${browser} sur ${os}`;
});

// Méthodes
const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Date inconnue';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
};

const detectBrowser = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Chrome") > -1) return "Chrome";
  if (userAgent.indexOf("Safari") > -1) return "Safari";
  if (userAgent.indexOf("Firefox") > -1) return "Firefox";
  if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) return "Internet Explorer";
  if (userAgent.indexOf("Edge") > -1) return "Edge";
  return "Navigateur inconnu";
};

const detectOS = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Windows") > -1) return "Windows";
  if (userAgent.indexOf("Mac") > -1) return "macOS";
  if (userAgent.indexOf("Linux") > -1) return "Linux";
  if (userAgent.indexOf("Android") > -1) return "Android";
  if (userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1) return "iOS";
  return "Système inconnu";
};

// Basculer le mode sombre
const toggleDarkMode = () => {
  themeStore.setDarkMode(!isDarkMode.value);
};

// Chargement des données utilisateur
const loadUserData = async () => {
  try {
    isLoading.value = true;
    
    // Récupération des données utilisateur
    const userData = authStore.user;
    
    if (userData) {
      user.value = { ...userData };
      
      // Si l'image de profil est stockée en base64, elle peut être utilisée directement
      if (user.value.profilePicture) {
        // Assurons-nous que c'est une chaîne base64 valide
        if (typeof user.value.profilePicture === 'string' && 
            (user.value.profilePicture.startsWith('data:image/') || 
             user.value.profilePicture.startsWith('/api/profiles/'))) {
          // On la laisse telle quelle
        } else {
          // On construit un chemin d'accès complet si nécessaire
          user.value.profilePicture = `${import.meta.env.VITE_API_URL || ''}/data/users/profile/${user.value.profilePicture}`;
        }
      }
    } else {
      await authStore.fetchUser();
      if (authStore.user) {
        user.value = { ...authStore.user };
        
        // Même traitement pour l'image de profil
        if (user.value.profilePicture && 
            !user.value.profilePicture.startsWith('data:image/') && 
            !user.value.profilePicture.startsWith('/api/profiles/')) {
          user.value.profilePicture = `${import.meta.env.VITE_API_URL || ''}/data/users/profile/${user.value.profilePicture}`;
        }
      } else {
        router.push({ name: 'login' });
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
    toast.error($t('errors.profile_load_failed'));
  } finally {
    isLoading.value = false;
  }
};

// Gestion du formulaire de profil
const startEditingProfile = () => {
  editedUser.firstName = user.value.firstName;
  editedUser.lastName = user.value.lastName;
  isEditingProfile.value = true;
};

const cancelEditingProfile = () => {
  isEditingProfile.value = false;
};

const saveProfile = async () => {
  try {
    isLoading.value = true;
    
    const result = await authStore.updateProfile({
      firstName: editedUser.firstName,
      lastName: editedUser.lastName
    });
    
    if (result.success) {
      user.value = {
        ...user.value,
        firstName: editedUser.firstName,
        lastName: editedUser.lastName
      };
      
      isEditingProfile.value = false;
      toast.success($t('success.profile_updated'));
    } else {
      toast.error($t(`errors.${result.code || 'profile_update_failed'}`));
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    toast.error($t('errors.profile_update_failed'));
  } finally {
    isLoading.value = false;
  }
};

// Gestion du changement de mot de passe
const validatePasswordForm = () => {
  let isValid = true;
  passwordErrors.currentPassword = '';
  passwordErrors.newPassword = '';
  passwordErrors.confirmNewPassword = '';
  passwordErrorMessage.value = '';

  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = ERROR_KEYS.password_required;
    isValid = false;
  }

  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = ERROR_KEYS.password_required;
    isValid = false;
  } else if (passwordForm.newPassword.length < 6) {
    passwordErrors.newPassword = ERROR_KEYS.password_too_short;
    isValid = false;
  }

  if (!passwordForm.confirmNewPassword) {
    passwordErrors.confirmNewPassword = ERROR_KEYS.password_confirmation_required;
    isValid = false;
  } else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    passwordErrors.confirmNewPassword = ERROR_KEYS.passwords_not_match;
    isValid = false;
  }

  return isValid;
};

const changePassword = async () => {
  if (!validatePasswordForm()) return;

  try {
    isChangingPassword.value = true;
    passwordErrorMessage.value = '';

    const result = await authStore.changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    );

    if (result.success) {
      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmNewPassword = '';
      toast.success($t('success.password_updated'));
    } else {
      passwordErrorMessage.value = result.code || ERROR_KEYS.password_update_failed;
    }
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    passwordErrorMessage.value = ERROR_KEYS.password_update_failed;
  } finally {
    isChangingPassword.value = false;
  }
};

// Gestion de la photo de profil
const openFileSelector = () => {
  fileInput.value.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 2 * 1024 * 1024; // 2 Mo

  if (!validTypes.includes(file.type)) {
    toast.error($t('errors.invalid_file_format'));
    return;
  }

  if (file.size > maxSize) {
    toast.error($t('errors.file_too_large'));
    return;
  }

  tempProfilePicture.value = URL.createObjectURL(file);
};

const saveProfilePicture = async () => {
  try {
    isUploadingPicture.value = true;
    
    const formData = new FormData();
    const file = fileInput.value.files[0];
    formData.append("file", file);

    const res = await apiClient.post("/auth/me/profile-picture", formData);
    
    if (res.data.filename) {
      user.value.profilePicture = `http://127.0.0.1/data/users/profile/${res.data.filename}`;
      tempProfilePicture.value = null;
      fileInput.value.value = '';
      toast.success($t('success.profile_picture_updated'));
    }
  } catch (error) {
    const code = error.response?.data?.detail?.code || 'profile_picture_update_failed';
    toast.error($t(`errors.${code}`));
  } finally {
    isUploadingPicture.value = false;
  }
};


const cancelProfilePicture = () => {
  tempProfilePicture.value = null;
  fileInput.value.value = '';
};

const removeProfilePicture = async () => {
  try {
    isUploadingPicture.value = true;
    
    // Utilisation de la méthode updateProfile pour supprimer la photo
    // En envoyant null ou une valeur spécifique indiquant la suppression

    await apiClient.delete("/auth/me/profile-picture");

    const result = await authStore.updateProfile({
      profilePicture: null  // Le backend doit interpréter null comme une demande de suppression
    });
    
    if (result.success) {
      user.value.profilePicture = null;
      toast.success($t('success.profile_picture_removed'));
    } else {
      toast.error($t(`errors.${result.code || 'profile_picture_remove_failed'}`));
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo:', error);
    toast.error($t('errors.profile_picture_remove_failed'));
  } finally {
    isUploadingPicture.value = false;
  }
};

// Déconnexion
const logout = async () => {
  try {
    await authStore.logout();
    router.push({ name: 'login' });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    toast.error($t('errors.logout_failed'));
  }
};

// Initialisation
onMounted(() => {
  loadUserData();
});

// Fonction d'aide pour l'internationalisation (temporaire)
// À remplacer par votre bibliothèque i18n réelle (vue-i18n)
const $t = (key) => {
  // Ce tableau peut être chargé depuis un fichier JSON pour chaque langue
  const translations = {
    'profile.title': 'Profil',
    'profile.personalInfo': 'Informations personnelles',
    'profile.edit': 'Modifier',
    'profile.firstName': 'Prénom',
    'profile.lastName': 'Nom',
    'profile.email': 'Email',
    'profile.role': 'Rôle',
    'profile.admin': 'Administrateur',
    'profile.user': 'Utilisateur',
    'profile.createdAt': 'Compte créé le',
    'profile.security': 'Sécurité',
    'profile.changePassword': 'Changer le mot de passe',
    'profile.currentPassword': 'Mot de passe actuel',
    'profile.newPassword': 'Nouveau mot de passe',
    'profile.confirmPassword': 'Confirmer le nouveau mot de passe',
    'profile.updatePassword': 'Mettre à jour le mot de passe',
    'profile.profilePicture': 'Photo de profil',
    'profile.profilePictureAlt': 'Photo de profil',
    'profile.supportedFormats': 'Formats supportés: JPG, PNG, GIF',
    'profile.maxSize': 'Taille maximale: 2 Mo',
    'profile.preferences': 'Préférences',
    'profile.theme': 'Thème',
    'profile.chooseTheme': 'Choisir le thème de l\'interface',
    'profile.activeSession': 'Session active',
    'profile.currentDevice': 'Votre appareil actuel',
    'profile.logout': 'Déconnexion',
    
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    
    'success.profile_updated': 'Profil mis à jour avec succès',
    'success.password_updated': 'Mot de passe mis à jour avec succès',
    'success.profile_picture_updated': 'Photo de profil mise à jour avec succès',
    'success.profile_picture_removed': 'Photo de profil supprimée avec succès',
    
    'errors.profile_load_failed': 'Erreur lors du chargement des données utilisateur',
    'errors.profile_update_failed': 'Erreur lors de la mise à jour du profil',
    'errors.password_required': 'Le mot de passe est requis',
    'errors.password_too_short': 'Le mot de passe doit contenir au moins 6 caractères',
    'errors.password_confirmation_required': 'La confirmation du mot de passe est requise',
    'errors.passwords_not_match': 'Les mots de passe ne correspondent pas',
    'errors.incorrect_current_password': 'Le mot de passe actuel est incorrect',
    'errors.password_update_failed': 'Erreur lors de la mise à jour du mot de passe',
    'errors.invalid_file_format': 'Format de fichier non supporté. Utilisez JPG, PNG ou GIF',
    'errors.file_too_large': 'Fichier trop volumineux. Taille maximale: 2 Mo',
    'errors.profile_picture_update_failed': 'Erreur lors de la mise à jour de la photo de profil',
    'errors.profile_picture_remove_failed': 'Erreur lors de la suppression de la photo de profil',
    'errors.logout_failed': 'Erreur lors de la déconnexion'
  };
  
  return translations[key] || key;
};

</script>