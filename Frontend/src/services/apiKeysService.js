import apiClient from './api.config';

/**
 * Service de gestion des clés API.
 * Permet la création, mise à jour, activation/désactivation et suppression des clés API.
 */
const ApiKeysService = {
  /**
   * Récupère toutes les clés API.
   * @returns {Promise<Array>} Liste des clés API
   * @throws {Error} Erreur en cas d'échec
   */
  async getAllApiKeys() {
    try {
      const response = await apiClient.get('/admin/api-keys/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crée une nouvelle clé API.
   * @param {Object} apiKeyData - Données pour la nouvelle clé API
   * @param {string} apiKeyData.app_name - Nom de l'application utilisant la clé
   * @param {boolean} [apiKeyData.active=true] - État d'activation de la clé
   * @param {number|null} [apiKeyData.usage_limit=null] - Limite d'utilisation (null = illimité)
   * @returns {Promise<Object>} Clé API créée
   * @throws {Error} Erreur en cas d'échec
   */
  async createApiKey(apiKeyData) {
    try {
      const response = await apiClient.post('/admin/api-keys/', apiKeyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Met à jour une clé API existante.
   * @param {string} key - Valeur de la clé API à mettre à jour
   * @param {Object} updateData - Données à mettre à jour
   * @param {string} [updateData.app_name] - Nouveau nom de l'application (optionnel)
   * @param {boolean} [updateData.active] - Nouvel état d'activation (optionnel)
   * @param {number|null} [updateData.usage_limit] - Nouvelle limite d'utilisation (optionnel)
   * @returns {Promise<Object>} Clé API mise à jour
   * @throws {Error} Erreur en cas d'échec
   */
  async updateApiKey(key, updateData) {
    try {
      const response = await apiClient.patch(`/admin/api-keys/${key}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Désactive une clé API.
   * @param {string} key - Valeur de la clé API à désactiver
   * @returns {Promise<Object>} Confirmation de désactivation
   * @throws {Error} Erreur en cas d'échec
   */
  async disableApiKey(key) {
    try {
      const response = await apiClient.patch(`/admin/api-keys/${key}/disable`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Supprime une clé API.
   * @param {string} key - Valeur de la clé API à supprimer
   * @returns {Promise<Object>} Confirmation de suppression
   * @throws {Error} Erreur en cas d'échec
   */
  async deleteApiKey(key) {
    try {
      const response = await apiClient.delete(`/admin/api-keys/${key}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Copie une clé API dans le presse-papier.
   * @param {string} key - Valeur de la clé API à copier
   * @returns {boolean} Succès de l'opération de copie
   */
  copyApiKeyToClipboard(key) {
    try {
      // Utiliser l'API Clipboard pour la copie
      navigator.clipboard.writeText(key);
      return true;
    } catch (error) {
      console.error('Erreur lors de la copie dans le presse-papier:', error);
      return false;
    }
  }
};

export default ApiKeysService;