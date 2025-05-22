<template>
  <div class="space-y-4">
    <!-- Informations du contrat -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
      <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center">
        <LucideFileText class="w-4 h-4 mr-2" />
        Informations du contrat
      </h4>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between py-1">
          <span class="text-gray-600 dark:text-gray-400">Nom du contrat :</span>
          <span class="font-medium text-blue-700 dark:text-blue-300">{{ deploymentInfo?.contractName || 'Non disponible' }}</span>
        </div>
        <div class="flex justify-between py-1">
          <span class="text-gray-600 dark:text-gray-400">Identifiant :</span>
          <span class="font-mono text-xs text-gray-700 dark:text-gray-300">{{ deploymentInfo?.contractId || 'Non disponible' }}</span>
        </div>
        <div class="flex justify-between py-1">
          <span class="text-gray-600 dark:text-gray-400">Nombre de clauses :</span>
          <span class="font-medium text-blue-700 dark:text-blue-300">{{ deploymentInfo?.totalAutomates || 0 }}</span>
        </div>
        <div class="flex justify-between py-1">
          <span class="text-gray-600 dark:text-gray-400">Date de déploiement :</span>
          <span class="text-gray-700 dark:text-gray-300">{{ formatDate(deploymentInfo?.deployedAt) }}</span>
        </div>
        <div v-if="deploymentInfo?.deployedBy" class="flex justify-between py-1">
          <span class="text-gray-600 dark:text-gray-400">Déployé par :</span>
          <span class="text-gray-700 dark:text-gray-300">{{ deploymentInfo.deployedBy }}</span>
        </div>
        <div v-if="deploymentInfo?.network" class="flex justify-between py-1">
          <span class="text-gray-600 dark:text-gray-400">Réseau :</span>
          <span class="font-medium text-gray-800 dark:text-gray-200">{{ deploymentInfo.network }}</span>
        </div>
      </div>
    </div>

    <!-- Clauses déployées -->
    <div v-if="deploymentInfo?.automateNames?.length" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
      <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center">
        <LucideSettings class="w-4 h-4 mr-2" />
        Clauses déployées
      </h4>
      <div class="space-y-3">
        <div v-for="automate in deploymentInfo.automateNames" :key="automate.id" 
             class="bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-600 p-3">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Nom de la clause :</span>
              <span class="font-medium text-blue-800 dark:text-blue-200">{{ automate.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Identifiant :</span>
              <span class="font-mono text-xs text-gray-700 dark:text-gray-300">{{ automate.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Nombre d'états :</span>
              <span class="text-gray-700 dark:text-gray-300">{{ automate.statesCount || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Nombre de transitions :</span>
              <span class="text-gray-700 dark:text-gray-300">{{ automate.transitionsCount || 0 }}</span>
            </div>
            <div v-if="automate.contractAddress" class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Adresse du smart contract :</span>
              <div class="flex items-center">
                <code class="text-xs font-mono text-gray-800 dark:text-gray-200 mr-2">
                  {{ truncateAddress(automate.contractAddress) }}
                </code>
                <button 
                  @click="copyToClipboard(automate.contractAddress)"
                  class="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Copier l'adresse"
                >
                  <LucideCopy class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Informations techniques -->
    <div style="display: none;" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
      <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center">
        <LucideCode class="w-4 h-4 mr-2" />
        Informations techniques
      </h4>
      <div class="space-y-2 text-sm">
        <!-- Adresse du contrat principal -->
        <div v-if="deploymentInfo?.contractAddress && deploymentInfo.contractAddress !== 'Non disponible'" class="py-1">
          <div class="flex justify-between mb-1">
            <span class="text-gray-600 dark:text-gray-400">Adresse du contrat principal :</span>
          </div>
          <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-600 rounded">
            <code class="text-xs font-mono text-gray-800 dark:text-gray-200">
              {{ deploymentInfo.contractAddress }}
            </code>
            <button 
              @click="copyToClipboard(deploymentInfo.contractAddress)"
              class="ml-2 p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
              title="Copier l'adresse"
            >
              <LucideCopy class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Hash de transaction -->
        <div v-if="deploymentInfo?.transactionHash" class="py-1">
          <div class="flex justify-between mb-1">
            <span class="text-gray-600 dark:text-gray-400">Hash de transaction :</span>
          </div>
          <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-600 rounded">
            <code class="text-xs font-mono text-gray-800 dark:text-gray-200">
              {{ deploymentInfo.transactionHash }}
            </code>
            <button 
              @click="copyToClipboard(deploymentInfo.transactionHash)"
              class="ml-2 p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
              title="Copier le hash"
            >
              <LucideCopy class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Source contract -->
        <div v-if="deploymentInfo?.sourceContract" class="flex justify-between py-1">
          <span class="text-gray-600 dark:text-gray-400">Fichier source :</span>
          <span class="font-mono text-xs text-gray-800 dark:text-gray-200">{{ deploymentInfo.sourceContract }}</span>
        </div>

        <!-- Autres infos techniques -->
        <div v-if="deploymentInfo?.blockNumber" class="flex justify-between py-1">
          <span class="text-gray-600 dark:text-gray-400">Numéro de bloc :</span>
          <span class="font-mono text-gray-800 dark:text-gray-200">{{ deploymentInfo.blockNumber }}</span>
        </div>

        <div v-if="deploymentInfo?.gasUsed" class="flex justify-between py-1">
          <span class="text-gray-600 dark:text-gray-400">Gas utilisé :</span>
          <span class="font-mono text-gray-800 dark:text-gray-200">{{ formatNumber(deploymentInfo.gasUsed) }}</span>
        </div>
      </div>
    </div>

    <!-- Liens utiles -->
    <div style="display: none;" v-if="deploymentInfo?.contractAddress || deploymentInfo?.transactionHash" 
         class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
      <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center">
        <LucideExternalLink class="w-4 h-4 mr-2" />
        Liens utiles
      </h4>
      <div class="space-y-2">
        <a v-if="deploymentInfo?.contractAddress" 
           :href="getExplorerUrl('address', deploymentInfo.contractAddress)"
           target="_blank"
           class="flex items-center text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">
          <LucideExternalLink class="w-3 h-3 mr-2" />
          Voir le contrat sur l'explorateur
        </a>
        <a v-if="deploymentInfo?.transactionHash" 
           :href="getExplorerUrl('tx', deploymentInfo.transactionHash)"
           target="_blank"
           class="flex items-center text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">
          <LucideExternalLink class="w-3 h-3 mr-2" />
          Voir la transaction sur l'explorateur
        </a>
      </div>
    </div>

    <!-- Boutons d'actions -->
    <div class="flex flex-col sm:flex-row gap-3 pt-2">
      <button
        @click="downloadDeploymentResult"
        class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
      >
        <LucideDownload class="w-4 h-4 mr-2" />
        Télécharger le résultat (JSON)
      </button>
      
      <button  style="display: none;"
        @click="interactWithContract"
        class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
      >
        <LucidePlay class="w-4 h-4 mr-2" />
        Interagir avec le contrat
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  LucideFileText, 
  LucideSettings, 
  LucideCode, 
  LucideCopy, 
  LucideExternalLink,
  LucideDownload,
  LucidePlay
} from 'lucide-vue-next';
import toast from '@/composables/Toast/useToast';

const props = defineProps({
  deploymentInfo: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['interact-with-contract']);

/**
 * Formate une date en format lisible
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Formate un nombre avec des séparateurs de milliers
 */
const formatNumber = (number) => {
  if (!number) return 'N/A';
  return number.toLocaleString('fr-FR');
};

/**
 * Tronque une adresse pour l'affichage
 */
const truncateAddress = (address) => {
  if (!address) return '';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Copie du texte dans le presse-papiers
 */
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers');
  } catch (error) {
    console.error('Erreur lors de la copie:', error);
    toast.error('Erreur lors de la copie');
  }
};

/**
 * Génère l'URL de l'explorateur de blockchain
 */
const getExplorerUrl = (type, value) => {
  const baseUrl = 'https://etherscan.io';
  const network = props.deploymentInfo?.network?.toLowerCase();
  
  let explorerUrl = baseUrl;
  
  if (network === 'goerli') {
    explorerUrl = 'https://goerli.etherscan.io';
  } else if (network === 'sepolia') {
    explorerUrl = 'https://sepolia.etherscan.io';
  } else if (network === 'polygon') {
    explorerUrl = 'https://polygonscan.com';
  } else if (network === 'bsc') {
    explorerUrl = 'https://bscscan.com';
  }
  
  return `${explorerUrl}/${type}/${value}`;
};

/**
 * Télécharge le résultat du déploiement en JSON
 */
const downloadDeploymentResult = () => {
  try {
    const data = JSON.stringify(props.deploymentInfo, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `deployment-${props.deploymentInfo?.contractName || 'contract'}-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Résultat téléchargé avec succès');
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    toast.error('Erreur lors du téléchargement');
  }
};

/**
 * Interaction avec le contrat
 */
const interactWithContract = () => {
  emit('interact-with-contract');
};
</script>