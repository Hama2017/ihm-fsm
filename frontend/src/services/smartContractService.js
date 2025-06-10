import apiClient from './api.config';

/**
 * Service de déploiement des contrats sur la blockchain.
 * Gère le déploiement des contrats et l'exécution des fonctions sur les contrats déployés.
 */
const smartContractService = {
  /**
   * Déploie un contrat sur la blockchain.
   * @param {Object} specificationModel - Spécification du contrat au format API
   * @returns {Promise<Object>} Résultat du déploiement
   * @throws {Error} Erreur en cas d'échec
   */
  async deployContract(specificationModel) {
    try {
      const response = await apiClient.post('/smart-contracts/deploy', specificationModel);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Exécute une fonction sur un contrat déployé.
   * @param {string} contractName - Nom du contrat
   * @param {string} clauseName - Nom de la clause (automaton)
   * @param {string} functionName - Nom de la fonction à exécuter
   * @param {Array} args - Arguments de la fonction (optionnel)
   * @returns {Promise<Object>} Résultat de l'exécution
   * @throws {Error} Erreur en cas d'échec
   */
  async executeContractFunction(contractName, clauseName, functionName, args = []) {
    try {
      const functionArgs = Array.isArray(args) ? args : [];
      
      const response = await apiClient.post(
        `/smart-contracts/${contractName}/clause/${clauseName}/function/${functionName}/execute`,
        { args: functionArgs }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère les informations d'un contrat déployé.
   * @param {string} contractName - Nom du contrat
   * @returns {Promise<Object>} Informations du contrat déployé
   * @throws {Error} Erreur en cas d'échec
   */
  async getDeployedContractInfo(contractName) {
    try {
      const response = await apiClient.get(`/smart-contracts/${contractName}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère tous les contrats déployés.
   * @returns {Promise<Array>} Liste des contrats déployés
   * @throws {Error} Erreur en cas d'échec
   */
  async getAllDeployedContracts() {
    try {
      const response = await apiClient.get('/smart-contracts/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Supprime un contrat déployé.
   * @param {string} contractName - Nom du contrat à supprimer
   * @returns {Promise<Object>} Résultat de la suppression
   * @throws {Error} Erreur en cas d'échec
   */
  async deleteDeployedContract(contractName) {
    try {
      const response = await apiClient.delete(`/smart-contracts/${contractName}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default smartContractService;