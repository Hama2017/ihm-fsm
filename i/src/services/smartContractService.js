import apiWrapper from './api.config';
import ErrorService from './errorService';
import { withMinDelay } from '@/utils/services/delayService';

// Durée minimale pour les opérations de déploiement (5 secondes pour une meilleure UX)
const MIN_DEPLOYMENT_DELAY = 5000;

/**
 * Service de déploiement des contrats sur la blockchain.
 * Gère le déploiement des contrats et l'exécution des fonctions sur les contrats déployés.
 */
const DeploymentService = {
  /**
   * Déploie un contrat sur la blockchain.
   * @param {Object} specificationModel - Spécification du contrat au format API
   * @returns {Promise<Object>} Résultat du déploiement avec statut et données
   */
  async deployContract(specificationModel) {
    try {
      // Valider le contrat transformé
      if (!specificationModel || !specificationModel.name || !specificationModel.automatons) {
        throw new Error('Format de contrat invalide');
      }

      // Appel à l'API avec délai minimum pour meilleure UX
      const response = await withMinDelay(
        apiWrapper.post('/smart-contracts/deploy', specificationModel),
        MIN_DEPLOYMENT_DELAY
      );

      return {
        success: true,
        data: response,
        message: 'Contrat déployé avec succès'
      };
    } catch (error) {
      const formattedError = ErrorService.handleApiError(
        error,
        'errors.contract.deployment_failed',
        true // Afficher le toast pour cette erreur critique
      );
      
      return {
        success: false,
        error: formattedError.message,
        code: formattedError.code,
        data: null
      };
    }
  },

  /**
   * Exécute une fonction sur un contrat déployé.
   * @param {string} contractName - Nom du contrat
   * @param {string} clauseName - Nom de la clause (automaton)
   * @param {string} functionName - Nom de la fonction à exécuter
   * @param {Array} args - Arguments de la fonction (optionnel)
   * @returns {Promise<Object>} Résultat de l'exécution
   */
  async executeContractFunction(contractName, clauseName, functionName, args = []) {
    try {
      // S'assurer que args est bien un tableau
      const functionArgs = Array.isArray(args) ? args : [];
      
      console.log(`Exécution de la fonction ${functionName} sur le contrat ${contractName}, clause ${clauseName}`);

      // Appel à l'API
      const response = await apiWrapper.post(
        `/smart-contracts/${contractName}/clause/${clauseName}/function/${functionName}/execute`,
        { args: functionArgs }
      );

      return {
        success: true,
        data: response,
        message: 'Fonction exécutée avec succès'
      };
    } catch (error) {
      const formattedError = ErrorService.handleApiError(
        error, 
        'errors.contract.execution_failed',
        true
      );
      
      return {
        success: false,
        error: formattedError.message,
        code: formattedError.code,
        data: null
      };
    }
  },

  /**
   * Récupère les informations d'un contrat déployé.
   * @param {string} contractName - Nom du contrat
   * @returns {Promise<Object>} Informations du contrat déployé
   */
  async getDeployedContractInfo(contractName) {
    try {
      const response = await apiWrapper.get(`/smart-contracts/${contractName}`);
      
      return {
        success: true,
        data: response,
        message: 'Informations du contrat récupérées avec succès'
      };
    } catch (error) {
      const formattedError = ErrorService.handleApiError(
        error, 
        'errors.contract.not_found',
        false
      );
      
      return {
        success: false,
        error: formattedError.message,
        code: formattedError.code,
        data: null
      };
    }
  },

  /**
   * Récupère tous les contrats déployés.
   * @returns {Promise<Object>} Liste des contrats déployés
   */
  async getAllDeployedContracts() {
    try {
      const response = await apiWrapper.get('/smart-contracts/');
      
      return {
        success: true,
        data: response,
        message: 'Liste des contrats récupérée avec succès'
      };
    } catch (error) {
      const formattedError = ErrorService.handleApiError(
        error, 
        'errors.general.get_failed',
        false
      );
      
      return {
        success: false,
        error: formattedError.message,
        code: formattedError.code,
        data: []
      };
    }
  },
  
  /**
   * Supprime un contrat déployé.
   * @param {string} contractName - Nom du contrat à supprimer
   * @returns {Promise<Object>} Résultat de la suppression
   */
  async deleteDeployedContract(contractName) {
    try {
      const response = await apiWrapper.delete(`/smart-contracts/${contractName}`);
      
      return {
        success: true,
        data: response,
        message: 'Contrat supprimé avec succès'
      };
    } catch (error) {
      const formattedError = ErrorService.handleApiError(
        error, 
        'errors.contract.delete_failed',
        true
      );
      
      return {
        success: false,
        error: formattedError.message,
        code: formattedError.code,
        data: null
      };
    }
  }
};

export default DeploymentService;