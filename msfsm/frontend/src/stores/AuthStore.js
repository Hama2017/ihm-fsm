import { defineStore } from 'pinia';
import authService from '@/services/authService';
import { extractErrorCode } from '@/utils/errorFormatter';

/**
 * Store Pinia pour la gestion de l'authentification.
 * Gère l'état de connexion, l'utilisateur courant, et les opérations d'authentification.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Indique si un utilisateur est authentifié.
     * @returns {boolean} true si un utilisateur est connecté
     */
    isAuthenticated: (state) => !!state.user,
    
    /**
     * Indique si l'utilisateur a des droits d'administration.
     * @returns {boolean} true si l'utilisateur est un administrateur
     */
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    /**
     * Connecte un utilisateur avec ses identifiants.
     * @param {string} email - Email de l'utilisateur
     * @param {string} password - Mot de passe
     * @returns {Promise<Object>} Résultat de la connexion avec code d'erreur si échec
     */
    async login(email, password) {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await authService.login(email, password);
        this.user = result.user;
        return { 
          success: true,
          data: result
        };
      } catch (error) {
        // Utiliser l'utilitaire pour extraire et formater le code d'erreur
        const errorCode = extractErrorCode(error, 'invalid_credentials', 'auth');
        this.error = errorCode;
        
        return { 
          success: false, 
          errorCode
        };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Inscrit un nouvel utilisateur.
     * @param {Object} userData - Données d'inscription
     * @returns {Promise<Object>} Résultat de l'inscription avec code d'erreur si échec
     */
    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await authService.register(userData);
        return { 
          success: true,
          data: result
        };
      } catch (error) {
        const errorCode = extractErrorCode(error, 'register_failed', 'auth');
        this.error = errorCode;
        
        return { 
          success: false, 
          errorCode
        };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Déconnecte l'utilisateur actuel.
     * @returns {Promise<Object>} Résultat de la déconnexion
     */
    async logout() {
      this.loading = true;
      this.error = null;
      
      try {
        await authService.logout();
        this.user = null;
        
        return { success: true };
      } catch (error) {
        const errorCode = extractErrorCode(error, 'logout_failed', 'auth');
        this.error = errorCode;
        
        return { 
          success: false, 
          errorCode
        };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Récupère les informations de l'utilisateur connecté.
     * @returns {Promise<Object>} Résultat avec les données utilisateur ou code d'erreur
     */
    async fetchUser() {
      this.loading = true;
      this.error = null;
    
      try {
        const userData = await authService.fetchCurrentUser();
        this.user = userData;
        return { 
          success: true, 
          data: userData
        };
      } catch (error) {
        this.user = null;
        const errorCode = extractErrorCode(error, 'user_not_found', 'auth');
        this.error = errorCode;
        
        return { 
          success: false, 
          errorCode
        };
      } finally {
        this.loading = false;
      }
    }
  }
});