import apiClient from './api.config';

/**
 * Service d'authentification pour gérer la connexion, l'inscription et les sessions utilisateur.
 * Utilise des cookies HTTP-only pour la gestion de session côté client.
 */
const AuthService = {
  /**
   * Connecte un utilisateur avec ses identifiants.
   * Le serveur configurera automatiquement les cookies HTTP-only pour l'authentification.
   * 
   * @param {string} email - Adresse email de l'utilisateur
   * @param {string} password - Mot de passe de l'utilisateur
   * @returns {Promise<Object>} Données de l'utilisateur connecté
   * @throws {Error} Erreur en cas d'échec
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      // Simplement transmettre l'erreur d'API pour traitement par le store
      throw error;
    }
  },

  /**
   * Inscrit un nouvel utilisateur.
   * @param {Object} userData - Données du nouvel utilisateur
   * @param {string} userData.firstName - Prénom
   * @param {string} userData.lastName - Nom
   * @param {string} userData.email - Email
   * @param {string} userData.password - Mot de passe
   * @returns {Promise<Object>} Résultat de l'inscription
   * @throws {Error} Erreur en cas d'échec
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Déconnecte l'utilisateur actuel (supprime les cookies de session côté serveur).
   * @returns {Promise<Object>} Confirmation de déconnexion
   * @throws {Error} Erreur en cas d'échec
   */
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère les informations de l'utilisateur actuellement connecté.
   * Utilise le cookie HTTP-only pour l'authentification.
   * 
   * @returns {Promise<Object>} Données de l'utilisateur
   * @throws {Error} Erreur en cas d'échec
   */
  async fetchCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Rafraîchit le token d'authentification stocké dans les cookies HTTP-only.
   * @returns {Promise<Object>} Confirmation de rafraîchissement
   * @throws {Error} Erreur en cas d'échec
   */
  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default AuthService;