<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {{ isNewPackage ? 'Nouveau package' : 'Modifier le package' }}
      </h1>
      <router-link :to="{name: 'packages'}" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
        <LucideX class="w-5 h-5" />
      </router-link>
    </div>

    <!-- État de chargement initial -->
    <div v-if="isInitialLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p class="ml-4 text-gray-600 dark:text-gray-400">Chargement du package...</p>
    </div>

    <!-- Formulaire d'édition -->
    <package-form 
      v-else
      :package="currentPackage" 
      :is-new="isNewPackage"
      @save="savePackage"
      @cancel="cancelEdit"
    />

    <!-- Modal d'erreur -->
    <modal
      v-if="showErrorModal"
      v-model="showErrorModal"
      title="Erreur"
      variant="danger"
      :show-cancel="false"
      confirm-text="Fermer"
      @confirm="showErrorModal = false"
    >
      <p class="text-gray-700 dark:text-gray-300">
        {{ errorMessage }}
      </p>
    </modal>

    <!-- Écran de chargement -->
    <ui-loading 
      :visible="isLoading" 
      :message="loadingMessage"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import packageService from '@/services/packageService';
import { useToast } from '@/composables/Toast/useToast';
import PackageForm from '@/components/package/PackageForm.vue';
import Modal from '@/components/ui/UiModal.vue';
import UiLoading from '@/components/ui/UiLoading.vue';
import { LucideX } from 'lucide-vue-next';

// Router
const route = useRoute();
const router = useRouter();
const toast = useToast();

// État
const isInitialLoading = ref(true);
const isLoading = ref(false);
const loadingMessage = ref('Traitement en cours...');
const showErrorModal = ref(false);
const errorMessage = ref('');
const currentPackage = reactive({
  id: '',
  name: '',
  label: '',
  description: '',
  functions: [],
  variables: [],
  structs: []
});

// Computed
const isNewPackage = computed(() => route.name === 'package-new');
const packageId = computed(() => route.params.id);

// Méthodes
async function loadPackage() {
  if (isNewPackage.value) {
    // Nouveau package
    resetPackage();
    isInitialLoading.value = false;
  } else {
    try {
      isInitialLoading.value = true;
      
      const apiPackage = await packageService.getPackage(packageId.value);
      
      // Convertir au format interne
      const internalPackage = packageService.convertToInternalFormat(apiPackage);
      
      // Mettre à jour le package courant
      Object.assign(currentPackage, internalPackage);
      
      isInitialLoading.value = false;
    } catch (error) {
      console.error('Error loading package:', error);
      
      if (error.response && error.response.status === 404) {
        toast.error(`Le package "${packageId.value}" n'existe pas`);
        router.push({ name: 'packages' });
      } else {
        errorMessage.value = 'Erreur lors du chargement du package. Veuillez réessayer.';
        showErrorModal.value = true;
        isInitialLoading.value = false;
      }
    }
  }
}

function resetPackage() {
  Object.assign(currentPackage, {
    id: '',
    name: '',
    label: '',
    description: '',
    functions: [],
    variables: [],
    structs: []
  });
  
  // Ajouter une fonction vide par défaut
  if (currentPackage.functions.length === 0) {
    currentPackage.functions.push({
      id: '',
      name: '',
      label: '',
      description: '',
      code: '',
      default: false
    });
  }
}

async function savePackage(packageData) {
  try {
    // Activer l'écran de chargement
    isLoading.value = true;
    loadingMessage.value = isNewPackage.value ? 'Création du package...' : 'Mise à jour du package...';
    
    // Valider les données
    if (!packageData.id || !packageData.label) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      isLoading.value = false;
      return;
    }
    
    if (isNewPackage.value) {
      // Créer un nouveau package
      await packageService.createPackage(packageData);
      toast.success('Package créé avec succès');
    } else {
      // Mettre à jour le package
      await packageService.updatePackage(packageId.value, packageData);
      toast.success('Package mis à jour avec succès');
    }
    
    // Rediriger vers la liste (après un court délai pour voir l'animation)
    setTimeout(() => {
      isLoading.value = false;
      router.push({ name: 'packages' });
    }, 1500);
  } catch (error) {
    console.error('Error saving package:', error);
    
    if (error.response && error.response.status === 409) {
      toast.error(`Un package avec l'identifiant "${packageData.id}" existe déjà`);
    } else {
      errorMessage.value = 'Erreur lors de la sauvegarde du package. Veuillez réessayer.';
      showErrorModal.value = true;
    }
    isLoading.value = false;
  }
}

function cancelEdit() {
  router.push({ name: 'packages' });
}

// Lifecycle hooks
onMounted(async () => {
  await loadPackage();
});

// Surveillance des changements de route
watch(() => route.params.id, async () => {
  if (route.name === 'package-edit') {
    isInitialLoading.value = true;
    await loadPackage();
  }
});
</script>