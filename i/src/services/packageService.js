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
      const response = await withMinDelay(
        apiClient.get('/packages/'),
        MIN_OPERATION_DELAY
      );
      
      if (response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      console.error('Error fetching packages:', error);
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
      
      if (response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      console.error(`Error fetching package ${packageId}:`, error);
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
      
      // Validation des données côté client
      this.validatePackage(formattedData);
      
      // Envoyer les données au format attendu par l'API
      const response = await withMinDelay(
        apiClient.post('/packages/', formattedData),
        MIN_OPERATION_DELAY
      );
      
      if (response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      console.error('Error creating package:', error);
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
      
      // Validation des données côté client
      this.validatePackage(formattedData);
      
      // Envoyer la mise à jour
      const response = await withMinDelay(
        apiClient.put(`/packages/${packageId}`, formattedData),
        MIN_OPERATION_DELAY
      );
      
      if (response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      console.error(`Error updating package ${packageId}:`, error);
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
      const response = await withMinDelay(
        apiClient.delete(`/packages/${packageId}`),
        MIN_OPERATION_DELAY
      );
      
      // Retourner un message de confirmation
      return { 
        success: true, 
        message: 'Package supprimé avec succès',
        data: response.data 
      };
    } catch (error) {
      console.error(`Error deleting package ${packageId}:`, error);
      throw error;
    }
  },

  /**
   * Valide un package avant envoi à l'API
   * @param {Object} packageData - Données du package
   * @throws {Error} Erreur si le package n'est pas valide
   */
  validatePackage(packageData) {
    // Vérifier les champs obligatoires
    if (!packageData.id) {
      throw new Error('missing_id');
    }
    
    if (!packageData.label) {
      throw new Error('missing_label');
    }
    
    // Vérifier les fonctions (si présentes)
    if (packageData.functions) {
      const functionIds = new Set();
      
      for (const [funcId, func] of Object.entries(packageData.functions)) {
        // Vérifier si l'ID est valide
        if (!funcId || typeof funcId !== 'string') {
          throw new Error('invalid_function_id');
        }
        
        // Vérifier les doublons d'ID
        if (functionIds.has(funcId)) {
          throw new Error('duplicate_function_id');
        }
        
        functionIds.add(funcId);
        
        // Vérifier les champs obligatoires de fonction
        if (!func.label) {
          throw new Error('missing_function_label');
        }
      }
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
        let originalFuncId = func.id;
        if (func.id && func.id.includes('__')) {
          originalFuncId = func.id.split('__').pop();
        } else if (!func.id && func.name) {
          originalFuncId = func.name;
        }
          
        functions[originalFuncId] = {
          code: func.code || '',
          default: func.default || false,
          label: func.label || originalFuncId,
          description: func.description || ''
        };
      });
    }
    
    // Variables et Structs
    const variables = Array.isArray(packageData.variables) 
      ? packageData.variables 
      : [];
    
    const structs = Array.isArray(packageData.structs) 
      ? packageData.structs 
      : [];
    
    // Retourner le package au format API
    return {
      id: packageData.id,
      label: packageData.label || packageData.id,
      description: packageData.description || '',
      functions,
      variables,
      structs
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
          id: funcId.includes('__') ? funcId : `package__${apiPackage.id}__${funcId}`,
          name: funcId,
          label: funcDetails.label || funcId,
          description: funcDetails.description || '',
          code: funcDetails.code || '',
          default: funcDetails.default || false
        });
      }
    }
    
    // Gérer les variables
    let variables = [];
    if (apiPackage.variables) {
      if (Array.isArray(apiPackage.variables)) {
        variables = [...apiPackage.variables];
      } else if (typeof apiPackage.variables === 'object') {
        // Convertir de l'objet au tableau si nécessaire
        variables = Object.entries(apiPackage.variables).map(([varId, varDetails]) => ({
          name: varId,
          ...varDetails
        }));
      }
    }
    
    // Gérer les structs
    let structs = [];
    if (apiPackage.structs) {
      if (Array.isArray(apiPackage.structs)) {
        structs = [...apiPackage.structs];
      } else if (typeof apiPackage.structs === 'object') {
        // Convertir de l'objet au tableau si nécessaire
        structs = Object.entries(apiPackage.structs).map(([structId, structDetails]) => ({
          name: structId,
          ...structDetails
        }));
      }
    }
    
    // Retourner le package au format interne
    return {
      id: apiPackage.id,
      name: apiPackage.id,
      label: apiPackage.label || apiPackage.id,
      description: apiPackage.description || '',
      functions,
      variables,
      structs
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
          
          // Valider les données
          if (!importedData.id) {
            throw new Error('missing_id');
          }
          
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
  },
  
  /**
   * Vérifie si un identifiant existe déjà dans un package
   * @param {Object} packageData - Données du package
   * @param {string} functionId - ID de la fonction à vérifier
   * @returns {boolean} true si l'ID existe déjà
   */
  functionIdExists(packageData, functionId) {
    if (!packageData || !Array.isArray(packageData.functions)) {
      return false;
    }
    
    return packageData.functions.some(func => func.id === functionId || func.name === functionId);
  }
};

export default PackageService;