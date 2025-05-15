import { defineStore } from 'pinia';
import authService from '@/services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const user = await authService.login(email, password);
        this.user = user;
        return { success: true };
      } catch (error) {
        const code = error.response?.data?.detail?.code || 'unknown_error';
        this.error = code;
        return { success: false, code };
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        await authService.register(userData); // pas besoin de stocker les informations car si on le fait on  supposer qu'il est connecter 
        return { success: true };
      } catch (error) {
        const code = error.response?.data?.detail?.code || 'unknown_error';
        this.error = code;
        return { success: false, code };
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;
      this.error = null;
      try {
        await authService.logout();
        this.user = null;
        return { success: true };
      } catch (error) {
        const code = error.response?.data?.detail?.code || 'logout_failed';
        this.error = code;
        return { success: false, code };
      } finally {
        this.loading = false;
      }
    },

    async fetchUser() {
      this.loading = true;
      this.error = null;
    
      try {
        const user = await authService.fetchCurrentUser();
        this.user = user;
      } catch (error) {
        this.user = null;
        this.error = error.response?.data?.detail?.code || 'fetch_user_failed';
      } finally {
        this.loading = false;
      }
    }
    ,

    async updateProfile(data) {
      this.loading = true;
      this.error = null;
      try {
        const user = await authService.updateProfile(data);
        this.user = user;
        return { success: true };
      } catch (error) {
        const code = error.response?.data?.detail?.code || 'profile_update_failed';
        this.error = code;
        return { success: false, code };
      } finally {
        this.loading = false;
      }
    },

    async changePassword(oldPassword, newPassword) {
      this.loading = true;
      this.error = null;
      try {
        await authService.changePassword(oldPassword, newPassword);
        return { success: true };
      } catch (error) {
        const code = error.response?.data?.detail?.code || 'password_change_failed';
        this.error = code;
        return { success: false, code };
      } finally {
        this.loading = false;
      }
    }
  }
});
