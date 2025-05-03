import apiClient from './api.config';

// Simuler une API d'authentification (à remplacer par une API réelle)
// Cette version utilise le localStorage pour simuler une API
class AuthServiceMock {
  static mockStorage = {
    users: localStorage.getItem('mock_users') 
      ? JSON.parse(localStorage.getItem('mock_users')) 
      : {
        'admin@example.com': {
          id: '1',
          email: 'admin@example.com',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          organization: 'Smart Legal Contract',
          createdAt: new Date().toISOString(),
          profilePicture: null
        },
        'user@example.com': {
          id: '2',
          email: 'user@example.com',
          password: 'user123',
          firstName: 'Regular',
          lastName: 'User',
          role: 'user',
          organization: 'Client Company',
          createdAt: new Date().toISOString(),
          profilePicture: null
        }
      }
  };

  static async login(email, password) {
    // Simuler une latence réseau
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = this.mockStorage.users[email];
    if (user && user.password === password) {
      // Générer un "token" JWT simulé
      const token = btoa(JSON.stringify({
        sub: user.id,
        email: user.email,
        role: user.role,
        exp: Date.now() + 3600000 // Expire dans 1 heure
      }));

      return { token, user: { ...user, password: undefined } };
    }

    // Simuler une erreur d'authentification
    throw new Error('INVALID_CREDENTIALS');
  }

  static async register(userData) {
    // Simuler une latence réseau
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Vérifier si l'email existe déjà
    if (this.mockStorage.users[userData.email]) {
      throw new Error('EMAIL_EXISTS');
    }

    // Créer un nouvel utilisateur
    const newUser = {
      id: Date.now().toString(),
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'user', // Les nouveaux utilisateurs ont le rôle 'user' par défaut
      organization: userData.organization || '',
      createdAt: new Date().toISOString(),
      profilePicture: null
    };

    // Ajouter l'utilisateur au stockage
    this.mockStorage.users[userData.email] = newUser;
    
    // Persister dans localStorage
    localStorage.setItem('mock_users', JSON.stringify(this.mockStorage.users));

    return { success: true, user: { ...newUser, password: undefined } };
  }

  static async getProfile() {
    // Simuler une latence réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    // Récupérer le token depuis le localStorage
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (!token) return null;

    try {
      // Décoder le token pour obtenir les informations de l'utilisateur
      const payload = JSON.parse(atob(token));
      
      // Vérifier si le token a expiré
      if (payload.exp < Date.now()) {
        throw new Error('TOKEN_EXPIRED');
      }

      // Récupérer l'utilisateur par son email
      const userList = Object.values(this.mockStorage.users);
      const user = userList.find(u => u.id === payload.sub);

      if (!user) return null;

      // Retourner les informations de l'utilisateur sans le mot de passe
      return { ...user, password: undefined };
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }

  static async updateProfile(userData) {
    // Simuler une latence réseau
    await new Promise(resolve => setTimeout(resolve, 800));

    // Récupérer l'utilisateur actuel
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (!token) return null;

    try {
      // Décoder le token pour obtenir les informations de l'utilisateur
      const payload = JSON.parse(atob(token));
      
      // Trouver l'utilisateur par son email
      const userList = Object.values(this.mockStorage.users);
      const user = userList.find(u => u.id === payload.sub);
      const userEmail = user.email;

      if (!user) return null;

      // Mettre à jour les données de l'utilisateur
      this.mockStorage.users[userEmail] = {
        ...this.mockStorage.users[userEmail],
        firstName: userData.firstName || user.firstName,
        lastName: userData.lastName || user.lastName,
        organization: userData.organization,
        profilePicture: userData.profilePicture
      };

      // Si l'email a changé, mettre à jour la clé
      if (userData.email && userData.email !== userEmail) {
        this.mockStorage.users[userData.email] = { ...this.mockStorage.users[userEmail], email: userData.email };
        delete this.mockStorage.users[userEmail];
      }

      // Persister dans localStorage
      localStorage.setItem('mock_users', JSON.stringify(this.mockStorage.users));

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return false;
    }
  }

  static async logout() {
    // Simuler une latence réseau
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  }
}

// Implémentation avec une API réelle (à utiliser lorsque le backend est prêt)
class AuthServiceReal {
  static async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  static async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  }

  static async getProfile() {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  }

  static async updateProfile(userData) {
    try {
      const response = await apiClient.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  }
}

// Exporter le service mock pour le développement
// Plus tard, vous pourrez facilement basculer vers le service réel
export const AuthService = AuthServiceMock;