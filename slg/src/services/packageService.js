import apiClient from './api.config';
import { withMinDelay } from '@/utils/services/delayService';

// Durée minimale pour les opérations (1 seconde)
const MIN_OPERATION_DELAY = 1000;

/**
 * Service pour la gestion des packages via l'API FastAPI
 */
export default {
  /**
   * Récupère tous les packages
   * @returns {Promise<Array>} Liste des packages
   */
  async getAllPackages() {
    try {
      // Utiliser withMinDelay pour assurer une durée minimale de chargement
      const response = await withMinDelay(
        apiClient.get('/package/'),
        MIN_OPERATION_DELAY
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  },

  /**
   * Récupère un package par son nom
   * @param {string} name - Nom du package
   * @returns {Promise<Object>} Le package
   */
  async getPackage(name) {
    try {
      const response = await withMinDelay(
        apiClient.get(`/package/${name}`),
        MIN_OPERATION_DELAY
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching package ${name}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau package
   * @param {Object} packageData - Données du package
   * @returns {Promise<Object>} Le package créé
   */
  async createPackage(packageData) {
    try {
      // Si packageData a déjà le bon format (format API), l'utiliser directement
      if (typeof packageData.functions === 'object' && !Array.isArray(packageData.functions)) {
        const response = await withMinDelay(
          apiClient.post('/package/', packageData),
          MIN_OPERATION_DELAY
        );
        return response.data;
      }
      
      // Sinon, convertir les données au format attendu par l'API
      const apiPackage = this.convertToApiFormat(packageData);
      
      const response = await withMinDelay(
        apiClient.post('/package/', apiPackage),
        MIN_OPERATION_DELAY
      );
      return response.data;
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  },

  /**
   * Met à jour un package existant
   * @param {string} name - Nom du package
   * @param {Object} packageData - Données du package
   * @returns {Promise<Object>} Le package mis à jour
   */
  async updatePackage(name, packageData) {
    try {
      // Si packageData a déjà le bon format (format API), l'utiliser directement
      if (typeof packageData.functions === 'object' && !Array.isArray(packageData.functions)) {
        const response = await withMinDelay(
          apiClient.put(`/package/${name}`, packageData),
          MIN_OPERATION_DELAY
        );
        return response.data;
      }
      
      // Sinon, convertir les données au format attendu par l'API
      const apiPackage = this.convertToApiFormat(packageData);
      
      const response = await withMinDelay(
        apiClient.put(`/package/${name}`, apiPackage),
        MIN_OPERATION_DELAY
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating package ${name}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un package
   * @param {string} name - Nom du package
   * @returns {Promise<void>}
   */
  async deletePackage(name) {
    try {
      await withMinDelay(
        apiClient.delete(`/package/${name}`),
        MIN_OPERATION_DELAY
      );
    } catch (error) {
      console.error(`Error deleting package ${name}:`, error);
      throw error;
    }
  },

  /**
   * Convertit les données de package du format interne au format API
   * @param {Object} packageData - Données du package au format interne
   * @returns {Object} Données au format API
   */
  convertToApiFormat(packageData) {
    // Créer l'objet functions au format attendu par l'API
    const functions = {};
    
    // Vérifier si packageData.functions est un tableau
    if (Array.isArray(packageData.functions)) {
      packageData.functions.forEach(func => {
        // Extraire l'ID original de la fonction depuis l'ID formaté
        // Format: "package__[packageName]__[funcId]"
        const originalFuncId = func.id.includes('__') 
          ? func.id.split('__').pop() 
          : func.id;
          
        functions[originalFuncId] = {
          code: func.code,
          default: func.default,
          label: func.label,
          description: func.description
        };
      });
    }
    
    // Retourner le package au format API
    return {
      name: packageData.id,
      label: packageData.label,
      description: packageData.description,
      functions,
      variables: packageData.variables,
      structs: packageData.structs
    };
  },

  /**
   * Convertit les données de package du format API au format interne
   * @param {Object} apiPackage - Données du package au format API
   * @returns {Object} Données au format interne
   */
  convertToInternalFormat(apiPackage) {
    // Convertir l'objet functions en tableau
    const functions = [];
    
    if (apiPackage.functions && typeof apiPackage.functions === 'object') {
      for (const [funcId, funcDetails] of Object.entries(apiPackage.functions)) {
        functions.push({
          id: `package__${apiPackage.name}__${funcId}`,  // Formatage de lid 
          name: funcId,
          label: funcDetails.label || funcId,
          description: funcDetails.description || '',
          code: funcDetails.code || '',
          default: funcDetails.default || false
        });
      }
    }
    
    // Retourner le package au format interne
    return {
      id: apiPackage.name,
      name: apiPackage.name,
      label: apiPackage.label,
      description: apiPackage.description,
      functions,
      variables: apiPackage.variables || [],
      structs: apiPackage.structs || []
    };
  },

  /**
   * Exporte un package au format JSON pour téléchargement
   * @param {Object} packageData - Données du package
   * @returns {string} URL de téléchargement
   */
  exportPackage(packageData) {
    try {
      // Simuler un délai dans cette fonction synchrone
      // Pour que l'écran de chargement ait le temps de s'afficher
      
      // Convertir au format API pour l'export
      const exportData = this.convertToApiFormat(packageData);
      
      // Créer un blob avec le contenu JSON
      const content = JSON.stringify(exportData, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      
      // Créer une URL pour le téléchargement
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error exporting package:', error);
      throw error;
    }
  }
};