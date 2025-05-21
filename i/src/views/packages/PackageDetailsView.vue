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
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
            {{ packageData.label || packageData.name }}
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {{ packageData.description || t('packages.noDescription') }}
          </p>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span class="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded mr-2">
              ID: {{ packageData.id }}
            </span>
            <span class="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
              {{ packageData.functions?.length || 0 }} {{ t('packages.function.title').toLowerCase() }}
            </span>
          </div>
        </div>
        <div class="flex space-x-3">
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
            <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400">
              {{ t('packages.function.noFunctions') }}
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
            <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400">
              {{ t('packages.variable.noVariables') }}
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
            <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400">
              {{ t('packages.struct.noStructs') }}
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

// Définition des onglets
const tabs = [
  { id: 'functions', label: t('packages.function.title') },
  { id: 'variables', label: t('packages.variable.title') },
  { id: 'structs', label: t('packages.struct.title') }
];

const packageFunctions = computed(() => {
  if (!packageData.value || !Array.isArray(packageData.value.functions)) {
    return [];
  }
  return packageData.value.functions;
});

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