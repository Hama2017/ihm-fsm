import { defineStore } from 'pinia';
import automatonContractService from '@/services/automatonContractService';
import { extractErrorCode } from '@/utils/errorFormatter';

/**
 * Store Pinia pour la gestion des contrats automatisés.
 * Permet la création, mise à jour, suppression et récupération des contrats.
 */
export const useAutomatonContractStore = defineStore('automatonContract', {
  state: () => ({
    contracts: [],
    currentContract: null,
    userContracts: {}, // Nouveau: stockage des contrats par utilisateur
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Récupère un contrat par son ID.
     * @returns {Function} Fonction de recherche de contrat
     */
    getContractById: (state) => (id) => {
      return state.contracts.find(contract => contract.name === id || contract.id === id);
    },
    
    /**
     * Liste des contrats filtrés par statut.
     * @returns {Function} Fonction de filtrage
     */
    getContractsByStatus: (state) => (status) => {
      return state.contracts.filter(contract => contract.status === status);
    },
    
    /**
     * Récupère les contrats d'un utilisateur spécifique depuis le cache.
     * @returns {Function} Fonction de récupération des contrats utilisateur
     */
    getUserContracts: (state) => (userId) => {
      return state.userContracts[userId] || [];
    },
    
    /**
     * Nombre total de contrats.
     * @returns {Number} Nombre de contrats
     */
    contractCount: (state) => {
      return state.contracts.length;
    }
  },

  actions: {
    /**
     * Charge tous les contrats depuis le serveur.
     * @returns {Promise<Object>} Résultat avec les contrats ou code d'erreur
     */
    async fetchContracts() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Chargement des contrats automatisés...');
        const response = await automatonContractService.getAllContracts();
        
        // Traiter la réponse selon la structure de votre API
        if (response && typeof response === 'object') {
          // Si la réponse est un objet avec des propriétés contenant des arrays
          const contractsData = [];
          
          for (const key in response) {
            if (Array.isArray(response[key])) {
              response[key].forEach(contract => {
                contractsData.push({
                  id: contract.id || contract.name,
                  createdBy: contract.createdBy || 'unknown',
                  name: contract.name,
                  status: contract.status || 'draft',
                  createdAt: contract.createdAt || new Date().toISOString(),
                  updatedAt: contract.updatedAt || new Date().toISOString(),
                  description: contract.description || '',
                  automates: contract.automates || []
                });
              });
            }
          }
          
          this.contracts = contractsData;
        } else if (Array.isArray(response)) {
          // Si la réponse est directement un array
          this.contracts = response.map(contract => ({
            id: contract.id || contract.name,
            name: contract.name,
            createdBy: contract.createdBy || 'unknown',
            status: contract.status || 'draft',
            createdAt: contract.createdAt || new Date().toISOString(),
            updatedAt: contract.updatedAt || new Date().toISOString(),
            description: contract.description || '',
            automates: contract.automates || []
          }));
        } else {
          this.contracts = [];
        }
        
        return {
          success: true,
          data: this.contracts
        };
      } catch (error) {
        console.error('Erreur lors du chargement des contrats:', error);
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
     * Récupère un contrat spécifique par son ID.
     * @param {string} contractId - ID du contrat
     * @returns {Promise<Object>} Résultat avec le contrat ou code d'erreur
     */
    async fetchContractById(contractId) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Chargement du contrat:', contractId);
        const contract = await automatonContractService.getContract(contractId);
        
        console.log('Réponse API récupération:', contract);
        
        // Formater le contrat selon la structure de réponse de votre API
        const formattedContract = {
          id: contract.contractId || contract.id || contractId,
          name: contract.contractName || contract.name,
          status: contract.status || 'draft',
          createdBy: contract.createdBy || 'unknown',

          createdAt: contract.createdAt || new Date().toISOString(),
          updatedAt: contract.updatedAt || new Date().toISOString(),
          description: contract.description || '',
          automates: contract.automates || []
        };
        
        this.currentContract = formattedContract;
        
        // Mettre à jour aussi dans la liste si le contrat existe
        const index = this.contracts.findIndex(c => c.id === contractId || c.name === contractId);
        if (index !== -1) {
          this.contracts[index] = formattedContract;
        }
        
        return {
          success: true,
          data: formattedContract
        };
      } catch (error) {
        console.error('Erreur lors du chargement du contrat:', error);
        const errorCode = extractErrorCode(error, 'not_found', 'contract');
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
     * Récupère les contrats créés par un utilisateur spécifique.
     * @param {string} userId - ID de l'utilisateur
     * @returns {Promise<Object>} Résultat avec les contrats de l'utilisateur ou code d'erreur
     */
    async fetchContractsByUser(userId) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Chargement des contrats pour l\'utilisateur:', userId);
        const response = await automatonContractService.getContractsByUser(userId);
        
        console.log('Réponse API contrats utilisateur:', response);
        
        // Traiter la réponse selon la structure de l'API
        // La réponse est un objet avec des propriétés contenant des arrays de contrats
        const userContractsData = [];
        
        if (response && typeof response === 'object') {
          for (const key in response) {
            if (Array.isArray(response[key])) {
              response[key].forEach(contract => {
                userContractsData.push({
                  id: contract.id || contract.name,
                  name: contract.name,
                  status: contract.status || 'draft',
                  createdAt: contract.createdAt || new Date().toISOString(),
                  updatedAt: contract.updatedAt || new Date().toISOString(),
                  createdBy: contract.createdBy || userId,
                  description: contract.description || '',
                  automates: contract.automates || []
                });
              });
            }
          }
        }
        
        // Stocker les contrats de l'utilisateur dans le state principal ET dans le cache utilisateur
        this.contracts = userContractsData; // Mettre à jour le state principal
        
        // Si userContracts n'existe pas, l'initialiser
        if (!this.userContracts) {
          this.userContracts = {};
        }
        this.userContracts[userId] = userContractsData; // Cache utilisateur
        
        return {
          success: true,
          data: userContractsData
        };
      } catch (error) {
        console.error('Erreur lors du chargement des contrats utilisateur:', error);
        const errorCode = extractErrorCode(error, 'fetch_failed', 'user_contracts');
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
     * Crée un nouveau contrat.
     * @param {Object} contractData - Données du contrat
     * @returns {Promise<Object>} Résultat avec le contrat créé ou code d'erreur
     */
    async createContract(contractData) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Création du contrat:', contractData.name);
        
        // Vérifier si un contrat avec le même nom existe déjà
        const existingContract = this.getContractById(contractData.name);
        if (existingContract) {
          throw new Error('contract_already_exists');
        }
        
        // Préparer les données pour l'API
        const contractToCreate = {
          name: contractData.name.trim(),
          status: contractData.status || 'draft',
          createdAt: contractData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: contractData.description || '',
          automates: contractData.automates.map(automate => ({
            id: automate.id,
            name: automate.name,
            active: automate.active || false,
            states: automate.states || [],
            transitions: automate.transitions || []
          }))
        };
        
        const createdContract = await automatonContractService.createContract(contractToCreate);
        
        console.log('Réponse API création:', createdContract);
        
        // Formater le contrat créé selon la structure de réponse de votre API
        const formattedContract = {
          id: createdContract.contractId || createdContract.id,
          name: createdContract.contractName || createdContract.name || contractToCreate.name,
          status: contractToCreate.status || 'draft',
          createdAt: contractToCreate.createdAt,
          updatedAt: contractToCreate.updatedAt,
          description: contractToCreate.description || '',
          automates: contractToCreate.automates || []
        };
        
        // Ajouter à la liste
        this.contracts.push(formattedContract);
        this.currentContract = formattedContract;
        
        console.log('Contrat créé avec succès:', formattedContract);
        
        return {
          success: true,
          data: formattedContract
        };
      } catch (error) {
        console.error('Erreur lors de la création du contrat:', error);
        
        let errorCode;
        if (error.message === 'contract_already_exists') {
          errorCode = 'errors.contract.already_exists';
        } else {
          errorCode = extractErrorCode(error, 'creation_failed', 'contract');
        }
        
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
     * Met à jour un contrat existant.
     * @param {string} contractId - ID du contrat
     * @param {Object} contractData - Nouvelles données
     * @returns {Promise<Object>} Résultat avec le contrat mis à jour ou code d'erreur
     */
    async updateContract(contractId, contractData) {
      this.loading = true;
      this.error = null;
            
      try {
        // Préparer les données pour l'API en incluant executionMetadata
        const contractToUpdate = {
          name: contractData.name.trim(),
          status: contractData.status || 'draft',
          createdAt: contractData.createdAt,
          updatedAt: new Date().toISOString(),
          description: contractData.description || '',
          automates: contractData.automates.map(automate => {
            // Base de l'automate
            const automateToSave = {
              id: automate.id,
              name: automate.name,
              active: automate.active || false,
              states: automate.states || [],
              transitions: automate.transitions || []
            };
            
            // Ajouter executionMetadata si présent
            if (automate.executionMetadata) {
              automateToSave.executionMetadata = {
                completedAutomates: automate.executionMetadata.completedAutomates || [],
                contractId: automate.executionMetadata.contractId || contractId,
                globalStatus: automate.executionMetadata.globalStatus || 'pending',
                lastUpdated: automate.executionMetadata.lastUpdated || new Date().toISOString()
              };
            }
            
            return automateToSave;
          })
        };
                
        const updatedContract = await automatonContractService.updateContract(contractId, contractToUpdate);
                
        // Formater le contrat mis à jour en préservant executionMetadata
        const formattedContract = {
          id: updatedContract.contractId || updatedContract.id || contractId,
          name: updatedContract.contractName || updatedContract.name || contractToUpdate.name,
          status: contractToUpdate.status || 'draft',
          createdAt: contractToUpdate.createdAt,
          updatedAt: contractToUpdate.updatedAt,
          description: contractToUpdate.description || '',
          automates: contractToUpdate.automates.map(automate => {
            const formattedAutomate = {
              id: automate.id,
              name: automate.name,
              active: automate.active,
              states: automate.states,
              transitions: automate.transitions
            };
            
            // Préserver executionMetadata si présent
            if (automate.executionMetadata) {
              formattedAutomate.executionMetadata = automate.executionMetadata;
            }
            
            return formattedAutomate;
          })
        };
                
        // Mettre à jour dans la liste
        const index = this.contracts.findIndex(c => c.id === contractId || c.name === contractId);
        if (index !== -1) {
          this.contracts[index] = formattedContract;
        }

        // Mettre à jour aussi dans le cache des contrats utilisateur si applicable
        for (const userId in this.userContracts) {
          const userContractIndex = this.userContracts[userId].findIndex(c => c.id === contractId || c.name === contractId);
          if (userContractIndex !== -1) {
            this.userContracts[userId][userContractIndex] = formattedContract;
          }
        }
                
        this.currentContract = formattedContract;
                
        return {
          success: true,
          data: formattedContract
        };
      } catch (error) {
        console.error('Erreur lors de la mise à jour du contrat:', error);
        const errorCode = extractErrorCode(error, 'update_failed', 'contract');
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
     * Supprime un contrat.
     * @param {string} contractId - ID du contrat
     * @returns {Promise<Object>} Résultat de l'opération
     */
    async deleteContract(contractId) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Suppression du contrat:', contractId);
        
        await automatonContractService.deleteContract(contractId);
        
        // Supprimer de la liste
        this.contracts = this.contracts.filter(c => c.id !== contractId && c.name !== contractId);
        
        // Supprimer aussi du cache des contrats utilisateur
        for (const userId in this.userContracts) {
          this.userContracts[userId] = this.userContracts[userId].filter(c => c.id !== contractId && c.name !== contractId);
        }
        
        // Réinitialiser le contrat courant si c'est celui qui est supprimé
        if (this.currentContract && (this.currentContract.id === contractId || this.currentContract.name === contractId)) {
          this.currentContract = null;
        }
        
        return {
          success: true
        };
      } catch (error) {
        console.error('Erreur lors de la suppression du contrat:', error);
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
     * Définit le contrat actuellement sélectionné.
     * @param {Object|string} contractOrId - Contrat ou ID du contrat
     */
    setCurrentContract(contractOrId) {
      if (typeof contractOrId === 'string') {
        this.currentContract = this.getContractById(contractOrId);
      } else {
        this.currentContract = contractOrId;
      }
    },

    /**
     * Réinitialise le contrat actuellement sélectionné.
     */
    clearCurrentContract() {
      this.currentContract = null;
    },

    /**
     * Transforme un contrat au format requis pour le déploiement.
     * @param {Object} contract - Contrat à transformer
     * @returns {Object} Contrat transformé
     */
    transformContractForDeployment(contract) {
      return automatonContractService.transformContractForDeployment(contract);
    },



/**
 * Met à jour le statut d'un contrat.
 * @param {string} contractId - ID du contrat
 * @param {string} newStatus - Nouveau statut (draft, deployed, completed)
 * @returns {Promise<Object>} Résultat de l'opération
 */
async updateContractStatus(contractId, newStatus) {
  this.loading = true;
  this.error = null;
  
  try {
    console.log('Mise à jour du statut du contrat:', contractId, 'vers', newStatus);
    
    // Récupérer le contrat actuel
    const currentContract = await automatonContractService.getContract(contractId);
    
    if (!currentContract) {
      throw new Error('Contrat non trouvé');
    }
    
    // Préparer les données de mise à jour avec le nouveau statut
    const contractToUpdate = {
      ...currentContract,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      // Ajouter une date de completion si le statut est 'completed'
      ...(newStatus === 'completed' && { 
        completedAt: new Date().toISOString() 
      })
    };
    
    const updatedContract = await automatonContractService.updateContract(contractId, contractToUpdate);
    
    // Formater le contrat mis à jour
    const formattedContract = {
      id: updatedContract.contractId || updatedContract.id || contractId,
      name: updatedContract.contractName || updatedContract.name || contractToUpdate.name,
      status: newStatus,
      createdAt: contractToUpdate.createdAt,
      updatedAt: contractToUpdate.updatedAt,
      completedAt: contractToUpdate.completedAt,
      description: contractToUpdate.description || '',
      automates: contractToUpdate.automates || []
    };
    
    // Mettre à jour dans la liste locale
    const index = this.contracts.findIndex(c => c.id === contractId || c.name === contractId);
    if (index !== -1) {
      this.contracts[index] = formattedContract;
    }
    
    // Mettre à jour aussi dans le cache des contrats utilisateur
    for (const userId in this.userContracts) {
      const userContractIndex = this.userContracts[userId].findIndex(c => c.id === contractId || c.name === contractId);
      if (userContractIndex !== -1) {
        this.userContracts[userId][userContractIndex] = formattedContract;
      }
    }
    
    this.currentContract = formattedContract;
    
    return {
      success: true,
      data: formattedContract
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du contrat:', error);
    const errorCode = extractErrorCode(error, 'status_update_failed', 'contract');
    this.error = errorCode;
    
    return {
      success: false,
      errorCode
    };
  } finally {
    this.loading = false;
  }
}
  }
});