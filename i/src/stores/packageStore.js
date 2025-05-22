import { defineStore } from 'pinia';
import packageService from '@/services/packageService';
import { extractErrorCode } from '@/utils/errorFormatter';

/**
 * Store Pinia pour la gestion des packages de contrats intelligents.
 * Permet la création, mise à jour, suppression, import et export des packages.
 */
export const usePackageStore = defineStore('packages', {
  state: () => ({
    packages: [],
    currentPackage: null,
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Récupère un package par son ID.
     * @returns {Function} Fonction de recherche de package
     */
    getPackageById: (state) => (id) => {
      return state.packages.find(pkg => pkg.id === id);
    },
    
    /**
     * Liste des fonctions disponibles dans tous les packages.
     * @returns {Array} Liste des fonctions avec leurs packages
     */
    allFunctions: (state) => {
      const functions = [];
      
      state.packages.forEach(pkg => {
        if (Array.isArray(pkg.functions)) {
          pkg.functions.forEach(func => {
            functions.push({
              ...func,
              packageId: pkg.id,
              packageName: pkg.label || pkg.id
            });
          });
        }
      });
      
      return functions;
    },
    
    /**
     * Liste des noms de packages.
     * @returns {Array} Noms des packages
     */
    packageNames: (state) => {
      return state.packages.map(pkg => ({
        id: pkg.id,
        name: pkg.label || pkg.id
      }));
    }
  },

  actions: {
    /**
     * Charge tous les packages depuis le serveur.
     * @returns {Promise<Object>} Résultat avec les packages ou code d'erreur
     */
    async fetchPackages() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Fetching packages from service...');
        const packages = await packageService.getAllPackages();
        console.log('Raw response from service:', packages);
        
        // Vérifier que packages est bien un Array
        if (Array.isArray(packages)) {
          console.log('Packages is an array, processing...');
          // Convertir les packages au format interne
          this.packages = packages.map(pkg => {
            try {
              return packageService.convertToInternalFormat(pkg);
            } catch (err) {
              console.error('Error converting package:', err);
              return null;
            }
          }).filter(Boolean);
          
          return {
            success: true,
            data: this.packages
          };
        } else if (packages && typeof packages === 'object') {
          // Si un seul package est retourné comme objet
          try {
            const converted = packageService.convertToInternalFormat(packages);
            this.packages = [converted];
            
            return {
              success: true,
              data: this.packages
            };
          } catch (err) {
            console.error('Error converting single package:', err);
          }
        }
        
        // Si on arrive ici, c'est que le format est invalide
        console.error('Les données reçues ne sont pas au format attendu:', packages);
        this.error = 'invalid_format';
        
        return {
          success: false,
          errorCode: 'errors.package.invalid_format'
        };
      } catch (error) {
        console.error('Error in fetchPackages:', error);
        const errorCode = extractErrorCode(error, 'not_found', 'package');
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
     * Supprime une fonction d'un package.
     * @param {string} packageId - ID du package
     * @param {string} functionId - ID de la fonction
     * @returns {Promise<Object>} Résultat avec le package mis à jour ou code d'erreur
     */
    async deleteFunction(packageId, functionId) {
      this.loading = true;
      this.error = null;
      
      try {
        const pkg = this.getPackageById(packageId);
        
        if (!pkg) {
          throw { code: 'package.not_found' };
        }
        
        // Supprimer la fonction
        const updatedFunctions = pkg.functions.filter(f => f.id !== functionId);
        
        // Si la fonction n'existait pas
        if (updatedFunctions.length === pkg.functions.length) {
          throw new Error('missing_function');
        }
        
        // Mettre à jour le package
        const updatedPackage = {
          ...pkg,
          functions: updatedFunctions
        };
        
        return await this.updatePackage(packageId, updatedPackage);
      } catch (error) {
        console.error('Error deleting function:', error);
        const errorCode = extractErrorCode(error, 'function_deletion_failed', 'package');
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
     * Crée un nouveau package.
     * @param {Object} packageData - Données du package
     * @returns {Promise<Object>} Résultat avec le package créé ou code d'erreur
     */
    async createPackage(packageData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Vérifier si un package avec le même ID existe déjà
        const existingPackage = this.getPackageById(packageData.id);
        if (existingPackage) {
          throw new Error('already_exists');
        }
        
        // Vérifier les doublons de fonctions
        if (Array.isArray(packageData.functions)) {
          const functionIds = new Set();
          for (const func of packageData.functions) {
            if (func.id && functionIds.has(func.id)) {
              throw new Error('duplicate_function_id');
            }
            if (func.id) {
              functionIds.add(func.id);
            }
          }
        }
        
        const newPackage = await packageService.createPackage(packageData);
        
        // Convertir au format interne et ajouter à la liste
        const internalPackage = packageService.convertToInternalFormat(newPackage);
        this.packages.push(internalPackage);
        
        // Rafraîchir la liste depuis le serveur pour s'assurer de la cohérence
        await this.fetchPackages();
        
        return {
          success: true,
          data: internalPackage
        };
      } catch (error) {
        console.error('Error creating package:', error);
        
        let errorCode;
        if (error.message === 'duplicate_function_id') {
          errorCode = 'errors.package.duplicate_function';
        } else if (error.message === 'already_exists') {
          errorCode = 'errors.package.already_exists';
        } else {
          errorCode = extractErrorCode(error, 'creation_failed', 'package');
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
     * Met à jour un package existant.
     * @param {string} packageId - ID du package
     * @param {Object} packageData - Nouvelles données
     * @returns {Promise<Object>} Résultat avec le package mis à jour ou code d'erreur
     */
    async updatePackage(packageId, packageData) {
      this.loading = true;
      this.error = null;
      
      try {
        // Vérifier que l'ID correspond
        if (packageId !== packageData.id) {
          throw new Error('validation_failed');
        }
        
        // Vérifier les doublons de fonctions
        if (Array.isArray(packageData.functions)) {
          const functionIds = new Set();
          for (const func of packageData.functions) {
            if (func.id && functionIds.has(func.id)) {
              throw new Error('duplicate_function_id');
            }
            if (func.id) {
              functionIds.add(func.id);
            }
          }
        }
        
        const updatedPackage = await packageService.updatePackage(packageId, packageData);
        
        // Convertir au format interne
        const internalPackage = packageService.convertToInternalFormat(updatedPackage);
        
        // Mettre à jour dans la liste
        const index = this.packages.findIndex(pkg => pkg.id === packageId);
        if (index !== -1) {
          this.packages[index] = internalPackage;
        }
        
        // Mettre à jour le package courant si nécessaire
        if (this.currentPackage && this.currentPackage.id === packageId) {
          this.currentPackage = internalPackage;
        }
        
        return {
          success: true,
          data: internalPackage
        };
      } catch (error) {
        console.error('Error updating package:', error);
        
        let errorCode;
        if (error.message === 'duplicate_function_id') {
          errorCode = 'errors.package.duplicate_function';
        } else {
          errorCode = extractErrorCode(error, 'update_failed', 'package');
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
     * Supprime un package.
     * @param {string} packageId - ID du package
     * @returns {Promise<Object>} Résultat de l'opération avec succès ou code d'erreur
     */
    async deletePackage(packageId) {
      this.loading = true;
      this.error = null;
      
      try {
        await packageService.deletePackage(packageId);
        
        // Supprimer de la liste
        this.packages = this.packages.filter(pkg => pkg.id !== packageId);
        
        // Réinitialiser le package courant si nécessaire
        if (this.currentPackage && this.currentPackage.id === packageId) {
          this.currentPackage = null;
        }
        
        return {
          success: true
        };
      } catch (error) {
        console.error('Error deleting package:', error);
        const errorCode = extractErrorCode(error, 'deletion_failed', 'package');
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
     * Définit le package actuellement sélectionné.
     * @param {Object|string} packageOrId - Package ou ID du package
     * @returns {Object} Package sélectionné ou null
     */
    setCurrentPackage(packageOrId) {
      if (typeof packageOrId === 'string') {
        this.currentPackage = this.getPackageById(packageOrId);
      } else {
        this.currentPackage = packageOrId;
      }
      
      return this.currentPackage;
    },
    
    /**
     * Réinitialise le package actuellement sélectionné.
     */
    clearCurrentPackage() {
      this.currentPackage = null;
    },
    
    /**
     * Exporte un package au format JSON.
     * @param {string} packageId - ID du package
     * @returns {Object} Résultat avec l'URL de téléchargement ou code d'erreur
     */
    exportPackage(packageId) {
      this.error = null;
      
      try {
        const packageToExport = this.getPackageById(packageId);
        
        if (!packageToExport) {
          throw new Error('not_found');
        }
        
        const downloadUrl = packageService.exportPackage(packageToExport);
        
        return {
          success: true,
          data: downloadUrl
        };
      } catch (error) {
        console.error('Error exporting package:', error);
        const errorCode = extractErrorCode(error, 'export_failed', 'package');
        this.error = errorCode;
        
        return {
          success: false,
          errorCode
        };
      }
    },
    
    /**
     * Importe un package depuis un fichier JSON.
     * @param {File} file - Fichier JSON contenant les données du package
     * @returns {Promise<Object>} Résultat avec le package importé ou code d'erreur
     */
    async importPackage(file) {
      this.loading = true;
      this.error = null;
      
      try {
        // Lire et analyser le fichier
        const importedPackage = await packageService.importPackage(file);
        
        // Vérifier si un package avec le même ID existe déjà
        const existingIndex = this.packages.findIndex(pkg => pkg.id === importedPackage.id);
        
        if (existingIndex !== -1) {
          // Package existe déjà, retourner une erreur
          return {
            success: false,
            errorCode: 'errors.package.already_exists',
            data: null
          };
        }
        
        // Ajouter le package via l'API (createPackage utilise l'API)
        const result = await this.createPackage(importedPackage);
        
        if (result.success) {
          // Rafraîchir la liste des packages depuis le serveur
          await this.fetchPackages();
          
          return {
            success: true,
            data: importedPackage,
            isUpdate: false
          };
        } else {
          // Si la création a échoué, propager l'erreur
          return result;
        }
      } catch (error) {
        console.error('Error importing package:', error);
        const errorCode = extractErrorCode(error, 'import_failed', 'package');
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
     * Vérifie si une fonction avec l'ID donné existe dans un package
     * @param {string} packageId - ID du package
     * @param {string} functionId - ID de la fonction
     * @returns {boolean} true si la fonction existe
     */
    functionExists(packageId, functionId) {
      const pkg = this.getPackageById(packageId);
      if (!pkg || !Array.isArray(pkg.functions)) {
        return false;
      }
      
      return pkg.functions.some(func => func.id === functionId || func.name === functionId);
    },
    
    /**
     * Crée une fonction dans un package existant.
     * @param {string} packageId - ID du package
     * @param {Object} functionData - Données de la fonction
     * @returns {Promise<Object>} Résultat avec le package mis à jour ou code d'erreur
     */
    async createFunction(packageId, functionData) {
      this.loading = true;
      this.error = null;
      
      try {
        const pkg = this.getPackageById(packageId);
        
        if (!pkg) {
          throw { code: 'package.not_found' };
        }
        
        // Vérifier si une fonction avec le même ID existe déjà
        if (this.functionExists(packageId, functionData.id)) {
          throw new Error('duplicate_function');
        }
        
        // Ajouter la fonction au package
        const updatedPackage = {
          ...pkg,
          functions: [...pkg.functions, functionData]
        };
        
        // Mettre à jour le package
        return await this.updatePackage(packageId, updatedPackage);
      } catch (error) {
        console.error('Error creating function:', error);
        
        let errorCode;
        if (error.message === 'duplicate_function') {
          errorCode = 'errors.package.duplicate_function';
        } else {
          errorCode = extractErrorCode(error, 'function_creation_failed', 'package');
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
     * Met à jour une fonction existante dans un package.
     * @param {string} packageId - ID du package
     * @param {string} functionId - ID de la fonction
     * @param {Object} functionData - Nouvelles données de la fonction
     * @returns {Promise<Object>} Résultat avec le package mis à jour ou code d'erreur
     */
    async updateFunction(packageId, functionId, functionData) {
      this.loading = true;
      this.error = null;
      
      try {
        const pkg = this.getPackageById(packageId);
        
        if (!pkg) {
          throw { code: 'package.not_found' };
        }
        
        // Trouver et mettre à jour la fonction
        const functionIndex = pkg.functions.findIndex(f => f.id === functionId);
        
        if (functionIndex === -1) {
          throw new Error('missing_function');
        }
        
        // Vérifier si le nouvel ID de fonction existe déjà (si modifié)
        if (functionData.id !== functionId && this.functionExists(packageId, functionData.id)) {
          throw new Error('duplicate_function');
        }
        
        // Créer un nouveau tableau de fonctions avec la fonction mise à jour
        const updatedFunctions = [...pkg.functions];
        updatedFunctions[functionIndex] = {
          ...updatedFunctions[functionIndex],
          ...functionData
        };
        
        // Mettre à jour le package
        const updatedPackage = {
          ...pkg,
          functions: updatedFunctions
        };
        
        return await this.updatePackage(packageId, updatedPackage);
      } catch (error) {
        console.error('Error updating function:', error);
        
        let errorCode;
        if (error.message === 'duplicate_function') {
          errorCode = 'errors.package.duplicate_function';
        } else if (error.message === 'missing_function') {
          errorCode = 'errors.package.missing_function';
        } else {
          errorCode = extractErrorCode(error, 'function_update_failed', 'package');
        }
        
        this.error = errorCode;
        
        return {
          success: false,
          errorCode
        };
      }
    }
  }
});