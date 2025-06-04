<template>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-medium text-gray-900 dark:text-white">API Keys</h2>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center"
        >
          <LucidePlus class="h-4 w-4 mr-2" />
          <span>Nouvelle clé API</span>
        </button>
      </div>
  
      <!-- État de chargement ou liste vide -->
      <div v-if="isLoading" class="flex justify-center items-center py-8">
        <LucideLoader class="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <div v-else-if="apiKeys.length === 0" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-center">
        <LucideKey class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Aucune clé API</h3>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Créez une nouvelle clé API pour utiliser l'API.</p>
        <button
          @click="openCreateModal"
          class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          Créer une clé API
        </button>
      </div>
  
      <!-- Liste des API keys -->
      <div v-else class="space-y-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 p-3 rounded-md text-sm mb-3">
          <p class="flex items-center">
            <LucideInfo class="w-4 h-4 mr-2" />
            La clé d'API Master <span class="font-mono mx-1 bg-blue-100 dark:bg-blue-800 px-1 rounded">sk_master_admin</span> est utilisée par défaut pour toutes les requêtes.
          </p>
        </div>
  
        <div v-for="apiKey in apiKeys" :key="apiKey.key" class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div class="bg-gray-50 dark:bg-gray-700/50 p-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">{{ apiKey.app_name }}</h3>
                <div class="flex items-center mt-1">
                  <span 
                    class="text-xs px-2 py-0.5 rounded-full mr-2"
                    :class="apiKey.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'"
                  >
                    {{ apiKey.active ? 'Active' : 'Inactive' }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    Créée le {{ formatDate(apiKey.created_at) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="editApiKey(apiKey)"
                  class="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
                >
                  <LucidePencil class="w-4 h-4" />
                </button>
                <button
                  v-if="apiKey.active"
                  @click="confirmDisable(apiKey)"
                  class="p-2 text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors duration-200"
                >
                  <LucidePause class="w-4 h-4" />
                </button>
                <button
                  @click="confirmDelete(apiKey)"
                  class="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                >
                  <LucideTrash class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div class="p-4 border-t border-gray-200 dark:border-gray-700">
            <div class="mb-2">
              <div class="flex items-center justify-between mb-1">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Clé API</label>
                <button
                  @click="copyToClipboard(apiKey.key)"
                  class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Copier
                </button>
              </div>
              <div class="bg-gray-100 dark:bg-gray-900 rounded p-2 font-mono text-sm break-all">
                {{ apiKey.key }}
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Utilisation</label>
                <p class="text-gray-900 dark:text-white">{{ apiKey.usage_count }} requêtes</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Limite</label>
                <p class="text-gray-900 dark:text-white">{{ apiKey.usage_limit ? apiKey.usage_limit : 'Illimitée' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal de création/édition d'API key -->
      <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md relative animate-fadeIn">
          <button @click="closeCreateModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <LucideX class="w-5 h-5" />
          </button>
  
          <!-- Affichage de la nouvelle clé API créée -->
          <div v-if="newApiKey" class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nouvelle clé API créée</h2>
            
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 class="text-md font-medium text-blue-800 dark:text-blue-300 mb-2">Nom de l'application</h3>
              <p class="text-gray-900 dark:text-white mb-3">{{ newApiKey.app_name }}</p>
              
              <h3 class="text-md font-medium text-blue-800 dark:text-blue-300 mb-2">Clé API</h3>
              <div class="bg-white dark:bg-gray-900 p-2 rounded font-mono text-sm overflow-x-auto mb-2">
                {{ newApiKey.key }}
              </div>
              <p class="text-xs text-blue-600 dark:text-blue-400 mt-2 font-semibold">Copiez cette clé maintenant. Elle ne sera plus affichée entièrement.</p>
              
              <button 
                @click="copyToClipboard(newApiKey.key)" 
                class="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                <LucideCopy class="h-4 w-4 mr-2" />
                <span>Copier la clé API</span>
              </button>
            </div>
            
            <div class="flex justify-end space-x-3 mt-4">
              <button 
                @click="closeCreateModal"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors duration-200"
              >
                Fermer
              </button>
            </div>
          </div>
  
          <!-- Formulaire de création/édition -->
          <div v-else>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {{ editMode ? 'Modifier la clé API' : 'Créer une nouvelle clé API' }}
            </h2>
            
            <form @submit.prevent="submitApiKey" class="space-y-4">
              <div>
                <label for="app_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'application</label>
                <input 
                  type="text" 
                  id="app_name" 
                  v-model="apiKeyForm.app_name" 
                  required
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Frontend App, Mobile App, etc."
                >
              </div>
              
              <div>
                <label for="usage_limit" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Limite d'utilisation (optionnel)</label>
                <input 
                  type="number" 
                  id="usage_limit" 
                  v-model.number="apiKeyForm.usage_limit" 
                  min="0"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Laisser vide pour illimité"
                >
              </div>
              
              <div v-if="editMode" class="flex items-center">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="apiKeyForm.active" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Actif</span>
                </label>
              </div>
              
              <div class="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  @click="closeCreateModal"
                  class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  :disabled="isSubmitting"
                >
                  <LucideLoader v-if="isSubmitting" class="w-4 h-4 animate-spin mr-2 inline" />
                  {{ editMode ? 'Mettre à jour' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  
      <!-- Modal de confirmation -->
      <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md animate-fadeIn">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {{ confirmType === 'delete' ? 'Supprimer la clé API' : 'Désactiver la clé API' }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ confirmType === 'delete' 
              ? 'Êtes-vous sûr de vouloir supprimer cette clé API ? Cette action est irréversible.' 
              : 'Êtes-vous sûr de vouloir désactiver cette clé API ? Les applications utilisant cette clé ne pourront plus accéder à l\'API.' }}
          </p>
          <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4">
            <p class="font-medium text-gray-800 dark:text-gray-200">{{ selectedApiKey?.app_name }}</p>
            <p class="text-sm font-mono text-gray-600 dark:text-gray-400 truncate">{{ selectedApiKey?.key }}</p>
          </div>
          <div class="flex justify-end space-x-3">
            <button 
              @click="closeConfirmModal"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Annuler
            </button>
            <button 
              @click="confirmAction"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
              :class="confirmType === 'delete' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'"
              :disabled="isSubmitting"
            >
              <LucideLoader v-if="isSubmitting" class="w-4 h-4 animate-spin mr-2 inline" />
              {{ confirmType === 'delete' ? 'Supprimer' : 'Désactiver' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useApiKeysStore } from '@/stores/ApiKeysStore';
  import { storeToRefs } from 'pinia';
  import toast from '@/composables/Toast/useToast';
  import { 
    LucidePlus, 
    LucideKey, 
    LucidePencil, 
    LucidePause, 
    LucideTrash, 
    LucideX, 
    LucideLoader,
    LucideInfo,
    LucideCopy
  } from 'lucide-vue-next';
  
  // Store
  const apiKeysStore = useApiKeysStore();
  const { apiKeys, isLoading } = storeToRefs(apiKeysStore);
  
  // État local
  const showCreateModal = ref(false);
  const showConfirmModal = ref(false);
  const editMode = ref(false);
  const isSubmitting = ref(false);
  const selectedApiKey = ref(null);
  const confirmType = ref('delete'); // 'delete' ou 'disable'
  const newApiKey = ref(null);
  
  // Formulaire
  const apiKeyForm = reactive({
    app_name: '',
    active: true,
    usage_limit: null
  });
  
  // Charger les données
  onMounted(async () => {
    await apiKeysStore.fetchApiKeys();
  });
  
  // Méthodes
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Afficher une notification de succès avec toast
      toast.success('Clé API copiée dans le presse-papiers');
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
      toast.error('Impossible de copier la clé API');
    }
  };
  
  const openCreateModal = () => {
    editMode.value = false;
    apiKeyForm.app_name = '';
    apiKeyForm.active = true;
    apiKeyForm.usage_limit = null;
    newApiKey.value = null;
    showCreateModal.value = true;
  };
  
  const closeCreateModal = () => {
    showCreateModal.value = false;
    setTimeout(() => {
      newApiKey.value = null;
    }, 300);
  };
  
  const editApiKey = (apiKey) => {
    editMode.value = true;
    selectedApiKey.value = apiKey;
    apiKeyForm.app_name = apiKey.app_name;
    apiKeyForm.active = apiKey.active;
    apiKeyForm.usage_limit = apiKey.usage_limit;
    newApiKey.value = null;
    showCreateModal.value = true;
  };
  
  const submitApiKey = async () => {
    try {
      isSubmitting.value = true;
      
      if (editMode.value && selectedApiKey.value) {
        // Mettre à jour une clé existante
        await apiKeysStore.updateApiKey(selectedApiKey.value.key, {
          app_name: apiKeyForm.app_name,
          active: apiKeyForm.active,
          usage_limit: apiKeyForm.usage_limit
        });
        closeCreateModal();
      } else {
        // Créer une nouvelle clé
        const formData = {
          app_name: apiKeyForm.app_name,
          active: true,
          usage_limit: apiKeyForm.usage_limit
        };
        
        const createdKey = await apiKeysStore.createApiKey(formData);
        // Afficher simplement la nouvelle clé sans le formulaire
        newApiKey.value = createdKey;
      }
    } catch (error) {
      console.error('Erreur de soumission:', error);
    } finally {
      isSubmitting.value = false;
    }
  };
  
  const confirmDelete = (apiKey) => {
    selectedApiKey.value = apiKey;
    confirmType.value = 'delete';
    showConfirmModal.value = true;
  };
  
  const confirmDisable = (apiKey) => {
    selectedApiKey.value = apiKey;
    confirmType.value = 'disable';
    showConfirmModal.value = true;
  };
  
  const closeConfirmModal = () => {
    showConfirmModal.value = false;
    setTimeout(() => {
      selectedApiKey.value = null;
    }, 300);
  };
  
  const confirmAction = async () => {
    if (!selectedApiKey.value) return;
    
    try {
      isSubmitting.value = true;
      
      if (confirmType.value === 'delete') {
        await apiKeysStore.deleteApiKey(selectedApiKey.value.key);
      } else {
        await apiKeysStore.disableApiKey(selectedApiKey.value.key);
      }
      
      closeConfirmModal();
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    } finally {
      isSubmitting.value = false;
    }
  };
  </script>
  
  <style scoped>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  </style>