import { defineStore } from 'pinia';
import profileService from '@/services/profileService';
import { extractErrorCode } from '@/utils/errorFormatter';
import { useAuthStore } from './AuthStore';

/**
 * Store Pinia pour la gestion du profil utilisateur.
 * Permet la mise à jour des informations de profil, la gestion du mot de passe
 * et des photos de profil.
 */
export const useProfileStore = defineStore('profile', {
  state: () => ({
    loading: false,
    error: null,
    uploadProgress: 0
  }),

  actions: {
    /**
     * Met à jour les informations du profil de l'utilisateur.
     * @param {Object} profileData - Données du profil à mettre à jour
     * @returns {Promise<Object>} Résultat de la mise à jour avec code d'erreur si échec
     */
    async updateProfile(profileData) {
      this.loading = true;
      this.error = null;
      
      try {
        const authStore = useAuthStore();
        const updatedUser = await profileService.updateProfile(profileData);
        
        // Mettre à jour l'utilisateur dans le store d'authentification
        authStore.user = {
          ...authStore.user,
          ...updatedUser
        };
      
        return {
          success: true,
          data: updatedUser
        };
      } catch (error) {
        // Utiliser l'utilitaire pour extraire et formater le code d'erreur
        const errorCode = extractErrorCode(error, 'profile_update_failed', 'auth');
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
     * Change le mot de passe de l'utilisateur.
     * @param {string} oldPassword - Mot de passe actuel
     * @param {string} newPassword - Nouveau mot de passe
     * @returns {Promise<Object>} Résultat du changement de mot de passe avec code d'erreur si échec
     */
    async changePassword(oldPassword, newPassword) {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await profileService.changePassword(oldPassword, newPassword);
        
        return {
          success: true,
          data: result
        };
      } catch (error) {
        // Mapper l'erreur spécifique si possible
        let errorCode;
        
        if (error.code === 'INCORRECT_PASSWORD') {
          errorCode = 'incorrect_current_password';
        } else {
          errorCode = extractErrorCode(error, 'password_update_failed', 'auth');
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
     * Télécharge une nouvelle photo de profil.
     * @param {File} file - Fichier image à télécharger
     * @returns {Promise<Object>} Résultat du téléchargement avec code d'erreur si échec
     */
    async uploadProfilePicture(file) {
      this.loading = true;
      this.error = null;
      this.uploadProgress = 0;
      
      try {
        const authStore = useAuthStore();
        
        // Vérifier le type du fichier
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('INVALID_FILE_FORMAT');
        }
        
        // Vérifier la taille du fichier (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error('FILE_TOO_LARGE');
        }
        
        const result = await profileService.uploadProfilePicture(file);
        
        // Mettre à jour l'avatar dans le store d'authentification
        if (authStore.user) {
          authStore.user = {
            ...authStore.user,
            profilePicture: result.filename
          };
        }
        
        return {
          success: true,
          data: result
        };
      } catch (error) {
        let errorCode;
        
        // Gestion spécifique pour les erreurs déjà identifiées
        if (error.message === 'INVALID_FILE_FORMAT') {
          errorCode = 'invalid_file_format';
        } else if (error.message === 'FILE_TOO_LARGE') {
          errorCode = 'file_too_large';
        } else {
          errorCode = extractErrorCode(error, 'upload_failed', 'auth');
        }
        
        this.error = errorCode;
        
        return {
          success: false,
          errorCode
        };
      } finally {
        this.loading = false;
        this.uploadProgress = 0;
      }
    },

    /**
     * Supprime la photo de profil de l'utilisateur.
     * @returns {Promise<Object>} Résultat de la suppression avec code d'erreur si échec
     */
    async deleteProfilePicture() {
      this.loading = true;
      this.error = null;
      
      try {
        const authStore = useAuthStore();
        const result = await profileService.deleteProfilePicture();
        
        // Mettre à jour l'avatar dans le store d'authentification
        if (authStore.user) {
          authStore.user = {
            ...authStore.user,
            profilePicture: null
          };
        }
        
        return {
          success: true,
          data: result
        };
      } catch (error) {
        const errorCode = extractErrorCode(error, 'profile_picture_deletion_failed', 'auth');
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