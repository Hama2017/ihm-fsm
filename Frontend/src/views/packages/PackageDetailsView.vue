<template>
  <div class="package-details-container">
    <div v-if="isLoading" class="loading-container">
      <div class="flex justify-center items-center min-h-[400px]">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mr-3"></div>
        <p class="text-gray-600 dark:text-gray-400">{{ t('common.loading') }}</p>
      </div>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">{{ t('common.error') }}: </strong>
        <span class="block sm:inline">{{ error }}</span>
        <button 
          @click="fetchPackageDetails" 
          class="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
        >
          {{ t('common.retry') }}
        </button>
      </div>
    </div>

    <div v-else-if="packageData" class="package-details bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-start mb-6">
        <div class="flex-1">
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {{ packageData.label || packageData.name }}
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {{ packageData.description || t('packages.noDescription') }}
          </p>
          
          <!-- Package Statistics -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <!-- Functions Count -->
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    {{ t('packages.function.title') }}
                  </p>
                  <p class="text-lg font-semibold text-blue-800 dark:text-blue-300">
                    {{ packageFunctions.length }}
                  </p>
                </div>
                <div class="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                  <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <p v-if="defaultFunctionsCount > 0" class="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {{ defaultFunctionsCount }} {{ t('packages.function.default').toLowerCase() }}
              </p>
            </div>

            <!-- Variables Count -->
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                    {{ t('packages.variable.title') }}
                  </p>
                  <p class="text-lg font-semibold text-green-800 dark:text-green-300">
                    {{ variablesCount }}
                  </p>
                </div>
                <div class="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                  <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Structures Count -->
            <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                    {{ t('packages.struct.title') }}
                  </p>
                  <p class="text-lg font-semibold text-purple-800 dark:text-purple-300">
                    {{ structsCount }}
                  </p>
                </div>
                <div class="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                  <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Total Elements -->
            <div class="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {{ t('packages.totalElements') }}
                  </p>
                  <p class="text-lg font-semibold text-gray-800 dark:text-gray-300">
                    {{ totalElements }}
                  </p>
                </div>
                <div class="p-2 bg-gray-100 dark:bg-gray-600/30 rounded-lg">
                  <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm8 6H7a1 1 0 100 2h5a1 1 0 100-2z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Package Metadata -->
          <div class="flex flex-wrap gap-2">
            <span class="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
              <span class="font-medium">ID:</span> {{ packageData.id }}
            </span>
            <span v-if="packageData.version" class="inline-block px-3 py-1 bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              <span class="font-medium">{{ t('packages.version') }}:</span> {{ packageData.version }}
            </span>
            <span v-if="packageData.author" class="inline-block px-3 py-1 bg-green-200 dark:bg-green-700 text-green-700 dark:text-green-300 rounded-full text-sm">
              <span class="font-medium">{{ t('packages.author') }}:</span> {{ packageData.author }}
            </span>
            <span v-if="packageData.createdAt" class="inline-block px-3 py-1 bg-purple-200 dark:bg-purple-700 text-purple-700 dark:text-purple-300 rounded-full text-sm">
              <span class="font-medium">{{ t('packages.created') }}:</span> {{ formatDate(packageData.createdAt) }}
            </span>
          </div>
        </div>
        
        <div class="flex space-x-3 ml-4">
          <router-link 
            :to="{ name: 'package-edit', params: { id: packageData.id } }"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200 shadow-sm"
          >
            <LucideEdit class="h-4 w-4" />
            <span>{{ t('common.edit') }}</span>
          </router-link>
          <button 
            @click="exportPackage"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200 shadow-sm"
          >
            <LucideDownload class="h-4 w-4" />
            <span>{{ t('common.export') }}</span>
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
              'px-4 py-2 text-sm font-medium border-b-2 focus:outline-none transition flex items-center space-x-2',
              currentTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            ]"
          >
            <span>{{ tab.label }}</span>
            <span 
              v-if="tab.count > 0"
              class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="p-4">
          <!-- Fonctions -->
          <div v-if="currentTab === 'functions'" class="space-y-4">
            <div v-if="packageFunctions.length > 0" class="space-y-4">
              <div 
                v-for="func in packageFunctions" 
                :key="func.id" 
                class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
              >
                <div class="flex justify-between items-center mb-2">
                  <h3 class="text-md font-semibold text-gray-800 dark:text-gray-200">
                    {{ func.label || func.name }}
                  </h3>
                  <div class="flex space-x-2">
                    <span v-if="func.default" class="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                      {{ t('packages.function.default') }}
                    </span>
                    <span class="text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                      ID: {{ func.name }}
                    </span>
                  </div>
                </div>
                
                <p v-if="func.description" class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {{ func.description }}
                </p>
                <p v-else class="text-sm italic text-gray-500 dark:text-gray-500 mb-3">
                  {{ t('packages.noDescription') }}
                </p>
                
                <div v-if="func.code" class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 font-mono overflow-x-auto">
                  <pre class="whitespace-pre-wrap break-words">{{ func.code }}</pre>
                </div>
                <div v-else class="text-sm italic text-gray-500 dark:text-gray-500">
                  {{ t('packages.function.noCode') }}
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-lg font-medium">{{ t('packages.function.noFunctions') }}</p>
              <p class="text-sm">{{ t('packages.function.noFunctionsDesc') }}</p>
            </div>
          </div>

          <!-- Variables -->
          <div v-if="currentTab === 'variables'" class="space-y-4">
            <div v-if="packageData.variables && packageData.variables.length > 0" class="space-y-4">
              <div 
                v-for="(variable, index) in packageData.variables" 
                :key="index" 
                class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
              >
                <h3 class="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {{ variable.name }}
                </h3>
                <p v-if="variable.description" class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {{ variable.description }}
                </p>
                <p v-else class="text-sm italic text-gray-500 dark:text-gray-500 mb-3">
                  {{ t('packages.noDescription') }}
                </p>
                
                <div v-if="variable.code" class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 font-mono overflow-x-auto">
                  <pre class="whitespace-pre-wrap break-words">{{ variable.code }}</pre>
                </div>
                <div v-else class="text-sm italic text-gray-500 dark:text-gray-500">
                  {{ t('packages.variable.noCode') }}
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p class="text-lg font-medium">{{ t('packages.variable.noVariables') }}</p>
              <p class="text-sm">{{ t('packages.variable.noVariablesDesc') }}</p>
            </div>
          </div>

          <!-- Structures -->
          <div v-if="currentTab === 'structs'" class="space-y-4">
            <div v-if="packageData.structs && packageData.structs.length > 0" class="space-y-4">
              <div 
                v-for="(struct, index) in packageData.structs" 
                :key="index" 
                class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
              >
                <h3 class="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {{ struct.name }}
                </h3>
                <p v-if="struct.description" class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {{ struct.description }}
                </p>
                <p v-else class="text-sm italic text-gray-500 dark:text-gray-500 mb-3">
                  {{ t('packages.noDescription') }}
                </p>
                
                <div v-if="struct.code" class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 font-mono overflow-x-auto">
                  <pre class="whitespace-pre-wrap break-words">{{ struct.code }}</pre>
                </div>
                <div v-else class="text-sm italic text-gray-500 dark:text-gray-500">
                  {{ t('packages.struct.noCode') }}
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p class="text-lg font-medium">{{ t('packages.struct.noStructs') }}</p>
              <p class="text-sm">{{ t('packages.struct.noStructsDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading overlay pour l'export -->
    <ui-loading 
      :visible="exporting" 
      :message="t('packages.exportingMessage')"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '@/composables/i18n/useI18n';
import { usePackageStore } from '@/stores/packageStore';
import { useToast } from '@/composables/Toast/useToast';
import packageService from '@/services/packageService';
import UiLoading from '@/components/ui/UiLoading.vue';
import { 
  LucideEdit, 
  LucideDownload 
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const packageStore = usePackageStore();
const toast = useToast();
const { t } = useI18n();

const packageData = ref(null);
const isLoading = ref(true);
const exporting = ref(false);
const error = ref(null);
const currentTab = ref('functions');

const packageFunctions = computed(() => {
  if (!packageData.value || !Array.isArray(packageData.value.functions)) {
    return [];
  }
  return packageData.value.functions;
});

const variablesCount = computed(() => {
  return packageData.value?.variables?.length || 0;
});

const structsCount = computed(() => {
  return packageData.value?.structs?.length || 0;
});

const defaultFunctionsCount = computed(() => {
  return packageFunctions.value.filter(func => func.default).length;
});

const totalElements = computed(() => {
  return packageFunctions.value.length + variablesCount.value + structsCount.value;
});

// Définition des onglets avec compteurs
const tabs = computed(() => [
  { 
    id: 'functions', 
    label: t('packages.function.title'),
    count: packageFunctions.value.length
  },
  { 
    id: 'variables', 
    label: t('packages.variable.title'),
    count: variablesCount.value
  },
  { 
    id: 'structs', 
    label: t('packages.struct.title'),
    count: structsCount.value
  }
]);

/**
 * Formate une date pour l'affichage
 */
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return dateString;
  }
}

/**
 * Récupère les détails du package à partir de l'ID dans la route
 */
async function fetchPackageDetails() {
  isLoading.value = true;
  error.value = null;
  
  try {
    const packageId = route.params.id;
    
    // Essayer d'abord de trouver le package dans le store
    let pkg = packageStore.getPackageById(packageId);
    
    if (pkg) {
      console.log('Package found in store:', pkg);
      packageData.value = pkg;
    } else {
      // Si pas dans le store, charger depuis l'API
      console.log('Package not found in store, fetching from API...');
      try {
        const apiPackage = await packageService.getPackage(packageId);
        console.log('API response:', apiPackage);
        
        // Convertir au format interne
        const internalPackage = packageService.convertToInternalFormat(apiPackage);
        packageData.value = internalPackage;
        
        // Ajouter au store si pas présent
        if (!packageStore.getPackageById(packageId)) {
          packageStore.packages.push(internalPackage);
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        throw apiError;
      }
    }
  } catch (err) {
    console.error('Error fetching package details:', err);
    error.value = t('errors.package.not_found');
  } finally {
    isLoading.value = false;
  }
}

/**
 * Exporte le package actuel au format JSON
 */
async function exportPackage() {
  if (!packageData.value) return;
  
  try {
    exporting.value = true;
    
    // Utiliser directement le service pour l'export
    const url = packageService.exportPackage(packageData.value);
    
    // Créer un lien pour télécharger le fichier
    const a = document.createElement('a');
    a.href = url;
    a.download = `${packageData.value.id}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Nettoyer
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);
    
    toast.success(t('packages.exportSuccess'));
  } catch (error) {
    console.error('Error exporting package:', error);
    toast.error(t('errors.package.export_failed'));
  } finally {
    // Ajouter un petit délai pour montrer l'animation
    setTimeout(() => {
      exporting.value = false;
    }, 1000);
  }
}

// Charger les détails au montage
onMounted(async () => {
  await fetchPackageDetails();
});
</script>