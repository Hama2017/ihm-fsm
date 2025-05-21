import apiWrapper from './api.config';
import ErrorService from './errorService';
import { withMinDelay } from '@/utils/services/delayService';

// Durée minimale pour les opérations (1 seconde)
const MIN_OPERATION_DELAY = 1000;

/**
 * Service de gestion des contrats automatiques.
 * Permet la création, modification, suppression et récupération des contrats.
 */
const ContractService = {
  /**
   * Crée un nouveau contrat automatisé.
   * @param {Object} contractData - Données du contrat à créer
   * @returns {Promise<Object>} Contrat créé
   * @throws {Error} Erreur formatée avec code internationalisation
   */
  async createContract(contractData) {
    try {
      // Utilisation de withMinDelay pour garantir un temps minimal d'opération
      const response = await withMinDelay(
        apiWrapper.post('automaton-contracts/', contractData),
        MIN_OPERATION_DELAY
      );
      return response;
    } catch (error) {
      throw ErrorService.handleApiError(error, 'errors.contract.contract_creation_failed', false);
    }
  },

  /**
   * Récupère un contrat par son ID.
   * @param {string} contractId - ID du contrat à récupérer
   * @returns {Promise<Object>} Contrat récupéré
   * @throws {Error} Erreur formatée avec code internationalisation
   */
  async getContract(contractId) {
    try {
      const response = await apiWrapper.get(`automaton-contracts/${contractId}`);
      return response;
    } catch (error) {
      throw ErrorService.handleApiError(error, 'errors.contract.not_found', false);
    }
  },

  /**
   * Met à jour un contrat existant.
   * @param {string} contractId - ID du contrat à mettre à jour
   * @param {Object} contractData - Nouvelles données du contrat
   * @returns {Promise<Object>} Contrat mis à jour
   * @throws {Error} Erreur formatée avec code internationalisation
   */
  async updateContract(contractId, contractData) {
    try {
      // Gérer le cas particulier de changement de nom qui nécessite une recréation
      if (contractId !== contractData.name) {
        console.log(`Changement de nom détecté: ${contractId} -> ${contractData.name}`);
        
        try {
          // 1. Créer un nouveau contrat avec le nouveau nom
          const createResponse = await this.createContract(contractData);
          
          // 2. Supprimer l'ancien contrat
          try {
            await this.deleteContract(contractId);
            console.log(`Ancien contrat "${contractId}" supprimé`);
          } catch (deleteError) {
            console.error(`Échec de la suppression de l'ancien contrat "${contractId}"`, deleteError);
            // On continue même si la suppression échoue
          }
          
          return createResponse;
        } catch (error) {
          throw ErrorService.handleApiError(error, 'errors.contract.contract_update_failed', false);
        }
      }
      
      // Mise à jour normale si pas de changement de nom
      const response = await withMinDelay(
        apiWrapper.put(`automaton-contracts/${contractId}`, contractData),
        MIN_OPERATION_DELAY
      );
      return response;
    } catch (error) {
      throw ErrorService.handleApiError(error, 'errors.contract.contract_update_failed', false);
    }
  },

  /**
   * Supprime un contrat par son ID.
   * @param {string} contractId - ID du contrat à supprimer
   * @returns {Promise<Object>} Confirmation de suppression
   * @throws {Error} Erreur formatée avec code internationalisation
   */
  async deleteContract(contractId) {
    try {
      const response = await withMinDelay(
        apiWrapper.delete(`automaton-contracts/${contractId}`),
        MIN_OPERATION_DELAY
      );
      return response;
    } catch (error) {
      throw ErrorService.handleApiError(error, 'errors.contract.contract_deletion_failed', false);
    }
  },

  /**
   * Récupère la liste de tous les contrats.
   * @returns {Promise<Array>} Liste des contrats
   * @throws {Error} Erreur formatée avec code internationalisation
   */
  async getAllContracts() {
    try {
      const response = await apiWrapper.get('automaton-contracts/');
      return response;
    } catch (error) {
      throw ErrorService.handleApiError(error, 'errors.general.get_failed', false);
    }
  },
  
  /**
   * Récupère les contrats créés par un utilisateur spécifique.
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Array>} Liste des contrats de l'utilisateur
   * @throws {Error} Erreur formatée avec code internationalisation
   */
  async getContractsByUser(userId) {
    try {
      const response = await apiWrapper.get(`automaton-contracts/by-user/${userId}`);
      return response;
    } catch (error) {
      throw ErrorService.handleApiError(error, 'errors.general.get_failed', false);
    }
  },
  
  /**
   * Transforme un contrat pour le déploiement selon le format attendu par l'API.
   * @param {Object} contract - Contrat à transformer
   * @returns {Object} Contrat au format pour le déploiement
   */
  transformContractForDeployment(contract) {
    // Structure de sortie selon le Swagger
    const specificationModel = {
      name: contract.name,
      automatons: {},
      required_packages: []
    };

    // Collecter les packages utilisés
    const packagesUsed = new Set();

    // Normaliser un nom de variable
    const normalizeStateName = (name) => {
      if (!name) return 'q0';
      
      // Convertir en minuscules et supprimer les accents
      let normalized = name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_]/g, '_');
      
      // Préfixer avec q si commence par un chiffre
      if (/^[0-9]/.test(normalized)) {
        normalized = 'q' + normalized;
      }
      
      return normalized || 'q0';
    };

    // Parcourir les automates
    if (Array.isArray(contract.automates)) {
      contract.automates.forEach((automate, index) => {
        // Ignorer l'automate de déploiement
        if (automate.id === 'flow-deploiement') return;
        
        const automatonKey = `Automata${index}`;
        const automatonObj = {
          states: [],
          transitions: []
        };
        
        // Map de correspondance ID -> nom normalisé
        const stateNameMap = {};
        
        // Extraire les états
        if (Array.isArray(automate.states)) {
          automate.states.forEach(state => {
            const normalizedName = normalizeStateName(state.label);
            stateNameMap[state.id] = normalizedName;
            automatonObj.states.push(normalizedName);
          });
        }
        
        // Ajouter l'état "completed" si nécessaire
        if (!automatonObj.states.includes("completed")) {
          const finalState = automate.states.find(s => s.type === 'final');
          if (finalState) {
            stateNameMap[finalState.id] = "completed";
            const finalStateIndex = automatonObj.states.indexOf(normalizeStateName(finalState.label));
            if (finalStateIndex !== -1) {
              automatonObj.states[finalStateIndex] = "completed";
            } else {
              automatonObj.states.push("completed");
            }
          } else {
            automatonObj.states.push("completed");
          }
        }
        
        // Extraire les transitions
        if (Array.isArray(automate.transitions)) {
          automate.transitions.forEach(transition => {
            if (transition.source && transition.target) {
              const sourceLabel = stateNameMap[transition.source] || 'q0';
              let targetLabel = stateNameMap[transition.target] || 'q1';
              
              // Si la cible est un état final, utiliser "completed"
              const targetState = automate.states.find(s => s.id === transition.target);
              if (targetState && targetState.type === 'final') {
                targetLabel = "completed";
              }
              
              const transitionObj = {
                source: sourceLabel,
                destination: targetLabel,
                trigger: normalizeStateName(transition.label),
                conditions: []
              };
              
              // Ajouter les conditions
              if (Array.isArray(transition.conditions)) {
                transitionObj.conditions = [...transition.conditions];
                
                // Collecter les packages
                transition.conditions.forEach(condition => {
                  if (condition.startsWith('package__')) {
                    const parts = condition.split('__');
                    if (parts.length >= 2) {
                      packagesUsed.add(parts[1]);
                    }
                  }
                });
              }
              
              automatonObj.transitions.push(transitionObj);
            }
          });
        }
        
        // Ajouter l'automate au modèle de spécification
        specificationModel.automatons[automatonKey] = automatonObj;
      });
    }
    
    // Ajouter les packages collectés
    specificationModel.required_packages = Array.from(packagesUsed);
    
    // Si aucun package n'est détecté, ajouter les packages par défaut
    if (specificationModel.required_packages.length === 0) {
      specificationModel.required_packages.push('DevelopmentService');
    }
    
    return specificationModel;
  }
};

export default ContractService;