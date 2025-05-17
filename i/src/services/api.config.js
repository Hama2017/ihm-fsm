import axios from 'axios';
import authService from '@/services/authService';
import router from '@/router';
import { useAuthStore } from '@/stores/AuthStore';
import ErrorService from '@/services/errorService';

/**
 * Configuration de base d'Axios pour l'API
 * - Gestion automatique des erreurs
 * - Gestion du rafraîchissement des tokens
 * - Ajout automatique des en-têtes d'authentification
 */

// URL de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Création de l'instance Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Pour permettre l'envoi de cookies CSRF
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Ajout automatique de l'en-tête X-API-KEY
apiClient.interceptors.request.use(
  config => {
    // Ajouter la clé API à chaque requête
    config.headers['X-API-KEY'] = import.meta.env.VITE_API_KEY || 'sk_master_admin';
    
    // Ajouter le jeton d'authentification s'il existe
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    // En cas d'erreur lors de la préparation de la requête
    console.error('Erreur de préparation de la requête:', error);
    return Promise.reject(error);
  }
);

// Variables pour gérer le rafraîchissement du token
let isRefreshing = false;
let failedQueue = [];

// Liste des chemins qui ne nécessitent pas de rafraîchissement de token
const noNeedToRefresh = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
];

/**
 * Traite la file d'attente des requêtes ayant échoué
 * @param {Error} error - L'erreur à rejeter si le rafraîchissement a échoué
 * @param {string} token - Le nouveau token si le rafraîchissement a réussi
 */
function processQueue(error, token = null) {
  failedQueue.forEach(p => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
}

// Intercepteur pour gérer les erreurs et le rafraîchissement des tokens
apiClient.interceptors.response.use(
  // Pour les réponses réussies, simplement passer les données
  response => response,
  
  // Pour les erreurs, tenter de rafraîchir le token si nécessaire
  async error => {
    const originalRequest = error.config;
    
    // Si c'est une erreur 401 et que ce n'est pas une demande d'authentification
    if (
      error.response?.status === 401 &&
      !noNeedToRefresh.some(path => originalRequest.url.includes(path)) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      
      // Si un rafraîchissement est déjà en cours, mettre la requête en file d'attente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }
      
      isRefreshing = true;
      
      try {
        // Tenter de rafraîchir le token
        await authService.refreshToken();
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        processQueue(refreshError);
        
        try {
          const authStore = useAuthStore();
          authStore.user = null;
        } catch (e) {
          console.warn('authStore inaccessible, ignore.');
        }
        
        // Rediriger vers la page de connexion
        router.push({ name: 'login' });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Pour les autres erreurs, les laisser passer pour être traitées par les services
    return Promise.reject(error);
  }
);

/**
 * Wrapper pour les requêtes API avec gestion des erreurs intégrée
 */
export const apiWrapper = {
  /**
   * Envoie une requête GET
   * @param {string} url - URL relative à l'URL de base
   * @param {Object} config - Configuration Axios supplémentaire
   * @returns {Promise} - Promesse résolue avec les données ou rejetée avec l'erreur traitée
   */
  async get(url, config = {}) {
    try {
      const response = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      // Utiliser le service d'erreurs pour formater l'erreur mais sans afficher de toast
      const formattedError = ErrorService.handleApiError(error, 'errors.general.get_failed', false);
      // Rejeter avec l'erreur formatée
      return Promise.reject(formattedError);
    }
  },
  
  /**
   * Envoie une requête POST
   * @param {string} url - URL relative à l'URL de base
   * @param {Object} data - Données à envoyer dans le corps de la requête
   * @param {Object} config - Configuration Axios supplémentaire
   * @returns {Promise} - Promesse résolue avec les données ou rejetée avec l'erreur traitée
   */
  async post(url, data = {}, config = {}) {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      // Utiliser le service d'erreurs pour formater l'erreur mais sans afficher de toast
      const formattedError = ErrorService.handleApiError(error, 'errors.general.post_failed', false);
      // Rejeter avec l'erreur formatée
      return Promise.reject(formattedError);
    }
  },
  
  /**
   * Envoie une requête PUT
   * @param {string} url - URL relative à l'URL de base
   * @param {Object} data - Données à envoyer dans le corps de la requête
   * @param {Object} config - Configuration Axios supplémentaire
   * @returns {Promise} - Promesse résolue avec les données ou rejetée avec l'erreur traitée
   */
  async put(url, data = {}, config = {}) {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      // Utiliser le service d'erreurs pour formater l'erreur mais sans afficher de toast
      const formattedError = ErrorService.handleApiError(error, 'errors.general.update_failed', false);
      // Rejeter avec l'erreur formatée
      return Promise.reject(formattedError);
    }
  },
  
  /**
   * Envoie une requête PATCH
   * @param {string} url - URL relative à l'URL de base
   * @param {Object} data - Données à envoyer dans le corps de la requête
   * @param {Object} config - Configuration Axios supplémentaire
   * @returns {Promise} - Promesse résolue avec les données ou rejetée avec l'erreur traitée
   */
  async patch(url, data = {}, config = {}) {
    try {
      const response = await apiClient.patch(url, data, config);
      return response.data;
    } catch (error) {
      // Utiliser le service d'erreurs pour formater l'erreur mais sans afficher de toast
      const formattedError = ErrorService.handleApiError(error, 'errors.general.update_failed', false);
      // Rejeter avec l'erreur formatée
      return Promise.reject(formattedError);
    }
  },
  
  /**
   * Envoie une requête DELETE
   * @param {string} url - URL relative à l'URL de base
   * @param {Object} config - Configuration Axios supplémentaire
   * @returns {Promise} - Promesse résolue avec les données ou rejetée avec l'erreur traitée
   */
  async delete(url, config = {}) {
    try {
      const response = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      // Utiliser le service d'erreurs pour formater l'erreur mais sans afficher de toast
      const formattedError = ErrorService.handleApiError(error, 'errors.general.delete_failed', false);
      // Rejeter avec l'erreur formatée
      return Promise.reject(formattedError);
    }
  }
};

// Exporter à la fois l'instance Axios brute et le wrapper
export { apiClient };
export default apiWrapper;