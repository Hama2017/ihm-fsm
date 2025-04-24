import apiClient from './api.config';
import {enrichApiResponse, cleanApiResponse} from '@/utils/apiResponseTransformer/packageTransformer';

/**
 * Service pour les opérations CRUD des packages de conditions
 */
export default {
  /**
   * Récupère tous les packages disponibles
   * @returns {Promise} Promise contenant les données des packages
   */
  getAllPackages() {
    return apiClient.get('/package/')
      .then(response => {
        const cleaned = cleanApiResponse(response.data);
        const enriched = enrichApiResponse(cleaned);
        return enriched;
      })
      .catch(error => {
        throw error;
      });
  },
  
  
  /**
   * Récupère un package spécifique par son nom
   * @param {string} name - Nom du package à récupérer
   * @returns {Promise} Promise contenant les données du package
   */
  getPackageByName(name) {
    return apiClient.get(`/package/${name}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Erreur lors de la récupération du package ${name}:`, error);
        throw error;
      });
  },
  
  /**
   * Crée un nouveau package
   * @param {Object} packageData - Données du package à créer
   * @returns {Promise} Promise contenant les données du package créé
   */
  createPackage(packageData) {
    return apiClient.post('/package/', packageData)
      .then(response => response.data)
      .catch(error => {
        console.error('Erreur lors de la création du package:', error);
        throw error;
      });
  }
};