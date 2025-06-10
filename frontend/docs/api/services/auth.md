# AuthService

Le service d'authentification gère toutes les opérations liées à l'authentification des utilisateurs en utilisant des cookies HTTP-only pour une sécurité maximale.

## 🎯 Vue d'ensemble

L'AuthService utilise une approche moderne basée sur des **cookies HTTP-only** au lieu des JWT stockés côté client, offrant une sécurité renforcée contre les attaques XSS.

## 📋 Interface du service

```javascript
// services/authService.js
import apiClient from './api.config';

/**
 * Service d'authentification pour gérer la connexion, l'inscription et les sessions utilisateur.
 * Utilise des cookies HTTP-only pour la gestion de session côté client.
 */
const AuthService = {
  // Méthodes d'authentification
}
```

## 🔐 Configuration sécurisée

### Cookies HTTP-only
- **Avantage** : Impossible d'accéder aux tokens via JavaScript
- **Protection** : Contre les attaques XSS
- **Gestion automatique** : Le navigateur envoie automatiquement les cookies
- **Refresh automatique** : Géré par l'intercepteur API

### Configuration API
- **withCredentials: true** : Envoi automatique des cookies
- **X-API-KEY** : Clé API ajoutée automatiquement
- **Refresh automatique** : En cas d'expiration du token

## 🔑 Méthodes d'authentification

### login(email, password)
Authentifie un utilisateur avec ses identifiants

```javascript
/**
 * Connecte un utilisateur avec ses identifiants.
 * Le serveur configurera automatiquement les cookies HTTP-only pour l'authentification.
 * 
 * @param {string} email - Adresse email de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 * @returns {Promise<Object>} Données de l'utilisateur connecté
 * @throws {Error} Erreur en cas d'échec
 */
async login(email, password) {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    // Simplement transmettre l'erreur d'API pour traitement par le store
    throw error;
  }
}
```

**Exemple d'utilisation :**
```javascript
try {
  const result = await AuthService.login('user@example.com', 'password123');
  console.log('Utilisateur connecté:', result.user);
  // Les cookies HTTP-only sont automatiquement configurés
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Identifiants incorrects');
  } else {
    console.error('Erreur de connexion:', error.message);
  }
}
```

### register(userData)
Enregistre un nouvel utilisateur

```javascript
/**
 * Inscrit un nouvel utilisateur.
 * @param {Object} userData - Données du nouvel utilisateur
 * @param {string} userData.firstName - Prénom
 * @param {string} userData.lastName - Nom
 * @param {string} userData.email - Email
 * @param {string} userData.password - Mot de passe
 * @returns {Promise<Object>} Résultat de l'inscription
 * @throws {Error} Erreur en cas d'échec
 */
async register(userData) {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
}
```

**Exemple d'utilisation :**
```javascript
try {
  const newUser = await AuthService.register({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    password: 'MotDePasseSecurise123'
  });
  console.log('Utilisateur créé:', newUser);
} catch (error) {
  if (error.response?.status === 422) {
    console.error('Données invalides:', error.response.data.errors);
  }
}
```

### logout()
Déconnecte l'utilisateur et supprime les cookies de session

```javascript
/**
 * Déconnecte l'utilisateur actuel (supprime les cookies de session côté serveur).
 * @returns {Promise<Object>} Confirmation de déconnexion
 * @throws {Error} Erreur en cas d'échec
 */
async logout() {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error;
  }
}
```

## 👤 Gestion du profil utilisateur

### fetchCurrentUser()
Récupère les informations de l'utilisateur connecté

```javascript
/**
 * Récupère les informations de l'utilisateur actuellement connecté.
 * Utilise le cookie HTTP-only pour l'authentification.
 * 
 * @returns {Promise<Object>} Données de l'utilisateur
 * @throws {Error} Erreur en cas d'échec
 */
async fetchCurrentUser() {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
}
```

### refreshToken()
Rafraîchit le token d'authentification

```javascript
/**
 * Rafraîchit le token d'authentification stocké dans les cookies HTTP-only.
 * @returns {Promise<Object>} Confirmation de rafraîchissement
 * @throws {Error} Erreur en cas d'échec
 */
async refreshToken() {
  try {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  } catch (error) {
    throw error;
  }
}
```

## 🔄 Gestion automatique des tokens

### Intercepteur de requêtes
L'`apiClient` gère automatiquement l'authentification :

```javascript
// Dans api.config.js
apiClient.interceptors.request.use(
  config => {
    // Ajouter la clé API à chaque requête
    config.headers['X-API-KEY'] = import.meta.env.VITE_API_KEY || 'pk_master_admin';
    
    // Pas besoin d'ajouter manuellement le token d'authentification
    // Les cookies HTTP-only sont automatiquement envoyés par le navigateur
    
    return config;
  },
  error => {
    console.error('Erreur de préparation de la requête:', error);
    return Promise.reject(error);
  }
);
```

### Intercepteur de réponses avec refresh automatique

```javascript
// Variables pour gérer la file d'attente des requêtes
let isRefreshing = false;
let failedQueue = [];

// Liste des chemins qui ne nécessitent pas de rafraîchissement de token
const noNeedToRefresh = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
];

/**
 * Traite la file d'attente des requêtes ayant échoué
 * @param {Error} error - L'erreur à rejeter si le rafraîchissement a échoué
 * @param {boolean} success - Indique si le rafraîchissement a réussi
 */
function processQueue(error, success = false) {
  failedQueue.forEach(p => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve();
    }
  });
  failedQueue = [];
}

// Intercepteur pour gérer les erreurs et le rafraîchissement des tokens
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Si c'est une erreur 401 et que ce n'est pas une demande d'authentification
    if (
      error.response?.status === 401 &&
      !noNeedToRefresh.some(path => originalRequest.url.includes(path)) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      
      // Si un rafraîchissement est déjà en cours, mettre la requête en file d'attente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }
      
      isRefreshing = true;
      
      try {
        // Tenter de rafraîchir le token via les cookies HTTP-only
        await apiClient.post('/auth/refresh');
        
        // Le cookie est automatiquement mis à jour par le serveur
        processQueue(null, true);
        
        // Réexécuter la requête originale maintenant que le cookie est rafraîchi
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        processQueue(refreshError);
        
        // Rediriger vers la page de connexion
        router.push({ 
          name: 'login',
          query: { redirect: router.currentRoute.value.fullPath }
        });
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 🛡️ Avantages de sécurité

### Protection contre XSS
- **Cookies HTTP-only** : Inaccessibles via JavaScript
- **Pas de stockage local** : Aucun token en localStorage/sessionStorage
- **Automatic handling** : Le navigateur gère l'envoi automatiquement

### Gestion des sessions
- **Expiration automatique** : Côté serveur uniquement
- **Refresh transparent** : L'utilisateur ne voit aucune interruption
- **Logout sécurisé** : Suppression côté serveur garantie

### Configuration CORS
```javascript
// Configuration requise côté serveur
{
  credentials: true,
  origin: ['http://localhost:3000'],
  allowedHeaders: ['Content-Type', 'X-API-KEY']
}
```

## 🚀 Exemple d'utilisation dans un store

```javascript
// stores/auth.js
import { defineStore } from 'pinia'
import AuthService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  
  const login = async (credentials) => {
    try {
      const result = await AuthService.login(credentials.email, credentials.password)
      user.value = result.user
      return { success: true, user: result.user }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur de connexion' 
      }
    }
  }
  
  const logout = async () => {
    try {
      await AuthService.logout()
      user.value = null
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      // Même si l'API échoue, on nettoie côté client
      user.value = null
    }
  }
  
  const fetchCurrentUser = async () => {
    try {
      const result = await AuthService.fetchCurrentUser()
      user.value = result.user
      return result.user
    } catch (error) {
      user.value = null
      throw error
    }
  }
  
  return {
    user,
    isAuthenticated,
    login,
    logout,
    fetchCurrentUser
  }
})
```

## 🧪 Exemple d'utilisation dans un composant

```vue
<template>
  <form @submit.prevent="handleLogin">
    <input v-model="email" type="email" required />
    <input v-model="password" type="password" required />
    <button type="submit" :disabled="loading">
      {{ loading ? 'Connexion...' : 'Se connecter' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  
  try {
    const result = await authStore.login({
      email: email.value,
      password: password.value
    })
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      console.error('Erreur:', result.error)
    }
  } catch (error) {
    console.error('Erreur de connexion:', error)
  } finally {
    loading.value = false
  }
}
</script>
```

L'AuthService avec cookies HTTP-only offre une sécurité maximale tout en simplifiant la gestion côté client grâce aux intercepteurs automatiques.# AuthService

Le service d'authentification gère toutes les opérations liées à l'authentification des utilisateurs, la gestion des sessions et la sécurité.

## 🎯 Vue d'ensemble

L'AuthService utilise une approche basée sur JWT (JSON Web Tokens) avec refresh tokens pour maintenir les sessions utilisateur de manière sécurisée.

## 📋 Interface du service

```javascript
// services/authService.js
class AuthService {
  constructor() {
    this.baseURL = '/api/auth'
    this.tokenKey = 'auth_token'
    this.refreshTokenKey = 'refresh_token'
  }
}
```

## 🔐 Méthodes d'authentification

### login(credentials)
Authentifie un utilisateur avec ses identifiants

```javascript
/**
 * Connecte un utilisateur
 * @param {Object} credentials - Identifiants de connexion
 * @param {string} credentials.email - Email de l'utilisateur
 * @param {string} credentials.password - Mot de passe
 * @param {boolean} credentials.remember - Se souvenir de la connexion
 * @returns {Promise<Object>} Données utilisateur et tokens
 */
async login(credentials) {
  try {
    const response = await api.post(`${this.baseURL}/login`, {
      email: credentials.email,
      password: credentials.password,
      remember: credentials.remember || false
    })
    
    const { user, token, refreshToken } = response.data
    
    // Stocker les tokens
    this.setTokens(token, refreshToken)
    
    // Configurer l'intercepteur pour les requêtes futures
    this.setupAuthInterceptor()
    
    return {
      user,
      token,
      success: true
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}
```

**Exemple d'utilisation :**
```javascript
const authService = new AuthService()

try {
  const result = await authService.login({
    email: 'user@example.com',
    password: 'password123',
    remember: true
  })
  
  console.log('Utilisateur connecté:', result.user)
} catch (error) {
  console.error('Erreur:', error.message)
}
```

### register(userData)
Enregistre un nouvel utilisateur

```javascript
/**
 * Enregistre un nouvel utilisateur
 * @param {Object} userData - Données d'inscription
 * @param {string} userData.firstName - Prénom
 * @param {string} userData.lastName - Nom
 * @param {string} userData.email - Email
 * @param {string} userData.password - Mot de passe
 * @param {string} userData.passwordConfirmation - Confirmation du mot de passe
 * @param {string} userData.company - Entreprise (optionnel)
 * @returns {Promise<Object>} Données utilisateur créé
 */
async register(userData) {
  try {
    const response = await api.post(`${this.baseURL}/register`, {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.passwordConfirmation,
      company: userData.company
    })
    
    const { user, token, refreshToken } = response.data
    
    // Auto-connexion après inscription
    this.setTokens(token, refreshToken)
    this.setupAuthInterceptor()
    
    return {
      user,
      token,
      success: true,
      message: 'Compte créé avec succès'
    }
  } catch (error) {
    const errors = error.response?.data?.errors || {}
    throw new Error(error.response?.data?.message || 'Erreur d\'inscription', errors)
  }
}
```

### logout()
Déconnecte l'utilisateur et invalide les tokens

```javascript
/**
 * Déconnecte l'utilisateur
 * @returns {Promise<void>}
 */
async logout() {
  try {
    // Invalider le token côté serveur
    const token = this.getToken()
    if (token) {
      await api.post(`${this.baseURL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
  } catch (error) {
    // Même si l'invalidation côté serveur échoue, on nettoie côté client
    console.warn('Erreur lors de la déconnexion côté serveur:', error)
  } finally {
    // Nettoyer côté client
    this.clearTokens()
    this.removeAuthInterceptor()
  }
}
```

## 🔄 Gestion des tokens

### setTokens(token, refreshToken)
Stocke les tokens de manière sécurisée

```javascript
/**
 * Stocke les tokens d'authentification
 * @param {string} token - JWT token
 * @param {string} refreshToken - Refresh token
 */
setTokens(token, refreshToken) {
  if (token) {
    localStorage.setItem(this.tokenKey, token)
  }
  
  if (refreshToken) {
    localStorage.setItem(this.refreshTokenKey, refreshToken)
  }
  
  // Décoder le token pour extraire les informations
  this.decodeToken(token)
}

/**
 * Décode le JWT token
 * @param {string} token - JWT token
 * @returns {Object} Payload décodé
 */
decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error)
    return null
  }
}
```

### refreshAccessToken()
Renouvelle le token d'accès

```javascript
/**
 * Renouvelle le token d'accès avec le refresh token
 * @returns {Promise<string>} Nouveau token d'accès
 */
async refreshAccessToken() {
  const refreshToken = this.getRefreshToken()
  
  if (!refreshToken) {
    throw new Error('Aucun refresh token disponible')
  }
  
  try {
    const response = await api.post(`${this.baseURL}/refresh`, {
      refresh_token: refreshToken
    })
    
    const { token, refreshToken: newRefreshToken } = response.data
    
    this.setTokens(token, newRefreshToken)
    
    return token
  } catch (error) {
    // Si le refresh échoue, déconnecter l'utilisateur
    this.clearTokens()
    throw new Error('Session expirée, veuillez vous reconnecter')
  }
}
```

### isTokenExpired()
Vérifie si le token est expiré

```javascript
/**
 * Vérifie si le token est expiré
 * @param {string} token - Token à vérifier
 * @returns {boolean} True si expiré
 */
isTokenExpired(token = null) {
  const tokenToCheck = token || this.getToken()
  
  if (!tokenToCheck) return true
  
  try {
    const payload = this.decodeToken(tokenToCheck)
    const currentTime = Math.floor(Date.now() / 1000)
    
    return payload.exp < currentTime
  } catch (error) {
    return true
  }
}
```

## 👤 Gestion du profil utilisateur

### getCurrentUser()
Récupère les informations de l'utilisateur connecté

```javascript
/**
 * Récupère le profil de l'utilisateur connecté
 * @returns {Promise<Object>} Profil utilisateur
 */
async getCurrentUser() {
  try {
    const response = await api.get(`${this.baseURL}/me`)
    return response.data.user
  } catch (error) {
    throw new Error('Impossible de récupérer le profil utilisateur')
  }
}
```

### updateProfile(userData)
Met à jour le profil utilisateur

```javascript
/**
 * Met à jour le profil utilisateur
 * @param {Object} userData - Nouvelles données utilisateur
 * @returns {Promise<Object>} Profil mis à jour
 */
async updateProfile(userData) {
  try {
    const response = await api.put(`${this.baseURL}/profile`, userData)
    return response.data.user
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour')
  }
}
```

### changePassword(passwordData)
Change le mot de passe utilisateur

```javascript
/**
 * Change le mot de passe de l'utilisateur
 * @param {Object} passwordData - Données de changement de mot de passe
 * @param {string} passwordData.currentPassword - Mot de passe actuel
 * @param {string} passwordData.newPassword - Nouveau mot de passe
 * @param {string} passwordData.confirmPassword - Confirmation du nouveau mot de passe
 * @returns {Promise<void>}
 */
async changePassword(passwordData) {
  try {
    await api.put(`${this.baseURL}/password`, {
      current_password: passwordData.currentPassword,
      password: passwordData.newPassword,
      password_confirmation: passwordData.confirmPassword
    })
    
    return { success: true, message: 'Mot de passe mis à jour avec succès' }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors du changement de mot de passe')
  }
}
```

## 🔑 Récupération de mot de passe

### forgotPassword(email)
Envoie un email de réinitialisation

```javascript
/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<void>}
 */
async forgotPassword(email) {
  try {
    await api.post(`${this.baseURL}/forgot-password`, { email })
    return { 
      success: true, 
      message: 'Email de réinitialisation envoyé' 
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email')
  }
}
```

### resetPassword(resetData)
Réinitialise le mot de passe avec un token

```javascript
/**
 * Réinitialise le mot de passe avec un token
 * @param {Object} resetData - Données de réinitialisation
 * @param {string} resetData.token - Token de réinitialisation
 * @param {string} resetData.email - Email de l'utilisateur
 * @param {string} resetData.password - Nouveau mot de passe
 * @param {string} resetData.passwordConfirmation - Confirmation
 * @returns {Promise<void>}
 */
async resetPassword(resetData) {
  try {
    await api.post(`${this.baseURL}/reset-password`, {
      token: resetData.token,
      email: resetData.email,
      password: resetData.password,
      password_confirmation: resetData.passwordConfirmation
    })
    
    return { 
      success: true, 
      message: 'Mot de passe réinitialisé avec succès' 
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la réinitialisation')
  }
}
```

## 🔧 Intercepteurs HTTP

### setupAuthInterceptor()
Configure l'intercepteur pour ajouter automatiquement le token

```javascript
/**
 * Configure l'intercepteur de requêtes pour l'authentification
 */
setupAuthInterceptor() {
  // Intercepteur de requête
  this.requestInterceptor = api.interceptors.request.use(
    (config) => {
      const token = this.getToken()
      if (token && !this.isTokenExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )
  
  // Intercepteur de réponse pour gérer les erreurs d'auth
  this.responseInterceptor = api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        
        try {
          // Tenter de renouveler le token
          await this.refreshAccessToken()
          
          // Relancer la requête originale avec le nouveau token
          const newToken = this.getToken()
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          
          return api(originalRequest)
        } catch (refreshError) {
          // Si le refresh échoue, rediriger vers la connexion
          this.clearTokens()
          window.location.href = '/auth/login'
          return Promise.reject(refreshError)
        }
      }
      
      return Promise.reject(error)
    }
  )
}
```

## 🛠️ Méthodes utilitaires

### Vérification d'état

```javascript
/**
 * Vérifie si l'utilisateur est connecté
 * @returns {boolean}
 */
isAuthenticated() {
  const token = this.getToken()
  return token && !this.isTokenExpired(token)
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 * @param {string} role - Rôle à vérifier
 * @returns {boolean}
 */
hasRole(role) {
  const token = this.getToken()
  if (!token) return false
  
  try {
    const payload = this.decodeToken(token)
    return payload.roles?.includes(role) || false
  } catch (error) {
    return false
  }
}

/**
 * Vérifie si l'utilisateur a une permission
 * @param {string} permission - Permission à vérifier
 * @returns {boolean}
 */
hasPermission(permission) {
  const token = this.getToken()
  if (!token) return false
  
  try {
    const payload = this.decodeToken(token)
    return payload.permissions?.includes(permission) || false
  } catch (error) {
    return false
  }
}
```

## 🔒 Gestion des erreurs

```javascript
/**
 * Formate les erreurs d'authentification
 * @param {Error} error - Erreur à formatter
 * @returns {Object} Erreur formatée
 */
formatAuthError(error) {
  const defaultMessage = 'Une erreur est survenue'
  
  if (!error.response) {
    return {
      message: 'Erreur de connexion au serveur',
      type: 'network'
    }
  }
  
  const { status, data } = error.response
  
  switch (status) {
    case 401:
      return {
        message: data.message || 'Identifiants incorrects',
        type: 'unauthorized'
      }
    case 422:
      return {
        message: data.message || 'Données invalides',
        type: 'validation',
        errors: data.errors || {}
      }
    case 429:
      return {
        message: 'Trop de tentatives, veuillez réessayer plus tard',
        type: 'rate_limit'
      }
    default:
      return {
        message: data.message || defaultMessage,
        type: 'server'
      }
  }
}
```

## 📱 Exemple d'utilisation complète

```javascript
// Dans un composant Vue
import { useAuthStore } from '@/stores/auth'
import authService from '@/services/authService'

export default {
  setup() {
    const authStore = useAuthStore()
    
    const handleLogin = async (credentials) => {
      try {
        const result = await authService.login(credentials)
        
        // Mettre à jour le store
        authStore.setUser(result.user)
        authStore.setToken(result.token)
        
        // Rediriger vers le dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Erreur de connexion:', error.message)
      }
    }
    
    const handleLogout = async () => {
      try {
        await authService.logout()
        authStore.clearAuth()
        router.push('/auth/login')
      } catch (error) {
        console.error('Erreur de déconnexion:', error.message)
      }
    }
    
    return {
      handleLogin,
      handleLogout
    }
  }
}
```