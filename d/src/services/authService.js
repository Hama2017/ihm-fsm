import apiClient from './api.config.js';

export default {
  /**
   * Connexion de l'utilisateur.
   * @param {string} email - L'adresse email de l'utilisateur.
   * @param {string} password - Le mot de passe de l'utilisateur.
   * @returns {Promise<Object>} Données de l'utilisateur connecté.
   * @throws {Error} Si l'authentification échoue.
   */
  async login(email, password) {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data.user;
  },

  /**
   * Inscription d'un nouvel utilisateur.
   * @param {Object} payload - Données du formulaire d'inscription.
   * @param {string} payload.firstName
   * @param {string} payload.lastName
   * @param {string} payload.email
   * @param {string} payload.password
   * @returns {Promise<Object>} Données de l'utilisateur créé.
   * @throws {Error} Si l'inscription échoue (ex: email déjà utilisé).
   */
  async register(payload) {
    const res = await apiClient.post('/auth/register', payload);
    return res.data;
  },

  /**
   * Déconnexion de l'utilisateur.
   * @returns {Promise<void>}
   * @throws {Error} Si la requête échoue.
   */
  async logout() {
    await apiClient.post('/auth/logout');
  },

  /**
   * Récupère les données de l'utilisateur actuellement connecté.
   * @returns {Promise<Object>} Données de l'utilisateur.
   * @throws {Error} Si la récupération échoue ou si l'utilisateur n'est pas connecté.
   */
  async fetchCurrentUser() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  /**
   * Change le mot de passe de l'utilisateur connecté.
   * @param {string} oldPassword - Ancien mot de passe.
   * @param {string} newPassword - Nouveau mot de passe.
   * @returns {Promise<void>}
   * @throws {Error} Si le mot de passe est incorrect ou la mise à jour échoue.
   */
  async changePassword(oldPassword, newPassword) {
    await apiClient.post('/profile/change-password', {
      oldPassword,
      newPassword
    });
  },

  /**
   * Met à jour le profil de l'utilisateur connecté.
   * @param {Object} payload - Données à mettre à jour (ex: prénom, nom...).
   * @returns {Promise<Object>} Données de l'utilisateur mis à jour.
   * @throws {Error} Si la mise à jour échoue.
   */
  async updateProfile(payload) {
    const res = await apiClient.patch('/profile/', payload);
    return res.data;
  },


  /**
 * Rafraîchit le token d'accès en utilisant le refresh token.
 * @returns {Promise<{ accessToken: string, refreshToken: string }>} Nouveaux tokens.
 * @throws {Error} Si le refresh échoue.
 */
  async refreshToken() {
  const res = await apiClient.post('/auth/refresh');
  return res.data;
}

};
