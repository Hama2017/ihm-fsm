import { defineStore } from 'pinia';
import apiKeysService from '@/services/apiKeysService';
import toast from '@/composables/Toast/useToast';

export const useApiKeysStore = defineStore('apiKeys', {
  state: () => ({
    apiKeys: [],
    isLoading: false,
    error: null,
    currentApiKey: null
  }),

  getters: {
    getApiKeyByKey: (state) => (key) => {
      return state.apiKeys.find(apiKey => apiKey.key === key);
    },
    activeApiKeys: (state) => {
      return state.apiKeys.filter(apiKey => apiKey.active);
    },
    inactiveApiKeys: (state) => {
      return state.apiKeys.filter(apiKey => !apiKey.active);
    }
  },

  actions: {
    /**
     * Charge toutes les API keys depuis le serveur
     */
    async fetchApiKeys() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await apiKeysService.getAllApiKeys();
        this.apiKeys = response; // Plus besoin de .data car le service retourne déjà response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Erreur lors du chargement des API keys';
        toast.error('Erreur lors du chargement des API keys');
        console.error('Erreur fetchApiKeys:', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Crée une nouvelle API key
     * @param {Object} apiKeyData - Données de l'API key
     */
    async createApiKey(apiKeyData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await apiKeysService.createApiKey(apiKeyData);
        this.apiKeys.push(response); // Plus besoin de .data
        this.currentApiKey = response;
        toast.success('API key créée avec succès');
        return response;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Erreur lors de la création de l\'API key';
        toast.error('Erreur lors de la création de l\'API key');
        console.error('Erreur createApiKey:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Met à jour une API key existante
     * @param {string} key - Clé API à mettre à jour
     * @param {Object} updateData - Données à mettre à jour
     */
    async updateApiKey(key, updateData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await apiKeysService.updateApiKey(key, updateData);
        const index = this.apiKeys.findIndex(apiKey => apiKey.key === key);
        
        if (index !== -1) {
          this.apiKeys[index] = response; // Plus besoin de .data
        }
        
        toast.success('API key mise à jour avec succès');
        return response;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Erreur lors de la mise à jour de l\'API key';
        toast.error('Erreur lors de la mise à jour de l\'API key');
        console.error('Erreur updateApiKey:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Désactive une API key
     * @param {string} key - Clé API à désactiver
     */
    async disableApiKey(key) {
      this.isLoading = true;
      this.error = null;
      
      try {
        await apiKeysService.disableApiKey(key);
        const index = this.apiKeys.findIndex(apiKey => apiKey.key === key);
        
        if (index !== -1) {
          this.apiKeys[index].active = false;
        }
        
        toast.success('API key désactivée avec succès');
      } catch (error) {
        this.error = error.response?.data?.detail || 'Erreur lors de la désactivation de l\'API key';
        toast.error('Erreur lors de la désactivation de l\'API key');
        console.error('Erreur disableApiKey:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Supprime une API key
     * @param {string} key - Clé API à supprimer
     */
    async deleteApiKey(key) {
      this.isLoading = true;
      this.error = null;
      
      try {
        await apiKeysService.deleteApiKey(key);
        this.apiKeys = this.apiKeys.filter(apiKey => apiKey.key !== key);
        toast.success('API key supprimée avec succès');
      } catch (error) {
        this.error = error.response?.data?.detail || 'Erreur lors de la suppression de l\'API key';
        toast.error('Erreur lors de la suppression de l\'API key');
        console.error('Erreur deleteApiKey:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
});