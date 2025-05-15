import apiClient from './api.config';

const apiKeysService = {
  /**
   * Récupère la liste de toutes les API keys
   * @returns {Promise} Promesse contenant la liste des API keys
   */
  getAllApiKeys() {
    return apiClient.get('/admin/api-keys/');
  },

  /**
   * Crée une nouvelle API key
   * @param {Object} apiKeyData - Données de l'API key à créer
   * @param {string} apiKeyData.app_name - Nom de l'application
   * @param {boolean} apiKeyData.active - Statut d'activation
   * @param {number|null} apiKeyData.usage_limit - Limite d'utilisation (optionnel)
   * @returns {Promise} Promesse contenant l'API key créée
   */
  createApiKey(apiKeyData) {
    return apiClient.post('/admin/api-keys/', apiKeyData);
  },

  /**
   * Met à jour une API key existante
   * @param {string} key - Clé API à mettre à jour
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise} Promesse contenant l'API key mise à jour
   */
  updateApiKey(key, updateData) {
    return apiClient.patch(`/admin/api-keys/${key}`, updateData);
  },

  /**
   * Désactive une API key
   * @param {string} key - Clé API à désactiver
   * @returns {Promise} Promesse contenant la confirmation
   */
  disableApiKey(key) {
    return apiClient.patch(`/admin/api-keys/${key}/disable`);
  },

  /**
   * Supprime une API key
   * @param {string} key - Clé API à supprimer
   * @returns {Promise} Promesse contenant la confirmation
   */
  deleteApiKey(key) {
    return apiClient.delete(`/admin/api-keys/${key}`);
  }
};

export default apiKeysService;