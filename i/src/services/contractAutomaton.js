import apiClient from './api.config';
import { withMinDelay } from '@/utils/services/delayService';
import ErrorService from '@/services/errorService';

// Durée minimale pour les opérations (1 seconde)
const MIN_OPERATION_DELAY = 1000;

const ContractAutomatonService = {
  /**
   * Créer un nouveau contrat automate
   * @param {Object} contractData 
   * @returns {Promise}
   */
  createContractAutomaton(contractData) {
    console.log("API - Création contrat:", contractData.name);
    return apiClient.post('automaton-contracts/', contractData);
  },

  /**
   * Récupérer un contrat automate par son nom
   * @param {string} contractName Nom du contrat
   * @returns {Promise}
   */
  getContractAutomaton(contractName) {
    console.log("API - Récupération contrat:", contractName);
    return apiClient.get(`automaton-contracts/${contractName}`);
  },

 /**
   * Mettre à jour un contrat automate existant
   * Pour une API où le nom est l'identifiant, lorsque le nom change,
   * nous devons créer un nouveau contrat et supprimer l'ancien
   * 
   * @param {string} oldContractName Nom actuel du contrat
   * @param {Object} contractData Nouvelles données du contrat
   * @returns {Promise}
   */
 async updateContractAutomaton(oldContractName, contractData) {
  console.log("API - Mise à jour contrat:", oldContractName, "->", contractData.name);

  // Si le nom a changé, il faut gérer différemment
  if (oldContractName !== contractData.name) {
    console.log("Le nom a changé, création d'un nouveau contrat et suppression de l'ancien");
    
    try {
      // 1. D'abord créer le nouveau contrat
      const createResponse = await this.createContractAutomaton(contractData);
      
      try {
        // 2. Puis supprimer l'ancien contrat
        await this.deleteContractAutomaton(oldContractName);
        console.log(`Ancien contrat "${oldContractName}" supprimé`);
      } catch (deleteError) {
        console.error(`Échec de la suppression de l'ancien contrat "${oldContractName}"`, deleteError);
        // On continue même si la suppression échoue
      }
      
      return createResponse;
    } catch (createError) {
      console.error("Échec de la création du nouveau contrat:", createError);
      throw createError;
    }
  }
  
  // Si le nom n'a pas changé, simple mise à jour
  return apiClient.put(`automaton-contracts/${oldContractName}`, contractData);
},
  /**
   * Supprimer un contrat automate existant
   * @param {string} contractName Nom du contrat
   * @returns {Promise}
   */
  deleteContractAutomaton(contractName) {
    return apiClient.delete(`automaton-contracts/${contractName}`);
  },

  /**
   * Lister tous les contrats automates
   * @returns {Promise}
   */
  listContractAutomaton() {
    return apiClient.get('automaton-contracts/');
  },

  /**
   * Déployer un contrat
   * @param {Object} specificationModel 
   * @returns {Promise}
   */
  deployContract(specificationModel) {
    return apiClient.post('smart-contracts/deploy', specificationModel);
  },
  /**
   * Exécuter une fonction sur un contrat déployé
   * @param {string} contractName 
   * @param {string} clauseName 
   * @param {string} functionName 
   * @param {Array} args 
   * @returns {Promise}
   */
  executeContractFunction(contractName, clauseName, functionName, args = []) {
    return apiClient.post(
      `smart-contracts/${contractName}/clause/${clauseName}/function/${functionName}/execute`,
      { args }
    );
  },

  /**
   * Récupérer les informations d'un contrat déployé
   * @param {string} contractName 
   * @returns {Promise}
   */
  getDeployedContractInfo(contractName) {
    return apiClient.get(`smart-contracts/${contractName}`);
  },

  /**
   * Récupérer tous les contrats déployés
   * @returns {Promise}
   */
  getAllDeployedContracts() {
    return apiClient.get('smart-contracts/');
  },

  /**
   * Récupérer l'historique d'un contrat
   * @param {string} contractName 
   * @returns {Promise}
   */
  getContractHistory(contractName) {
    return apiClient.get(`history/contract/${contractName}`);
  },

  /**
   * Conversion du format de l'objet contrat pour le déploiement
   * @param {Object} contract 
   * @returns {Object}
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

export default ContractAutomatonService;