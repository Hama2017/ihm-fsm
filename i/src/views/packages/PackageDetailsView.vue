<template>
    <div class="package-details-container">
      <div v-if="isLoading" class="loading-container">
        <ui-loading :visible="true" message="Chargement des détails du package..." />
      </div>
  
      <div v-else-if="error" class="error-container">
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong class="font-bold">Erreur : </strong>
          <span class="block sm:inline">{{ error }}</span>
        </div>
      </div>
  
      <div v-else-if="packageData" class="package-details bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ packageData.label || packageData.name }}
            </h1>
            <p v-if="packageData.description" class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {{ packageData.description }}
            </p>
          </div>
          <div class="flex space-x-3">
            <router-link 
              :to="{ name: 'package-edit', params: { id: packageData.name } }"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200 shadow-sm"
            >
              <LucideEdit class="h-4 w-4" />
              <span>Modifier</span>
            </router-link>
            <button 
              @click="exportPackage"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200 shadow-sm"
            >
              <LucideDownload class="h-4 w-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
          <div class="flex border-b border-gray-200 dark:border-gray-700">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="[
                'px-4 py-2 text-sm font-medium border-b-2 focus:outline-none transition',
                currentTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="p-4">
            <!-- Fonctions -->
            <div v-if="currentTab === 'functions'" class="space-y-4">
              <div 
                v-if="packageData.functions && Object.keys(packageData.functions).length"
                v-for="(func, funcKey) in packageData.functions" 
                :key="funcKey" 
                class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
              >
                <div class="flex justify-between items-center mb-2">
                  <h3 class="text-md font-semibold text-gray-800 dark:text-gray-200">
                    {{ func.label || funcKey }}
                  </h3>
                  <span v-if="func.default" class="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                    Fonction par défaut
                  </span>
                </div>
                
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {{ func.description || 'Aucune description' }}
                </p>
                
                <div class="bg-white dark:bg-gray-800 p-2 rounded text-xs text-gray-600 dark:text-gray-300 font-mono overflow-x-auto">
                  <pre class="whitespace-pre-wrap break-words">{{ func.code }}</pre>
                </div>
              </div>
              <div v-else class="text-gray-500 dark:text-gray-400">
                Aucune fonction définie
              </div>
            </div>

            <!-- Variables -->
            <div v-if="currentTab === 'variables'" class="space-y-4">
              <div 
                v-if="packageData.variables && packageData.variables.length"
                v-for="(variable, index) in packageData.variables" 
                :key="index" 
                class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
              >
                <h3 class="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {{ variable.name }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {{ variable.description || 'Aucune description' }}
                </p>
                <div class="bg-white dark:bg-gray-800 p-2 rounded text-xs text-gray-600 dark:text-gray-300 font-mono overflow-x-auto">
                  <pre class="whitespace-pre-wrap break-words">{{ variable.code }}</pre>
                </div>
              </div>
              <div v-else class="text-gray-500 dark:text-gray-400">
                Aucune variable définie
              </div>
            </div>

            <!-- Structures -->
            <div v-if="currentTab === 'structs'" class="space-y-4">
              <div 
                v-if="packageData.structs && packageData.structs.length"
                v-for="(struct, index) in packageData.structs" 
                :key="index" 
                class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
              >
                <h3 class="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {{ struct.name }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {{ struct.description || 'Aucune description' }}
                </p>
                <div class="bg-white dark:bg-gray-800 p-2 rounded text-xs text-gray-600 dark:text-gray-300 font-mono overflow-x-auto">
                  <pre class="whitespace-pre-wrap break-words">{{ struct.code }}</pre>
                </div>
              </div>
              <div v-else class="text-gray-500 dark:text-gray-400">
                Aucune structure définie
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import packageService from '@/services/packageService';
  import UiLoading from '@/components/ui/UiLoading.vue';
  import { 
    LucideEdit, 
    LucideDownload 
  } from 'lucide-vue-next';
  import { useToast } from '@/composables/Toast/useToast';
  
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  
  const packageData = ref(null);
  const isLoading = ref(true);
  const error = ref(null);
  const currentTab = ref('functions');
  
  // Définition des onglets
  const tabs = [
    { id: 'functions', label: 'Fonctions' },
    { id: 'variables', label: 'Variables' },
    { id: 'structs', label: 'Structures' }
  ];
  
  onMounted(async () => {
    try {
      const packageName = route.params.id;
      packageData.value = await packageService.getPackage(packageName);

      console.log(JSON.stringify(packageData.value, null, 2));
      
    } catch (err) {
      console.error('Error fetching package details:', err);
      error.value = 'Impossible de charger les détails du package';
    } finally {
      isLoading.value = false;
    }
  });
  
  function exportPackage() {
    try {
      const url = packageService.exportPackage(packageData.value);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${packageData.value.name}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);
      
      toast.success(`Package "${packageData.value.label || packageData.value.name}" exporté avec succès`);
    } catch (error) {
      console.error('Error exporting package:', error);
      toast.error('Erreur lors de l\'exportation du package');
    }
  }
  </script>