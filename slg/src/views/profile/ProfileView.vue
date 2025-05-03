<template>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Profil</h1>
  
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Colonne de gauche: Profil général -->
        <div class="md:col-span-2 space-y-6">
          <!-- Informations personnelles -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Informations personnelles</h2>
              <button
                v-if="!isEditingProfile"
                @click="startEditingProfile"
                class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center"
              >
                <LucidePencil class="h-4 w-4 mr-1" />
                <span class="text-sm">Modifier</span>
              </button>
            </div>
  
            <!-- Mode affichage -->
            <div v-if="!isEditingProfile" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Prénom</p>
                  <p class="mt-1 text-gray-900 dark:text-white">{{ user.firstName }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</p>
                  <p class="mt-1 text-gray-900 dark:text-white">{{ user.lastName }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <p class="mt-1 text-gray-900 dark:text-white">{{ user.email }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Organisation</p>
                  <p class="mt-1 text-gray-900 dark:text-white">{{ user.organization || '-' }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Rôle</p>
                  <p class="mt-1">
                    <span
                      :class="user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'"
                      class="px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {{ user.role === 'admin' ? 'Administrateur' : 'Utilisateur' }}
                    </span>
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Compte créé le</p>
                  <p class="mt-1 text-gray-900 dark:text-white">{{ formatDate(user.createdAt) }}</p>
                </div>
              </div>
            </div>
  
            <!-- Mode édition -->
            <form v-else @submit.prevent="saveProfile" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    v-model="editedUser.firstName" 
                    required
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    v-model="editedUser.lastName" 
                    required
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                </div>
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="editedUser.email" 
                    required
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                </div>
                <div>
                  <label for="organization" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organisation</label>
                  <input 
                    type="text" 
                    id="organization" 
                    v-model="editedUser.organization" 
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
                  Annuler
                </button>
                <button 
                  type="submit"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  :disabled="isLoading"
                >
                  <LucideLoader v-if="isLoading" class="w-4 h-4 animate-spin mr-2 inline" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
  
          <!-- Changement de mot de passe -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Sécurité</h2>
            </div>
  
            <div>
              <form @submit.prevent="changePassword" class="space-y-4">
                <h3 class="text-md font-medium text-gray-900 dark:text-white mb-3">Changer le mot de passe</h3>
                
                <!-- Mot de passe actuel -->
                <div>
                  <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe actuel</label>
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
                  <p v-if="passwordErrors.currentPassword" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ passwordErrors.currentPassword }}</p>
                </div>
  
                <!-- Nouveau mot de passe -->
                <div>
                  <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
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
                  <p v-if="passwordErrors.newPassword" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ passwordErrors.newPassword }}</p>
                </div>
  
                <!-- Confirmation du nouveau mot de passe -->
                <div>
                  <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le nouveau mot de passe</label>
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
                  <p v-if="passwordErrors.confirmNewPassword" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ passwordErrors.confirmNewPassword }}</p>
                </div>
  
                <!-- Erreur générale -->
                <div v-if="passwordErrorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-3 rounded-md text-sm">
                  {{ passwordErrorMessage }}
                </div>
  
                <div class="flex justify-end">
                  <button 
                    type="submit"
                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    :disabled="isChangingPassword"
                  >
                    <LucideLoader v-if="isChangingPassword" class="w-4 h-4 animate-spin mr-2 inline" />
                    <span>Mettre à jour le mot de passe</span>
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
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Photo de profil</h2>
            
            <div class="flex flex-col items-center space-y-4">
              <div class="relative">
                <img 
                  :src="user.profilePicture || 'https://i.pravatar.cc/150?img=1'" 
                  alt="Photo de profil" 
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
                Formats supportés: JPG, PNG, GIF<br>
                Taille maximale: 2 Mo
              </p>
  
              <div class="flex space-x-2">
                <button
                  v-if="tempProfilePicture"
                  @click="saveProfilePicture"
                  class="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                  :disabled="isUploadingPicture"
                >
                  <LucideLoader v-if="isUploadingPicture" class="w-3 h-3 animate-spin mr-1 inline" />
                  <span>Enregistrer</span>
                </button>
                <button
                  v-if="tempProfilePicture"
                  @click="cancelProfilePicture"
                  class="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  v-if="user.profilePicture"
                  @click="removeProfilePicture"
                  class="px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors duration-200"
                  :disabled="isUploadingPicture"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
  
          <!-- Préférences -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Préférences</h2>
            
            <div class="space-y-3">
              <!-- Thème -->
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">Thème</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Choisir le thème de l'interface</p>
                </div>
                <div class="relative">
                  <button 
                    @click="isDarkMode ? themeStore.setDarkMode(false) : themeStore.setDarkMode(true)"
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
  
              <!-- Notifications -->
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Recevoir des notifications par email</p>
                </div>
                <div class="relative">
                  <label class="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      v-model="notificationsEnabled"
                      class="sr-only peer" 
                      @change="updateNotificationsPreference"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
  
              <!-- Session active -->
              <div class="pt-4 mt-3 border-t border-gray-200 dark:border-gray-700">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Session active</h3>
                <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                      <LucideMonitor class="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">Votre appareil actuel</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ userDevice }}</p>
                    </div>
                  </div>
                  <button
                    @click="logout"
                    class="px-3 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors duration-200"
                  >
                    Déconnexion
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
  import { useAuthStore } from '@/stores/auth';
  import { useThemeStore } from '@/stores/theme';
  import { storeToRefs } from 'pinia';
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
    organization: '',
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
  const notificationsEnabled = ref(true);
  
  // Référence utilisateur édité
  const editedUser = reactive({
    firstName: '',
    lastName: '',
    email: '',
    organization: ''
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
  
  // Chargement des données utilisateur
  const loadUserData = async () => {
    try {
      isLoading.value = true;
      // Ici, appel à l'API pour récupérer les données utilisateur (à remplacer)
      // Simulons un chargement de données depuis le store d'authentification
      const userData = authStore.user;
      
      if (userData) {
        user.value = { ...userData };
      } else {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
        router.push({ name: 'login' });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      toast.error('Erreur lors du chargement des données utilisateur');
    } finally {
      isLoading.value = false;
    }
  };
  
  // Gestion du formulaire de profil
  const startEditingProfile = () => {
    // Copier les valeurs actuelles
    editedUser.firstName = user.value.firstName;
    editedUser.lastName = user.value.lastName;
    editedUser.email = user.value.email;
    editedUser.organization = user.value.organization || '';
    
    isEditingProfile.value = true;
  };
  
  const cancelEditingProfile = () => {
    isEditingProfile.value = false;
  };
  
  const saveProfile = async () => {
    try {
      isLoading.value = true;
      
      // Ici, appel à l'API pour mettre à jour le profil (à remplacer)
      // Simulons une mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour les informations locales
      user.value = {
        ...user.value,
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        email: editedUser.email,
        organization: editedUser.organization
      };
      
      // Mettre à jour le store d'authentification
      authStore.updateUserInfo(user.value);
      
      isEditingProfile.value = false;
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
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
      passwordErrors.currentPassword = 'Le mot de passe actuel est requis';
      isValid = false;
    }
  
    if (!passwordForm.newPassword) {
      passwordErrors.newPassword = 'Le nouveau mot de passe est requis';
      isValid = false;
    } else if (passwordForm.newPassword.length < 6) {
      passwordErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }
  
    if (!passwordForm.confirmNewPassword) {
      passwordErrors.confirmNewPassword = 'La confirmation du mot de passe est requise';
      isValid = false;
    } else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      passwordErrors.confirmNewPassword = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }
  
    return isValid;
  };
  
  const changePassword = async () => {
    if (!validatePasswordForm()) return;
  
    try {
      isChangingPassword.value = true;
      passwordErrorMessage.value = '';
  
      // Ici, appel à l'API pour changer le mot de passe (à remplacer)
      // Simuler un changement de mot de passe
      await new Promise(resolve => setTimeout(resolve, 1500));
  
      // Réinitialiser le formulaire
      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmNewPassword = '';
  
      toast.success('Mot de passe mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      passwordErrorMessage.value = 'Erreur lors du changement de mot de passe. Vérifiez que votre mot de passe actuel est correct.';
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
  
    // Vérifier le type et la taille du fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 2 Mo
  
    if (!validTypes.includes(file.type)) {
      toast.error('Format de fichier non supporté. Utilisez JPG, PNG ou GIF.');
      return;
    }
  
    if (file.size > maxSize) {
      toast.error('Fichier trop volumineux. Taille maximale: 2 Mo');
      return;
    }
  
    // Créer une URL temporaire pour l'aperçu
    tempProfilePicture.value = URL.createObjectURL(file);
  };
  
  const saveProfilePicture = async () => {
    try {
      isUploadingPicture.value = true;
  
      // Ici, appel à l'API pour télécharger la photo (à remplacer)
      // Simuler un téléchargement
      await new Promise(resolve => setTimeout(resolve, 1500));
  
      // Mettre à jour la photo de profil de l'utilisateur
      user.value.profilePicture = tempProfilePicture.value;
      
      // Mettre à jour le store d'authentification
      authStore.updateUserInfo(user.value);
  
      // Réinitialiser l'état temporaire
      tempProfilePicture.value = null;
      
      toast.success('Photo de profil mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement de la photo de profil:', error);
      toast.error('Erreur lors du téléchargement de la photo de profil');
    } finally {
      isUploadingPicture.value = false;
    }
  };
  
  const cancelProfilePicture = () => {
    tempProfilePicture.value = null;
    // Réinitialiser l'input file
    fileInput.value.value = '';
  };
  
  const removeProfilePicture = async () => {
    try {
      isUploadingPicture.value = true;
  
      // Ici, appel à l'API pour supprimer la photo (à remplacer)
      // Simuler une suppression
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // Supprimer la photo de profil de l'utilisateur
      user.value.profilePicture = null;
      
      // Mettre à jour le store d'authentification
      authStore.updateUserInfo(user.value);
      
      toast.success('Photo de profil supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la photo de profil:', error);
      toast.error('Erreur lors de la suppression de la photo de profil');
    } finally {
      isUploadingPicture.value = false;
    }
  };
  
  // Gestion des préférences
  const updateNotificationsPreference = async () => {
    try {
      // Ici, appel à l'API pour mettre à jour les préférences de notification (à remplacer)
      // Simuler une mise à jour
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Préférences de notification mises à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      toast.error('Erreur lors de la mise à jour des préférences');
      // Rétablir la valeur précédente en cas d'erreur
      notificationsEnabled.value = !notificationsEnabled.value;
    }
  };
  
  // Déconnexion
  const logout = async () => {
    try {
      await authStore.logout();
      router.push({ name: 'login' });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };
  
  // Initialisation
  onMounted(() => {
    loadUserData();
  });
  </script>