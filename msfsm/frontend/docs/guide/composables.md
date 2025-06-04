# Guide des Composables

Les composables sont au cœur de l'architecture de Smart Legal Contract. Ils encapsulent la logique réactive et métier de l'application, permettant une réutilisabilité maximale entre les composants.

## 🎯 Qu'est-ce qu'un composable ?

Un composable est une fonction qui utilise la Composition API de Vue 3 pour encapsuler et réutiliser de la logique avec état. Dans SLC, ils servent de pont entre les composants Vue et les stores Pinia.

## 📋 Liste des composables

### 🔧 Composables utilitaires

#### useLayout.js
Gestion de l'état de l'interface utilisateur (sidebar, modales, etc.)

```javascript
import { ref, computed } from 'vue'

export function useLayout() {
  const sidebarOpen = ref(false)
  const sidebarCollapsed = ref(false)
  const currentModal = ref(null)
  
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }
  
  const collapseSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  const openModal = (modalName) => {
    currentModal.value = modalName
  }
  
  const closeModal = () => {
    currentModal.value = null
  }
  
  const sidebarClasses = computed(() => ({
    'sidebar-open': sidebarOpen.value,
    'sidebar-collapsed': sidebarCollapsed.value
  }))
  
  return {
    sidebarOpen,
    sidebarCollapsed,
    currentModal,
    sidebarClasses,
    toggleSidebar,
    collapseSidebar,
    openModal,
    closeModal
  }
}
```

**Utilisation :**
```vue
<script setup>
import { useLayout } from '@/composables/useLayout'

const { sidebarOpen, toggleSidebar, openModal } = useLayout()
</script>
```

#### useToast.js
Système de notifications toast

```javascript
import { ref, reactive } from 'vue'

export function useToast() {
  const toasts = ref([])
  
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now()
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
      visible: true
    }
    
    toasts.value.push(toast)
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }
  
  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  const success = (message, duration) => addToast(message, 'success', duration)
  const error = (message, duration) => addToast(message, 'error', duration)
  const warning = (message, duration) => addToast(message, 'warning', duration)
  const info = (message, duration) => addToast(message, 'info', duration)
  
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}
```

#### useState.js
Gestion d'état local avec persistence

```javascript
import { ref, watch } from 'vue'

export function useState(key, defaultValue = null, persistent = false) {
  const getValue = () => {
    if (persistent && typeof window !== 'undefined') {
      const stored = localStorage.getItem(key)
      try {
        return stored ? JSON.parse(stored) : defaultValue
      } catch {
        return defaultValue
      }
    }
    return defaultValue
  }
  
  const state = ref(getValue())
  
  if (persistent) {
    watch(state, (newValue) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(newValue))
      }
    }, { deep: true })
  }
  
  const setState = (value) => {
    state.value = value
  }
  
  const resetState = () => {
    state.value = defaultValue
  }
  
  return {
    state,
    setState,
    resetState
  }
}
```

### 🔐 Composables d'authentification

#### useAuth.js
Gestion de l'authentification et des permissions

```javascript
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  
  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const token = computed(() => authStore.token)
  
  const login = async (credentials) => {
    try {
      await authStore.login(credentials)
      router.push('/dashboard')
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Erreur de connexion' 
      }
    }
  }
  
  const logout = async () => {
    try {
      await authStore.logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }
  
  const hasRole = (role) => {
    return user.value?.roles?.includes(role) || false
  }
  
  const hasPermission = (permission) => {
    return user.value?.permissions?.includes(permission) || false
  }
  
  const can = (action, resource) => {
    const permission = `${action}:${resource}`
    return hasPermission(permission)
  }
  
  return {
    user,
    isAuthenticated,
    token,
    login,
    logout,
    hasRole,
    hasPermission,
    can
  }
}
```

### 📄 Composables métier

#### useContracts.js
Gestion des contrats

```javascript
import { computed, ref } from 'vue'
import { useContractStore } from '@/stores/contracts'
import { useToast } from './useToast'
import { useI18n } from 'vue-i18n'

export function useContracts() {
  const contractStore = useContractStore()
  const { success, error } = useToast()
  const { t } = useI18n()
  
  const loading = ref(false)
  const contracts = computed(() => contractStore.contracts)
  const currentContract = computed(() => contractStore.currentContract)
  
  const fetchContracts = async (filters = {}) => {
    loading.value = true
    try {
      await contractStore.fetchContracts(filters)
    } catch (err) {
      error(t('contracts.fetchError'))
    } finally {
      loading.value = false
    }
  }
  
  const createContract = async (contractData) => {
    loading.value = true
    try {
      const contract = await contractStore.createContract(contractData)
      success(t('contracts.created'))
      return contract
    } catch (err) {
      error(t('contracts.createError'))
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const updateContract = async (id, data) => {
    loading.value = true
    try {
      const contract = await contractStore.updateContract(id, data)
      success(t('contracts.updated'))
      return contract
    } catch (err) {
      error(t('contracts.updateError'))
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const deleteContract = async (id) => {
    try {
      await contractStore.deleteContract(id)
      success(t('contracts.deleted'))
    } catch (err) {
      error(t('contracts.deleteError'))
      throw err
    }
  }
  
  const executeContract = async (id, action) => {
    loading.value = true
    try {
      await contractStore.executeAction(id, action)
      success(t('contracts.actionExecuted'))
    } catch (err) {
      error(t('contracts.actionError'))
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    contracts,
    currentContract,
    loading,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    executeContract
  }
}
```

#### useAutomate.js
Gestion des automates et workflows VueFlow

```javascript
import { ref, computed, nextTick } from 'vue'
import { useVueFlow } from '@vueflow/core'

export function useAutomate() {
  const { 
    addNodes, 
    addEdges, 
    removeNodes, 
    removeEdges,
    findNode,
    findEdge,
    getNodes,
    getEdges 
  } = useVueFlow()
  
  const selectedNode = ref(null)
  const selectedEdge = ref(null)
  const isEditing = ref(false)
  
  const nodes = computed(() => getNodes.value)
  const edges = computed(() => getEdges.value)
  
  const addState = (position, data = {}) => {
    const newNode = {
      id: `state-${Date.now()}`,
      type: 'state',
      position,
      data: {
        label: data.label || 'Nouvel état',
        type: data.type || 'intermediate',
        color: data.color || '#3b82f6',
        ...data
      }
    }
    
    addNodes([newNode])
    return newNode
  }
  
  const addTransition = (source, target, data = {}) => {
    const newEdge = {
      id: `transition-${Date.now()}`,
      source,
      target,
      type: 'smoothstep',
      data: {
        label: data.label || 'Transition',
        condition: data.condition || '',
        action: data.action || '',
        ...data
      }
    }
    
    addEdges([newEdge])
    return newEdge
  }
  
  const updateNode = (nodeId, updates) => {
    const node = findNode(nodeId)
    if (node) {
      node.data = { ...node.data, ...updates }
    }
  }
  
  const updateEdge = (edgeId, updates) => {
    const edge = findEdge(edgeId)
    if (edge) {
      edge.data = { ...edge.data, ...updates }
    }
  }
  
  const deleteNode = (nodeId) => {
    removeNodes([nodeId])
    // Supprimer aussi les edges connectés
    const connectedEdges = edges.value.filter(
      edge => edge.source === nodeId || edge.target === nodeId
    )
    removeEdges(connectedEdges.map(edge => edge.id))
  }
  
  const deleteEdge = (edgeId) => {
    removeEdges([edgeId])
  }
  
  const selectNode = (node) => {
    selectedNode.value = node
    selectedEdge.value = null
  }
  
  const selectEdge = (edge) => {
    selectedEdge.value = edge
    selectedNode.value = null
  }
  
  const clearSelection = () => {
    selectedNode.value = null
    selectedEdge.value = null
  }
  
  const exportAutomate = () => {
    return {
      nodes: nodes.value,
      edges: edges.value,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
    }
  }
  
  const importAutomate = async (automateData) => {
    // Nettoyer l'automate actuel
    removeNodes(nodes.value.map(n => n.id))
    removeEdges(edges.value.map(e => e.id))
    
    // Attendre le prochain tick pour s'assurer que le nettoyage est terminé
    await nextTick()
    
    // Importer les nouveaux nœuds et edges
    if (automateData.nodes) {
      addNodes(automateData.nodes)
    }
    if (automateData.edges) {
      addEdges(automateData.edges)
    }
  }
  
  const validateAutomate = () => {
    const errors = []
    
    // Vérifier qu'il y a au moins un état initial
    const initialStates = nodes.value.filter(n => n.data.type === 'initial')
    if (initialStates.length === 0) {
      errors.push('Aucun état initial défini')
    }
    if (initialStates.length > 1) {
      errors.push('Plusieurs états initiaux définis')
    }
    
    // Vérifier qu'il y a au moins un état final
    const finalStates = nodes.value.filter(n => n.data.type === 'final')
    if (finalStates.length === 0) {
      errors.push('Aucun état final défini')
    }
    
    // Vérifier que tous les nœuds sont connectés
    nodes.value.forEach(node => {
      const hasIncoming = edges.value.some(e => e.target === node.id)
      const hasOutgoing = edges.value.some(e => e.source === node.id)
      
      if (node.data.type !== 'initial' && !hasIncoming) {
        errors.push(`L'état "${node.data.label}" n'a pas de transition entrante`)
      }
      if (node.data.type !== 'final' && !hasOutgoing) {
        errors.push(`L'état "${node.data.label}" n'a pas de transition sortante`)
      }
    })
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  return {
    nodes,
    edges,
    selectedNode,
    selectedEdge,
    isEditing,
    addState,
    addTransition,
    updateNode,
    updateEdge,
    deleteNode,
    deleteEdge,
    selectNode,
    selectEdge,
    clearSelection,
    exportAutomate,
    importAutomate,
    validateAutomate
  }
}
```

### 🔍 Composables de validation

#### useValidation.js
Validation de formulaires avec règles réutilisables

```javascript
import { ref, computed, reactive } from 'vue'

export function useValidation(rules = {}) {
  const errors = reactive({})
  const touched = reactive({})
  
  const validate = (field, value) => {
    const fieldRules = rules[field]
    if (!fieldRules) return true
    
    touched[field] = true
    errors[field] = []
    
    for (const rule of fieldRules) {
      const result = rule.validator(value)
      if (!result) {
        errors[field].push(rule.message)
      }
    }
    
    return errors[field].length === 0
  }
  
  const validateAll = (data) => {
    let isValid = true
    
    Object.keys(rules).forEach(field => {
      const fieldValid = validate(field, data[field])
      if (!fieldValid) isValid = false
    })
    
    return isValid
  }
  
  const getFieldError = (field) => {
    return touched[field] && errors[field]?.[0]
  }
  
  const hasError = (field) => {
    return touched[field] && errors[field]?.length > 0
  }
  
  const clearErrors = () => {
    Object.keys(errors).forEach(key => {
      errors[key] = []
    })
    Object.keys(touched).forEach(key => {
      touched[key] = false
    })
  }
  
  const isFormValid = computed(() => {
    return Object.keys(rules).every(field => 
      !touched[field] || errors[field]?.length === 0
    )
  })
  
  return {
    errors,
    touched,
    validate,
    validateAll,
    getFieldError,
    hasError,
    clearErrors,
    isFormValid
  }
}

// Règles de validation prédéfinies
export const validationRules = {
  required: (message = 'Ce champ est requis') => ({
    validator: (value) => value !== null && value !== undefined && value !== '',
    message
  }),
  
  email: (message = 'Email invalide') => ({
    validator: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return !value || emailRegex.test(value)
    },
    message
  }),
  
  minLength: (min, message) => ({
    validator: (value) => !value || value.length >= min,
    message: message || `Minimum ${min} caractères`
  }),
  
  maxLength: (max, message) => ({
    validator: (value) => !value || value.length <= max,
    message: message || `Maximum ${max} caractères`
  }),
  
  numeric: (message = 'Doit être un nombre') => ({
    validator: (value) => !value || !isNaN(Number(value)),
    message
  })
}
```

#### useConfirmation.js
Gestion des modales de confirmation

```javascript
import { ref } from 'vue'

export function useConfirmation() {
  const isVisible = ref(false)
  const title = ref('')
  const message = ref('')
  const confirmText = ref('Confirmer')
  const cancelText = ref('Annuler')
  const variant = ref('primary') // 'primary', 'danger', 'warning'
  const resolveCallback = ref(null)
  
  const confirm = (options = {}) => {
    return new Promise((resolve) => {
      title.value = options.title || 'Confirmation'
      message.value = options.message || 'Êtes-vous sûr ?'
      confirmText.value = options.confirmText || 'Confirmer'
      cancelText.value = options.cancelText || 'Annuler'
      variant.value = options.variant || 'primary'
      resolveCallback.value = resolve
      isVisible.value = true
    })
  }
  
  const handleConfirm = () => {
    isVisible.value = false
    if (resolveCallback.value) {
      resolveCallback.value(true)
      resolveCallback.value = null
    }
  }
  
  const handleCancel = () => {
    isVisible.value = false
    if (resolveCallback.value) {
      resolveCallback.value(false)
      resolveCallback.value = null
    }
  }
  
  return {
    isVisible,
    title,
    message,
    confirmText,
    cancelText,
    variant,
    confirm,
    handleConfirm,
    handleCancel
  }
}
```

### 📊 Composables de données

#### useHistory.js
Gestion de l'historique et undo/redo

```javascript
import { ref, computed } from 'vue'

export function useHistory(maxSize = 50) {
  const history = ref([])
  const currentIndex = ref(-1)
  
  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)
  const currentState = computed(() => 
    currentIndex.value >= 0 ? history.value[currentIndex.value] : null
  )
  
  const pushState = (state, description = '') => {
    // Supprimer l'historique après l'index actuel
    history.value = history.value.slice(0, currentIndex.value + 1)
    
    // Ajouter le nouvel état
    history.value.push({
      state: JSON.parse(JSON.stringify(state)), // Deep clone
      description,
      timestamp: Date.now()
    })
    
    // Limiter la taille de l'historique
    if (history.value.length > maxSize) {
      history.value.shift()
    } else {
      currentIndex.value++
    }
  }
  
  const undo = () => {
    if (canUndo.value) {
      currentIndex.value--
      return currentState.value?.state
    }
    return null
  }
  
  const redo = () => {
    if (canRedo.value) {
      currentIndex.value++
      return currentState.value?.state
    }
    return null
  }
  
  const clear = () => {
    history.value = []
    currentIndex.value = -1
  }
  
  const getHistory = () => {
    return history.value.map((item, index) => ({
      ...item,
      isCurrent: index === currentIndex.value
    }))
  }
  
  return {
    canUndo,
    canRedo,
    currentState,
    pushState,
    undo,
    redo,
    clear,
    getHistory
  }
}
```

#### useI18n.js
Gestion de l'internationalisation

```javascript
import { computed } from 'vue'
import { useI18n as useVueI18n } from 'vue-i18n'

export function useI18n() {
  const { t, locale, availableLocales } = useVueI18n()
  
  const currentLocale = computed(() => locale.value)
  const isRTL = computed(() => ['ar', 'he', 'fa'].includes(locale.value))
  
  const setLocale = (newLocale) => {
    if (availableLocales.includes(newLocale)) {
      locale.value = newLocale
      // Sauvegarder dans localStorage
      localStorage.setItem('locale', newLocale)
      // Mettre à jour l'attribut lang du document
      document.documentElement.lang = newLocale
    }
  }
  
  const formatDate = (date, options = {}) => {
    return new Intl.DateTimeFormat(locale.value, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }).format(new Date(date))
  }
  
  const formatNumber = (number, options = {}) => {
    return new Intl.NumberFormat(locale.value, options).format(number)
  }
  
  const formatCurrency = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency
    }).format(amount)
  }
  
  const formatRelativeTime = (date) => {
    const rtf = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })
    const diff = Date.now() - new Date(date).getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return rtf.format(-days, 'day')
    if (hours > 0) return rtf.format(-hours, 'hour')
    if (minutes > 0) return rtf.format(-minutes, 'minute')
    return rtf.format(-seconds, 'second')
  }
  
  return {
    t,
    currentLocale,
    isRTL,
    availableLocales,
    setLocale,
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime
  }
}
```

## 🎯 Bonnes pratiques

### 1. Conventions de nommage
```javascript
// ✅ Bon
export function useContractValidation() { ... }
export function useUserProfile() { ... }

// ❌ Mauvais
export function contractValidation() { ... }
export function userProfileComposable() { ... }
```

### 2. Retour de valeurs cohérent
```javascript
// ✅ Bon - retourne un objet avec des propriétés nommées
return {
  data,
  loading,
  error,
  refresh,
  create,
  update,
  delete
}

// ❌ Mauvais - retourne un tableau
return [data, loading, error, refresh]
```

### 3. Gestion d'erreurs centralisée
```javascript
export function useApiCall() {
  const { error: showError } = useToast()
  
  const apiCall = async (fn) => {
    try {
      return await fn()
    } catch (error) {
      showError(error.message || 'Une erreur est survenue')
      throw error
    }
  }
  
  return { apiCall }
}
```

### 4. Tests des composables
```javascript
// tests/composables/useAuth.test.js
import { describe, it, expect } from 'vitest'
import { useAuth } from '@/composables/useAuth'

describe('useAuth', () => {
  it('should return authentication state', () => {
    const { isAuthenticated, user } = useAuth()
    
    expect(isAuthenticated.value).toBe(false)
    expect(user.value).toBe(null)
  })
})
```

Les composables de SLC offrent une API cohérente et puissante pour gérer toute la logique de l'application de manière réutilisable et testable.