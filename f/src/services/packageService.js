import apiClient from './api.config';
import { withMinDelay } from '@/utils/services/delayService';

// Durée minimale pour les opérations (1 seconde)
const MIN_OPERATION_DELAY = 1000;

/**
 * Service de gestion des packages de contrats intelligents.
 * Permet la gestion des packages utilisés dans les contrats automatisés.
 */
const PackageService = {
  /**
   * Récupère tous les packages disponibles.
   * @returns {Promise<Array>} Liste des packages
   * @throws {Error} Erreur en cas d'échec
   */
  async getAllPackages() {
    try {
      // Utiliser withMinDelay pour assurer une durée minimale de l'opération
      const response = await withMinDelay(
        apiClient.get('/packages/'),
        MIN_OPERATION_DELAY
      );
      return response;
    } catch (error) {
      // Simplement transmettre l'erreur pour traitement par le store
      throw error;
    }
  },

  /**
   * Récupère un package par son ID.
   * @param {string} packageId - ID du package
   * @returns {Promise<Object>} Le package demandé
   * @throws {Error} Erreur en cas d'échec
   */
  async getPackage(packageId) {
    try {
      const response = await withMinDelay(
        apiClient.get(`/packages/${packageId}`),
        MIN_OPERATION_DELAY
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crée un nouveau package.
   * @param {Object} packageData - Données du package à créer
   * @returns {Promise<Object>} Le package créé
   * @throws {Error} Erreur en cas d'échec
   */
  async createPackage(packageData) {
    try {
      // Vérifier si les données sont au bon format
      const formattedData = this.convertToApiFormat(packageData);
      
      // Envoyer les données au format attendu par l'API
      const response = await withMinDelay(
        apiClient.post('/packages/', formattedData),
        MIN_OPERATION_DELAY
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Met à jour un package existant.
   * @param {string} packageId - ID du package à mettre à jour
   * @param {Object} packageData - Nouvelles données du package
   * @returns {Promise<Object>} Le package mis à jour
   * @throws {Error} Erreur en cas d'échec
   */
  async updatePackage(packageId, packageData) {
    try {
      // Vérifier que l'ID correspond
      if (packageId !== packageData.id) {
        throw new Error('ID mismatch');
      }
      
      // Formater les données pour l'API
      const formattedData = this.convertToApiFormat(packageData);
      
      // Envoyer la mise à jour
      const response = await withMinDelay(
        apiClient.put(`/packages/${packageId}`, formattedData),
        MIN_OPERATION_DELAY
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Supprime un package.
   * @param {string} packageId - ID du package à supprimer
   * @returns {Promise<Object>} Confirmation de suppression
   * @throws {Error} Erreur en cas d'échec
   */
  async deletePackage(packageId) {
    try {
      await withMinDelay(
        apiClient.delete(`/packages/${packageId}`),
        MIN_OPERATION_DELAY
      );
      
      // Retourner un message de confirmation
      return { message: 'Package supprimé avec succès' };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Convertit les données de package du format interne au format API.
   * @param {Object} packageData - Données du package au format interne (avec functions en tableau)
   * @returns {Object} Données au format API (avec functions en objet)
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
          code: func.code || '',
          default: func.default || false,
          label: func.label || originalFuncId,
          description: func.description || ''
        };
      });
    }
    
    // Retourner le package au format API
    return {
      id: packageData.id,
      label: packageData.label || packageData.id,
      description: packageData.description || '',
      functions,
      variables: packageData.variables || [],
      structs: packageData.structs || []
    };
  },

  /**
   * Convertit les données de package du format API au format interne.
   * @param {Object} apiPackage - Données du package au format API (avec functions en objet)
   * @returns {Object} Données au format interne (avec functions en tableau)
   */
  convertToInternalFormat(apiPackage) {
    // S'assurer que apiPackage est un objet valide
    if (!apiPackage || typeof apiPackage !== 'object') {
      console.error('Package invalide:', apiPackage);
      return {
        id: 'invalid',
        name: 'invalid',
        label: 'Package invalide',
        description: '',
        functions: [],
        variables: [],
        structs: []
      };
    }
    
    // Convertir l'objet functions en tableau
    const functions = [];
    
    if (apiPackage.functions && typeof apiPackage.functions === 'object') {
      for (const [funcId, funcDetails] of Object.entries(apiPackage.functions)) {
        functions.push({
          id: `package__${apiPackage.id}__${funcId}`,  // Formatage de l'ID
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
      id: apiPackage.id,
      name: apiPackage.id,
      label: apiPackage.label || apiPackage.id,
      description: apiPackage.description || '',
      functions,
      variables: Array.isArray(apiPackage.variables) ? apiPackage.variables : [],
      structs: Array.isArray(apiPackage.structs) ? apiPackage.structs : []
    };
  },

  /**
   * Exporte un package au format JSON pour téléchargement.
   * @param {Object} packageData - Données du package à exporter
   * @returns {string} URL de téléchargement du fichier JSON
   */
  exportPackage(packageData) {
    try {
      // Convertir au format API pour l'export
      const exportData = this.convertToApiFormat(packageData);
      
      // Créer un blob avec le contenu JSON
      const content = JSON.stringify(exportData, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      
      // Créer une URL pour le téléchargement
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Erreur lors de l\'exportation du package:', error);
      throw error;
    }
  },
  
  /**
   * Importe un package depuis un fichier JSON.
   * @param {File} file - Fichier JSON contenant les données du package
   * @returns {Promise<Object>} Package importé au format interne
   */
  async importPackage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          // Lire le contenu JSON
          const content = event.target.result;
          const importedData = JSON.parse(content);
          
          // Convertir au format interne
          const internalFormat = this.convertToInternalFormat(importedData);
          resolve(internalFormat);
        } catch (error) {
          console.error('Erreur lors de l\'import:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Erreur de lecture du fichier:', error);
        reject(error);
      };
      
      // Lire le fichier comme texte
      reader.readAsText(file);
    });
  }
};

export default PackageService;