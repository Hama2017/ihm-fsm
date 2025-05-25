import axios from 'axios';
import router from '@/router';
import {API_BASE_URL} from '@/config/config';

/**
 * Configuration de base d'Axios pour l'API
 * - Gestion des erreurs
 * - Gestion du rafraîchissement des tokens
 * - Support des cookies HTTP-only pour l'authentification
 */


// Création de l'instance Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // IMPORTANT: Permet l'envoi et la réception de cookies HTTP-only
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Ajout automatique de l'en-tête X-API-KEY
apiClient.interceptors.request.use(
  config => {
    // Ajouter la clé API à chaque requête
    config.headers['X-API-KEY'] = import.meta.env.VITE_API_KEY || 'pk_master_admin';
    
    // Pas besoin d'ajouter manuellement le token d'authentification
    // Les cookies HTTP-only sont automatiquement envoyés par le navigateur
    
    return config;
  },
  error => {
    // En cas d'erreur lors de la préparation de la requête
    console.error('Erreur de préparation de la requête:', error);
    return Promise.reject(error);
  }
);

// Variables pour gérer la file d'attente des requêtes
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
 * @param {boolean} success - Indique si le rafraîchissement a réussi
 */
function processQueue(error, success = false) {
  failedQueue.forEach(p => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve();
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
        // Tenter de rafraîchir le token via les cookies HTTP-only
        await apiClient.post('/auth/refresh');
        
        // Le cookie est automatiquement mis à jour par le serveur
        processQueue(null, true);
        
        // Réexécuter la requête originale maintenant que le cookie est rafraîchi
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        processQueue(refreshError);
        
        // Rediriger vers la page de connexion
        router.push({ 
          name: 'login',
          query: { redirect: router.currentRoute.value.fullPath }
        });
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Pour les autres erreurs, les laisser passer pour être traitées par les services
    return Promise.reject(error);
  }
);

export default apiClient;