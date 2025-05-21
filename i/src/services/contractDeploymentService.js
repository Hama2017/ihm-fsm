import apiClient from './api.config';
import { withMinDelay } from '@/utils/services/delayService';

// Durée minimale pour les opérations de déploiement (5 secondes)
const MIN_DEPLOYMENT_DELAY = 5000;

/**
 * Service pour gérer le déploiement des contrats via l'API
 */
const ContractDeploymentService = {
  /**
   * Déploie un contrat transformé au format requis par l'API
   * @param {Object} transformedContract - Contrat au format de l'API
   * @returns {Promise} - Promesse contenant les informations des smart contracts déployés
   */
  async deployContract(transformedContract) {
    try {
      // Ajout du header auth en utilisant le système de simulation
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const headers = token ? { 'x-user-id': token } : {};
      
      // Valider le contrat transformé
      if (!transformedContract || !transformedContract.name || !transformedContract.automatons) {
        throw new Error('Format de contrat invalide');
      }

      // Appel à l'API avec délai minimum et headers auth
      const response = await withMinDelay(
        apiClient.post('/smart-contracts/deploy', transformedContract, { headers }),
        MIN_DEPLOYMENT_DELAY
      );

      return {
        success: true,
        data: response.data,
        message: 'Contrat déployé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors du déploiement du contrat:', error);
      
      // Construire un message d'erreur détaillé
      let errorMessage = 'Erreur lors du déploiement du contrat';
      
      if (error.response) {
        // L'API a répondu avec un statut d'erreur
        errorMessage = `Erreur ${error.response.status}: ${error.response.data.detail || error.response.statusText}`;
      } else if (error.request) {
        // La requête a été envoyée mais n'a pas reçu de réponse
        errorMessage = 'Aucune réponse du serveur, veuillez vérifier la connexion';
      } else {
        // Erreur lors de la configuration de la requête
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },

  /**
   * Exécute une fonction sur un contrat déployé
   * @param {string} contractName - Nom du contrat
   * @param {string} clauseName - Nom de la clause (automaton)
   * @param {string} functionName - Nom de la fonction à exécuter
   * @param {Array} args - Arguments de la fonction
   * @returns {Promise} - Promesse contenant le résultat de l'exécution
   */
  async executeContractFunction(contractName, clauseName, functionName, args = []) {
    try {
      // Ajout du header auth en utilisant le système de simulation
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const headers = token ? { 'x-user-id': token } : {};
      
      console.log(`Exécution de la fonction ${functionName} sur le contrat ${contractName}, clause ${clauseName}`);
  
      // S'assurer que args est bien un tableau
      const functionArgs = Array.isArray(args) ? args : [];
  
      // Appel à l'API avec les headers d'auth
      const response = await apiClient.post(
        `/smart-contracts/${contractName}/clause/${clauseName}/function/${functionName}/execute`,
        { args: functionArgs },
        { headers }
      );
  
      console.log("Réponse du serveur:", response.data);
  
      return {
        success: true,
        data: response.data,
        message: 'Fonction exécutée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la fonction:', error);
  
      let errorMessage = 'Erreur lors de l\'exécution de la fonction';
  
      if (error.response) {
        errorMessage = `Erreur ${error.response.status}: ${error.response.data?.detail || error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Aucune réponse du serveur, veuillez vérifier la connexion';
      } else {
        errorMessage = error.message;
      }
  
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },

  /**
   * Récupère les informations d'un contrat déployé
   * @param {string} contractName - Nom du contrat
   * @returns {Promise} - Promesse contenant les informations du contrat
   */
  async getContractInfo(contractName) {
    try {
      // Appel à l'API pour récupérer les informations du contrat
      const response = await apiClient.get(`/smart-contracts/${contractName}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Informations du contrat récupérées avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des informations du contrat:', error);
      
      let errorMessage = 'Erreur lors de la récupération des informations du contrat';
      
      if (error.response) {
        errorMessage = `Erreur ${error.response.status}: ${error.response.data.detail || error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Aucune réponse du serveur, veuillez vérifier la connexion';
      } else {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  },
  
  /**
   * Récupère la liste de tous les contrats déployés
   * @returns {Promise} - Promesse contenant la liste des contrats
   */
  async getAllDeployedContracts() {
    try {
      const response = await apiClient.get('/smart-contracts/');
      
      return {
        success: true,
        data: response.data,
        message: 'Liste des contrats récupérée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
      
      let errorMessage = 'Erreur lors de la récupération des contrats';
      
      if (error.response) {
        errorMessage = `Erreur ${error.response.status}: ${error.response.data.detail || error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Aucune réponse du serveur';
      } else {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        data: []
      };
    }
  }
};

export default ContractDeploymentService;