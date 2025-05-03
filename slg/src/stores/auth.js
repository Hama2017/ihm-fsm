import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AuthService } from '@/services/auth';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  // État
  const user = ref(null);
  const token = ref(localStorage.getItem('auth_token') || null);
  const isLoading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const userRole = computed(() => user.value?.role || 'guest');

  // Actions
  async function init() {
    if (token.value) {
      try {
        isLoading.value = true;
        await getUserProfile();
      } catch (error) {
        console.error('Erreur d\'initialisation du store auth:', error);
        logout();
      } finally {
        isLoading.value = false;
      }
    }
  }

  async function login(email, password, rememberMe = false) {
    try {
      isLoading.value = true;
      
      // Appel à l'API de login (à remplacer par l'appel réel)
      const response = await AuthService.login(email, password);
      
      if (response && response.token) {
        // Stocker le token dans le localStorage ou sessionStorage selon rememberMe
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('auth_token', response.token);
        token.value = response.token;
  
        // Directement stocker les informations de l'utilisateur
        if (response.user) {
          user.value = response.user;
        } else {
          // Si les informations ne sont pas renvoyées avec le token, les récupérer
          await getUserProfile();
        }
  
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  async function register(userData) {
    try {
      isLoading.value = true;
      
      // Appel à l'API d'inscription (à remplacer par l'appel réel)
      const response = await AuthService.register(userData);
      
      return !!response;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function getUserProfile() {
    try {
      if (!token.value) return null;
      
      // Appel à l'API pour récupérer le profil (à remplacer par l'appel réel)
      const userProfile = await AuthService.getProfile();
      
      if (userProfile) {
        user.value = userProfile;
        return userProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  }

  async function updateUserInfo(updatedUser) {
    try {
      isLoading.value = true;
      
      // Appel à l'API pour mettre à jour le profil (à remplacer par l'appel réel)
      const response = await AuthService.updateProfile(updatedUser);
      
      if (response) {
        user.value = { ...user.value, ...updatedUser };
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    try {
      // Optionnel: appel à l'API pour invalider le token côté serveur
      await AuthService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Supprimer le token du localStorage et sessionStorage
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      
      // Réinitialiser l'état
      token.value = null;
      user.value = null;
      
      // Rediriger vers la page de connexion
      if (router.currentRoute.value.meta.requiresAuth) {
        router.push({ name: 'login' });
      }
    }
  }

  // Vérifier si l'utilisateur a un accès spécifique
  function hasAccess(requiredRole) {
    if (!user.value) return false;
    if (user.value.role === 'admin') return true; // Les admins ont accès à tout
    return user.value.role === requiredRole;
  }

  return {
    // État
    user,
    token,
    isLoading,
    
    // Getters
    isAuthenticated,
    isAdmin,
    userRole,
    
    // Actions
    init,
    login,
    register,
    getUserProfile,
    updateUserInfo,
    logout,
    hasAccess
  };
});