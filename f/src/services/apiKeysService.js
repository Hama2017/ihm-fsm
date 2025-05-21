import apiWrapper from './api.config';
import ErrorService from './errorService';

/**
 * Service de gestion des clés API.
 * Permet la création, mise à jour, activation/désactivation et suppression des clés API.
 */
const ApiKeysService = {
  /**
   * Récupère toutes les clés API.
   * @returns {Promise<Array>} Liste des clés API
   * @throws {Error} Erreur formatée avec code internationalisation
   */
  async getAllApiKeys() {
    try {
      const response = await apiWrapper.get('/admin/api-keys/');
      return response;
    } catch (error) {
      throw ErrorService.handleApiError(error, 'errors.apikey.not_found', false);
    }
  },

  /**
   * Crée une nouvelle clé API.
   * @param {Object} apiKeyData - Données pour la nouvelle clé API
   * @param {string} apiKeyData.app_name - Nom de l'application utilisant la clé
   * @param {boolean} [apiKeyData.active=true] - État d'activation de la clé
   * @param {number|null} [apiKeyData.usage_limit=null] - Limite d'utilisation (null = illimité)
   * @returns {Promise<Object>} Clé API créée
   * @throws {Error} Erreur formatée avec code internationalisation
   */
  async createApiKey(apiKeyData) {
    try {
      const response = await apiWrapper.post('/admin/api-keys/', apiKeyData);
      return response;
    } catch (error) {
      throw ErrorService.handleApiError(error, 'errors.apikey.creation_failed', false);
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
   * @throws {Error} Erreur formatée avec code internationalisation
   */
  async updateApiKey(key, updateData) {
    try {
      const response = await apiWrapper.patch(`/admin/api-keys/${key}`, updateData);
      return response;
    } catch (error) {
      throw ErrorService.handleApiError(error, 'errors.apikey.update_failed', false);
    }
  },

  /**
   * Désactive une clé API.
   * @param {string} key - Valeur de la clé API à désactiver
   * @returns {Promise<Object>} Confirmation de désactivation
   * @throws {Error} Erreur formatée avec code internationalisation
   */
  async disableApiKey(key) {
    try {
      const response = await apiWrapper.patch(`/admin/api-keys/${key}/disable`);
      return response;
    } catch (error) {
      throw ErrorService.handleApiError(error, 'errors.apikey.update_failed', false);
    }
  },

  /**
   * Supprime une clé API.
   * @param {string} key - Valeur de la clé API à supprimer
   * @returns {Promise<Object>} Confirmation de suppression
   * @throws {Error} Erreur formatée avec code internationalisation
   */
  async deleteApiKey(key) {
    try {
      const response = await apiWrapper.delete(`/admin/api-keys/${key}`);
      return response;
    } catch (error) {
      throw ErrorService.handleApiError(error, 'errors.apikey.deletion_failed', false);
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