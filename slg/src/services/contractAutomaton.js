// services/contractAutomaton.js

import apiClient from './api.config';
import { withMinDelay } from '@/utils/services/delayService';
// Durée minimale pour les opérations (1 seconde)
const MIN_OPERATION_DELAY = 5000;

const ContractAutomatonService = {
  /**
   * Créer un nouveau contrat automate
   * @param {Object} contractData 
   * @returns {Promise}
   */
  createContractAutomaton(contractData) {
    return withMinDelay(
        apiClient.post('/contract-automaton/', contractData),
        MIN_OPERATION_DELAY
      );
  },

  /**
   * Récupérer un contrat automate par son ID
   * @param {string} contractId 
   * @returns {Promise}
   */
  getContractAutomaton(contractId) {
    return apiClient.get(`/contract-automaton/${contractId}`);
  },

  /**
   * Mettre à jour un contrat automate existant
   * @param {string} contractId 
   * @param {Object} contractData 
   * @returns {Promise}
   */
  updateContractAutomaton(contractId, contractData) {
    return apiClient.put(`/contract-automaton/${contractId}`, contractData);
  },

  /**
   * Supprimer un contrat automate existant
   * @param {string} contractId 
   * @returns {Promise}
   */
  deleteContractAutomaton(contractId) {
    return apiClient.delete(`/contract-automaton/${contractId}`);
  },

  /**
   * Lister tous les contrats automates
   * @returns {Promise}
   */
  listContractAutomaton() {
    return apiClient.get('/contract-automaton/');
  }
};

export default ContractAutomatonService;
