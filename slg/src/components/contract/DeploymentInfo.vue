// src/components/contract/DeploymentInfo.vue
<template>
  <div class="deployment-info bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
      Informations de déploiement
    </h3>
    
    <div v-if="!deploymentInfo" class="text-center py-4">
      <p class="text-gray-500 dark:text-gray-400">
        Aucune information de déploiement disponible.
      </p>
    </div>
    
    <div v-else class="space-y-4">
      <!-- En-tête avec résumé -->
      <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
        <p class="text-green-700 dark:text-green-300 font-medium">
          <LucideCheckCircle class="w-5 h-5 inline-block mr-1" />
          Contrat déployé avec succès
        </p>
      </div>
      
      <!-- Détails des contrats déployés -->
      <div v-for="(info, automatonName) in deploymentInfo" :key="automatonName" class="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div class="flex justify-between items-center mb-2">
          <h4 class="font-medium text-blue-600 dark:text-blue-400">
            {{ formatAutomatonName(automatonName) }}
          </h4>
          <span class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
            Smart Contract
          </span>
        </div>
        
        <div class="space-y-2 text-sm">
          <!-- Adresse du contrat -->
          <div class="flex flex-col sm:flex-row sm:items-center py-1 border-b border-gray-100 dark:border-gray-700">
            <span class="font-medium text-gray-600 dark:text-gray-400 sm:w-24">Adresse:</span>
            <code class="mt-1 sm:mt-0 font-mono text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded text-gray-800 dark:text-gray-300 break-all">
              {{ info.address }}
            </code>
          </div>
          
       
        </div>
      </div>
      
      <!-- Boutons d'action -->
      <div class="flex justify-end space-x-3 pt-2">
        <button 
          @click="copyToClipboard(JSON.stringify(deploymentInfo, null, 2))"
          class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center"
        >
          <LucideClipboard class="w-4 h-4 mr-1" />
          Copier les infos
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { LucideCheckCircle, LucideClipboard } from 'lucide-vue-next';
import toast from '@/composables/Toast/useToast';

const props = defineProps({
  deploymentInfo: {
    type: Object,
    default: null
  }
});

// Formater le nom de l'automate pour l'affichage
const formatAutomatonName = (name) => {
  if (!name) return 'Contrat';
  
  // Transformer "Automata0" en "Clause 1"
  if (name.startsWith('Automata')) {
    const num = name.replace('Automata', '');
    if (!isNaN(parseInt(num))) {
      return `Clause ${parseInt(num) + 1}`;
    }
  }
  
  return name;
};

// Copier les informations dans le presse-papier
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Informations copiées dans le presse-papier');
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    toast.error('Impossible de copier les informations');
  }
};
</script>

<style scoped>
.deployment-info {
  max-width: 100%;
  overflow-x: auto;
}
</style>