# Architecture du projet

Cette page détaille l'architecture de Smart Legal Contract, ses patterns et ses conventions de développement.

## 🏗️ Vue d'ensemble

Smart Legal Contract suit une architecture moderne basée sur Vue.js 3 avec une séparation claire des responsabilités :

```
┌─────────────────────────────────────────────────────────────┐
│                    Présentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │     Views       │  │   Components    │  │   Layouts    │ │
│  │  (Pages/Routes) │  │   (UI/Business) │  │  (Structure) │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    Logic Layer                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Composables   │  │     Stores      │  │   Services   │ │
│  │ (Reactive Logic)│  │  (State Mgmt)   │  │ (API Calls)  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │      API        │  │   Local Storage │  │    Utils     │ │
│  │   (Backend)     │  │   (Persistence) │  │  (Helpers)   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Structure des dossiers

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base
│   │   ├── UiButton.vue
│   │   ├── UiModal.vue
│   │   └── UiInput.vue
│   ├── business/       # Composants métier
│   │   ├── ContractCard.vue
│   │   ├── AutomateEditor.vue
│   │   └── UserProfile.vue
│   └── layout/         # Composants de mise en page
│       ├── Header.vue
│       ├── Sidebar.vue
│       └── Footer.vue
│
├── views/              # Pages/Vues principales
│   ├── auth/           # Pages d'authentification
│   ├── dashboard/      # Tableau de bord
│   ├── contracts/      # Gestion des contrats
│   ├── profile/        # Profil utilisateur
│   └── admin/          # Interface d'administration
│
├── composables/        # Logique réactive partagée
│   ├── useAuth.js      # Authentification
│   ├── useContracts.js # Gestion des contrats
│   ├── useLayout.js    # Interface utilisateur
│   └── useValidation.js # Validation des formulaires
│
├── stores/             # State management (Pinia)
│   ├── auth.js         # Store d'authentification
│   ├── contracts.js    # Store des contrats
│   ├── ui.js           # Store de l'interface
│   └── index.js        # Configuration Pinia
│
├── services/           # Communication API
│   ├── api.js          # Configuration Axios
│   ├── authService.js  # Services d'auth
│   ├── contractService.js # Services contrats
│   └── userService.js  # Services utilisateurs
│
├── utils/              # Utilitaires et helpers
│   ├── helpers.js      # Fonctions utilitaires
│   ├── constants.js    # Constantes globales
│   ├── validators.js   # Validateurs
│   └── formatters.js   # Formatage des données
│
├── locales/            # Internationalisation
│   ├── fr.json         # Traductions françaises
│   ├── en.json         # Traductions anglaises
│   └── index.js        # Configuration i18n
│
├── assets/             # Ressources statiques
│   ├── images/         # Images et icônes
│   ├── styles/         # Styles globaux
│   └── fonts/          # Polices personnalisées
│
├── router/             # Configuration des routes
│   ├── index.js        # Routes principales
│   ├── guards.js       # Guards de navigation
│   └── middleware.js   # Middleware de routes
│
└── plugins/            # Configuration des plugins
    ├── i18n.js         # Configuration i18n
    ├── vueflow.js      # Configuration VueFlow
    └── toast.js        # Configuration des notifications
```

## 🔄 Flux de données

### 1. Architecture unidirectionnelle

```
┌───────────┐    ┌──────────────┐    ┌─────────────┐
│    Vue    │───▶│ Composables  │───▶│   Stores    │
│Components │    │              │    │   (Pinia)   │
└───────────┘    └──────────────┘    └─────────────┘
       ▲                                      │
       │                                      ▼
┌───────────┐    ┌──────────────┐    ┌─────────────┐
│    UI     │◀───│   Reactive   │◀───│   Services  │
│  Updates  │    │   Updates    │    │  (API Calls)│
└───────────┘    └──────────────┘    └─────────────┘
```

### 2. Exemple de flux complet

```javascript
// 1. Action utilisateur dans un composant
const handleCreateContract = async () => {
  // 2. Appel du composable
  const { createContract } = useContracts()
  
  // 3. Le composable utilise le store
  await createContract(contractData)
}

// 4. Le store fait appel au service
// stores/contracts.js
const createContract = async (data) => {
  const contract = await contractService.create(data)
  contracts.value.push(contract)
  return contract
}

// 5. Le service communique avec l'API
// services/contractService.js
const create = async (data) => {
  const response = await api.post('/contracts', data)
  return response.data
}
```

## 🧩 Patterns architecturaux

### 1. Composition API Pattern

Utilisation systématique de la Composition API pour une meilleure réutilisabilité :

```javascript
// composables/useContracts.js
export function useContracts() {
  const store = useContractStore()
  const { t } = useI18n()
  
  const contracts = computed(() => store.contracts)
  const loading = computed(() => store.loading)
  
  const createContract = async (data) => {
    try {
      await store.createContract(data)
      toast.success(t('contract.created'))
    } catch (error) {
      toast.error(t('contract.error'))
    }
  }
  
  return {
    contracts,
    loading,
    createContract
  }
}
```

### 2. Store Pattern (Pinia)

State management centralisé avec Pinia :

```javascript
// stores/auth.js
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  
  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    user.value = data.user
    token.value = data.token
    localStorage.setItem('token', data.token)
  }
  
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }
  
  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout
  }
})
```

### 3. Service Pattern

Séparation des préoccupations pour les appels API :

```javascript
// services/contractService.js
class ContractService {
  async getAll(params = {}) {
    const response = await api.get('/contracts', { params })
    return response.data
  }
  
  async getById(id) {
    const response = await api.get(`/contracts/${id}`)
    return response.data
  }
  
  async create(data) {
    const response = await api.post('/contracts', data)
    return response.data
  }
  
  async update(id, data) {
    const response = await api.put(`/contracts/${id}`, data)
    return response.data
  }
  
  async delete(id) {
    await api.delete(`/contracts/${id}`)
  }
}

export default new ContractService()
```

### 4. Component Pattern

Composants modulaires et réutilisables :

```vue
<!-- components/ui/UiButton.vue -->
<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <UiSpinner v-if="loading" class="mr-2" />
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: Boolean,
  loading: Boolean
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  return [base, variants[props.variant], sizes[props.size]]
})

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
```

## 🔒 Sécurité et authentification

### 1. Guards de navigation

```javascript
// router/guards.js
export const requireAuth = (to, from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.isAuthenticated) {
    next()
  } else {
    next('/auth/login')
  }
}

export const requireRole = (role) => (to, from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.user?.role === role) {
    next()
  } else {
    next('/unauthorized')
  }
}
```

### 2. Intercepteurs API

```javascript
// services/api.js
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/auth/login')
    }
    return Promise.reject(error)
  }
)
```

## 🎨 Design System

### 1. Tokens de design

```javascript
// utils/designTokens.js
export const colors = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a'
  },
  gray: {
    50: '#f9fafb',
    500: '#6b7280',
    900: '#111827'
  }
}

export const spacing = {
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem'
}

export const typography = {
  h1: 'text-3xl font-bold',
  h2: 'text-2xl font-semibold',
  body: 'text-base',
  caption: 'text-sm text-gray-600'
}
```

### 2. Composants UI standardisés

Tous les composants UI suivent des conventions strictes :
- Props typées et validées
- Slots pour la flexibilité
- Classes Tailwind cohérentes
- Support du thème sombre/clair
- Accessibilité (ARIA)

## 📊 Performance et optimisation

### 1. Lazy loading des routes

```javascript
// router/index.js
const routes = [
  {
    path: '/dashboard',
    component: () => import('../views/DashboardView.vue')
  },
  {
    path: '/contracts',
    component: () => import('../views/ContractsView.vue')
  }
]
```

### 2. Code splitting par fonctionnalité

```javascript
// Chargement conditionnel des composants lourds
const AutomateEditor = defineAsyncComponent(() =>
  import('../components/AutomateEditor.vue')
)
```

### 3. Optimisation des bundles

Configuration Vite pour optimiser la taille des bundles :

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['@vueflow/core', '@vueflow/controls'],
        }
      }
    }
  }
})
```

Cette architecture garantit une application maintenable, scalable et performante, tout en respectant les meilleures pratiques de Vue.js 3.