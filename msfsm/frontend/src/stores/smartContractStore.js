import { defineStore } from 'pinia';
import smartContractService from '@/services/smartContractService';
import { extractErrorCode } from '@/utils/errorFormatter';

/**
 * Store Pinia pour la gestion des contrats intelligents déployés.
 * Permet le déploiement, l'exécution et la gestion des contrats sur la blockchain.
 */
export const useSmartContractStore = defineStore('smartContract', {
  state: () => ({
    deployedContracts: [],
    currentDeployedContract: null,
    deploymentInfo: null,
    loading: false,
    error: null,
    executionResult: null,
    executionLoading: false
  }),

  getters: {
    /**
     * Récupère un contrat déployé par son nom.
     * @returns {Function} Fonction de recherche de contrat déployé
     */
    getDeployedContractByName: (state) => (name) => {
      return state.deployedContracts.find(contract => contract.name === name);
    },
    
    /**
     * Liste des noms de contrats déployés.
     * @returns {Array} Noms des contrats déployés
     */
    deployedContractNames: (state) => {
      return state.deployedContracts.map(contract => contract.name);
    },
    
    /**
     * Nombre total de contrats déployés.
     * @returns {Number} Nombre de contrats déployés
     */
    deployedContractCount: (state) => {
      return state.deployedContracts.length;
    }
  },

  actions: {
  /**
 * Déploie un contrat sur la blockchain.
 * @param {Object} specificationModel - Spécification du contrat
 * @returns {Promise<Object>} Résultat du déploiement
 */
async deployContract(specificationModel) {
    this.loading = true;
    this.error = null;
    this.deploymentInfo = null;
    
    try {
      console.log('Déploiement du contrat:', specificationModel.name);
      
      // ✅ Le service retourne directement response.data (pas de wrapper success)
      const result = await smartContractService.deployContract(specificationModel);
      
      console.log('🔍 Réponse brute du service:', result);
      
      // ✅ CORRECTION: Vérifier si la réponse contient des données de déploiement
      if (result && (result.automatons || result.name)) {
        // La réponse contient les données du contrat déployé
        this.deploymentInfo = result;
        
        // Ajouter le contrat à la liste des contrats déployés
        const deployedContract = {
          name: specificationModel.name,
          deployedAt: result.deployed_at || new Date().toISOString(),
          automatons: result.automatons || result,
          status: 'deployed'
        };
        
        // Vérifier si le contrat n'est pas déjà dans la liste
        const existingIndex = this.deployedContracts.findIndex(c => c.name === specificationModel.name);
        if (existingIndex !== -1) {
          this.deployedContracts[existingIndex] = deployedContract;
        } else {
          this.deployedContracts.push(deployedContract);
        }
        
        this.currentDeployedContract = deployedContract;
        
        return {
          success: true,
          data: result
        };
      } else {
        // Pas de données de déploiement trouvées
        this.error = 'Réponse invalide du serveur';
        return {
          success: false,
          error: 'Réponse invalide du serveur'
        };
      }
      
    } catch (error) {
      console.error('Erreur lors du déploiement:', error);
      
      // ✅ Vérifier si l'erreur contient en fait des données de succès (status 201)
      if (error.response && error.response.status === 201 && error.response.data) {
        console.log('✅ Déploiement réussi malgré l\'erreur (status 201)');
        
        const result = error.response.data;
        this.deploymentInfo = result;
        
        const deployedContract = {
          name: specificationModel.name,
          deployedAt: result.deployed_at || new Date().toISOString(),
          automatons: result.automatons || result,
          status: 'deployed'
        };
        
        const existingIndex = this.deployedContracts.findIndex(c => c.name === specificationModel.name);
        if (existingIndex !== -1) {
          this.deployedContracts[existingIndex] = deployedContract;
        } else {
          this.deployedContracts.push(deployedContract);
        }
        
        this.currentDeployedContract = deployedContract;
        
        return {
          success: true,
          data: result
        };
      }
      
      // Vraie erreur
      const errorCode = extractErrorCode(error, 'deployment_failed', 'contract');
      this.error = errorCode;
      
      return {
        success: false,
        error: error.response?.data?.detail?.message || 
               error.response?.data?.message ||
               error.message || 
               'Erreur lors du déploiement',
        errorCode
      };
    } finally {
      this.loading = false;
    }
  },

    /**
     * Récupère les informations d'un contrat déployé.
     * @param {string} contractName - Nom du contrat
     * @returns {Promise<Object>} Informations du contrat
     */
    async fetchDeployedContractInfo(contractName) {
        this.loading = true;
        this.error = null;
      
        try {
          const result = await smartContractService.getDeployedContractInfo(contractName);
      
          if (result && result.automatons) {
            const contractInfo = {
              name: contractName,
              automatons: result.automatons,
              deployedAt: result.deployed_at || new Date().toISOString(),
              status: 'deployed'
            };
      
            this.currentDeployedContract = contractInfo;
      
            // Mise à jour de la liste des contrats déployés
            const existingIndex = this.deployedContracts.findIndex(c => c.name === contractName);
            if (existingIndex !== -1) {
              this.deployedContracts[existingIndex] = contractInfo;
            } else {
              this.deployedContracts.push(contractInfo);
            }
      
            return {
              success: true,
              data: result // Renvoie directement result
            };
          }
      
          // Si automatons n’est pas trouvé dans la réponse
          throw new Error('Données invalides reçues du serveur.');
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || error.message || 'Erreur réseau lors de la récupération des informations.';
          this.error = errorMessage;
      
          return {
            success: false,
            error: errorMessage
          };
        } finally {
          this.loading = false;
        }
      },
      

    /**
     * Récupère tous les contrats déployés.
     * @returns {Promise<Object>} Liste des contrats déployés
     */
    async fetchAllDeployedContracts() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Récupération de tous les contrats déployés...');
        
        const result = await smartContractService.getAllDeployedContracts();
        
        if (result.success) {
          // Formater la liste des contrats déployés
          const deployedContracts = [];
          
          if (Array.isArray(result.data)) {
            deployedContracts.push(...result.data.map(contract => ({
              name: contract.name,
              automatons: contract.automatons || {},
              deployedAt: contract.deployedAt || new Date().toISOString(),
              status: 'deployed'
            })));
          } else if (typeof result.data === 'object') {
            // Si la réponse est un objet avec des propriétés
            for (const [contractName, contractData] of Object.entries(result.data)) {
              deployedContracts.push({
                name: contractName,
                automatons: contractData.automatons || contractData,
                deployedAt: contractData.deployedAt || new Date().toISOString(),
                status: 'deployed'
              });
            }
          }
          
          this.deployedContracts = deployedContracts;
          
          return {
            success: true,
            data: deployedContracts
          };
        } else {
          this.error = result.error;
          return {
            success: false,
            error: result.error
          };
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des contrats déployés:', error);
        const errorCode = extractErrorCode(error, 'fetch_failed', 'contract');
        this.error = errorCode;
        
        return {
          success: false,
          errorCode
        };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Exécute une fonction sur un contrat déployé.
     * @param {string} contractName - Nom du contrat
     * @param {string} clauseName - Nom de la clause
     * @param {string} functionName - Nom de la fonction
     * @param {Array} args - Arguments de la fonction
     * @returns {Promise<Object>} Résultat de l'exécution
     */
    async executeContractFunction(contractName, clauseName, functionName, args = []) {
        this.executionLoading = true;
        this.error = null;
        this.executionResult = null;
      
        try {
          console.log('Exécution de la fonction:', { contractName, clauseName, functionName, args });
      
          // Appel au service
          const result = await smartContractService.executeContractFunction(
            contractName,
            clauseName,
            functionName,
            args
          );
      
          // ✅ Vérification du champ "result" dans la réponse
          if (result && result.result !== undefined) {
            this.executionResult = result;
      
            return {
              success: true,
              data: result
            };
          } else {
            const message = result?.error || 'Résultat inattendu du backend';
            this.error = message;
      
            return {
              success: false,
              error: message
            };
          }
      
        } catch (error) {
          console.error('Erreur lors de l\'exécution:', error);
          const message =
            error.response?.data?.detail?.message ||
            error.response?.data?.message ||
            error.message || 'Erreur inconnue lors de l\'exécution';
      
          this.error = message;
      
          return {
            success: false,
            error: message
          };
        } finally {
          this.executionLoading = false;
        }
      },
      

    /**
     * Supprime un contrat déployé.
     * @param {string} contractName - Nom du contrat
     * @returns {Promise<Object>} Résultat de la suppression
     */
    async deleteDeployedContract(contractName) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Suppression du contrat déployé:', contractName);
        
        const result = await smartContractService.deleteDeployedContract(contractName);
        
        if (result.success) {
          // Supprimer de la liste
          this.deployedContracts = this.deployedContracts.filter(c => c.name !== contractName);
          
          // Réinitialiser le contrat courant si c'est celui supprimé
          if (this.currentDeployedContract && this.currentDeployedContract.name === contractName) {
            this.currentDeployedContract = null;
          }
          
          return {
            success: true
          };
        } else {
          this.error = result.error;
          return {
            success: false,
            error: result.error
          };
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        const errorCode = extractErrorCode(error, 'deletion_failed', 'contract');
        this.error = errorCode;
        
        return {
          success: false,
          errorCode
        };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Définit le contrat déployé actuellement sélectionné.
     * @param {Object|string} contractOrName - Contrat ou nom du contrat
     */
    setCurrentDeployedContract(contractOrName) {
      if (typeof contractOrName === 'string') {
        this.currentDeployedContract = this.getDeployedContractByName(contractOrName);
      } else {
        this.currentDeployedContract = contractOrName;
      }
    },

    /**
     * Réinitialise le contrat déployé actuellement sélectionné.
     */
    clearCurrentDeployedContract() {
      this.currentDeployedContract = null;
    },

    /**
     * Réinitialise les résultats d'exécution.
     */
    clearExecutionResult() {
      this.executionResult = null;
    },

    /**
     * Réinitialise les informations de déploiement.
     */
    clearDeploymentInfo() {
      this.deploymentInfo = null;
    }
  }
});