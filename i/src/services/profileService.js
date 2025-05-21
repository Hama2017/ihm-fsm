import apiClient from './api.config';

/**
 * Service de gestion de profil utilisateur.
 * Permet la mise à jour des informations personnelles et la gestion du mot de passe.
 */
const ProfileService = {
  /**
   * Met à jour le profil de l'utilisateur connecté.
   * @param {Object} profileData - Nouvelles données du profil
   * @param {string} [profileData.firstName] - Prénom (optionnel)
   * @param {string} [profileData.lastName] - Nom (optionnel)
   * @param {string} [profileData.profilePicture] - Photo de profil (optionnel)
   * @returns {Promise<Object>} Profil mis à jour
   * @throws {Error} Erreur en cas d'échec
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.patch('/profile/', profileData);
      return response.data;
    } catch (error) {
      // Simplement transmettre l'erreur d'API pour traitement par le store
      throw error;
    }
  },

  /**
   * Change le mot de passe de l'utilisateur.
   * @param {string} oldPassword - Mot de passe actuel
   * @param {string} newPassword - Nouveau mot de passe
   * @returns {Promise<Object>} Confirmation du changement
   * @throws {Error} Erreur en cas d'échec
   */
  async changePassword(oldPassword, newPassword) {
    try {
      const response = await apiClient.post('/profile/change-password', {
        oldPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Télécharge une nouvelle photo de profil.
   * @param {File} file - Fichier image à télécharger
   * @returns {Promise<Object>} Informations sur la photo téléchargée
   * @throws {Error} Erreur en cas d'échec
   */
  async uploadProfilePicture(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Supprime la photo de profil de l'utilisateur.
   * @returns {Promise<Object>} Confirmation de la suppression
   * @throws {Error} Erreur en cas d'échec
   */
  async deleteProfilePicture() {
    try {
      const response = await apiClient.delete('/profile/picture');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default ProfileService;