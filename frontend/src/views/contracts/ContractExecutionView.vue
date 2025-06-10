<template>
  <div class="container mx-auto p-4">
    <!-- En-tête -->
    <div class="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Exécution du contrat : {{ contractName }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Interagissez avec votre contrat intelligent déployé sur la blockchain.
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="router.push({ name: 'contracts' })"
            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
          >
            <LucideArrowLeft class="w-4 h-4 mr-2" />
            Retour à la liste
          </button>
        </div>
      </div>
    </div>

    <!-- Flow de progression du contrat -->
    <FlowProgressViewer 
      v-if="deploymentFlowData"
      ref="flowProgressViewerRef"
      :contract-name="contractName"
      :contract-id="contractId"
      :flow-data="deploymentFlowData"
      class="mb-6"
      @automate-completed="onAutomateCompleted"
    />

    <div v-if="isLoading" class="text-center py-12">
      <LucideLoader class="w-12 h-12 mx-auto animate-spin text-blue-500 dark:text-blue-400 mb-4" />
      <p class="text-gray-600 dark:text-gray-400">Chargement des informations du contrat...</p>
    </div>

    <template v-else>
      <!-- Si aucune donnée n'est trouvée -->
      <div v-if="!deploymentInfo" class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <LucideFileQuestion class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Contrat non trouvé
        </h2>
        <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
          Les informations de déploiement pour ce contrat ne sont pas disponibles.
        </p>
        <button
          @click="router.push({ name: 'create-contract' })"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Créer un nouveau contrat
        </button>
      </div>

      <!-- Si des données sont trouvées -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne gauche: liste des automates -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Automates disponibles
            </h2>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500">
                {{ completedAutomatesCount }}/{{ totalAutomatesCount }} terminés
              </span>
            </div>
          </div>
          
          <div class="space-y-3">
            <div v-for="(info, clauseKey) in deploymentInfo" :key="clauseKey"
                 @click="selectClause(clauseKey)"
                 :class="[
                   'p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 relative',
                   selectedClause === clauseKey 
                     ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-md'
                     : getAutomateCardClass(clauseKey),
                   'hover:shadow-lg'
                 ]"
            >
              <!-- Badge de statut -->
              <div v-if="isAutomateCompleted(clauseKey)" 
                   class="absolute -top-2 -right-2 z-10">
                <div class="flex items-center bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                  <LucideCheck class="w-3 h-3 mr-1" />
                  Terminé
                </div>
              </div>

              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <h3 class="font-medium" :class="[
                      selectedClause === clauseKey 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : isAutomateCompleted(clauseKey)
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-gray-700 dark:text-gray-300'
                    ]">
                      {{ getAutomateName(clauseKey) }}
                    </h3>
                  </div>
                  
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ clauseKey }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {{ info.address }}
                  </p>
                  
                  <!-- Barre de progression -->
                  <div v-if="isAutomateCompleted(clauseKey)" class="mt-2">
                    <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                      <div class="h-1.5 rounded-full transition-all duration-500 bg-green-500" style="width: 100%"></div>
                    </div>
                  </div>
                </div>
                
                <LucideChevronRight 
                  v-if="selectedClause === clauseKey" 
                  class="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 ml-2" 
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne centrale: fonctions disponibles -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span>Fonctions disponibles</span>
            <span v-if="selectedClause" class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({{ getAutomateName(selectedClause) }})
            </span>
            <div v-if="selectedClause && isAutomateCompleted(selectedClause)" 
                 class="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
              ✓ Terminé
            </div>
          </h2>

          <div v-if="!selectedClause" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <LucideFileSearch class="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Veuillez sélectionner un automate pour voir les fonctions disponibles</p>
          </div>

          <div v-else-if="availableFunctions.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <LucideFileX class="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Aucune fonction disponible pour cet automate</p>
          </div>

          <div v-else class="space-y-3">
            <div v-for="func in availableFunctions" :key="func.name"
                 @click="selectFunction(func)"
                 :class="[
                   'p-3 rounded-lg cursor-pointer transition-all duration-300 border',
                   selectedFunction && selectedFunction.name === func.name
                     ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-md'
                     : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-md'
                 ]"
            >
              <div class="flex justify-between items-center">
                <h3 class="font-medium" :class="selectedFunction && selectedFunction.name === func.name ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'">
                  {{ func.name }}
                </h3>
                <span :class="['px-2 py-0.5 text-xs rounded-full', getFunctionTypeClass(func.stateMutability)]">
                  {{ getFunctionTypeLabel(func.stateMutability) }}
                </span>
              </div>
              
              <div class="mt-2 text-xs" :class="selectedFunction && selectedFunction.name === func.name ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
                <div v-if="func.outputs && func.outputs.length > 0" class="flex items-center">
                  <LucideArrowLeft class="w-3 h-3 mr-1" />
                  <span>Retourne: {{ formatOutputs(func.outputs) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne droite: exécution de la fonction -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Exécution de la fonction
          </h2>

          <div v-if="!selectedFunction" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <LucidePlay class="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Veuillez sélectionner une fonction à exécuter</p>
          </div>

          <div v-else>
            <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4 border border-gray-200 dark:border-gray-600">
              <h3 class="font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ selectedFunction.name }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ getFunctionDescription(selectedFunction) }}
              </p>
            </div>

            <!-- Paramètres de la fonction -->
            <div class="mb-4">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paramètres
              </h4>
              
              <div v-if="selectedFunction.inputs && selectedFunction.inputs.length > 0">
                <div v-for="(input, index) in selectedFunction.inputs" :key="index" class="mb-3">
                  <label :for="`input-${index}`" class="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {{ input.name || `Paramètre ${index + 1}` }} 
                    <span class="text-xs text-gray-500">
                      ({{ input.type }})
                    </span>
                  </label>
                  <input 
                    :id="`input-${index}`"
                    v-model="functionInputs[index]"
                    :placeholder="getInputPlaceholder(input)"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  />
                </div>
              </div>
              
              <div v-else class="text-sm text-gray-500 dark:text-gray-400 italic">
                Cette fonction ne nécessite aucun paramètre
              </div>
            </div>

            <!-- Bouton d'exécution -->
            <button 
              :disabled="executionLoading"
              @click="executeFunction"
              class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            >
              <div v-if="executionLoading" class="flex items-center justify-center">
                <LucideLoader class="w-4 h-4 animate-spin mr-2" />
                <span>Exécution en cours...</span>
              </div>
              <div v-else class="flex items-center justify-center">
                <LucidePlay class="w-4 h-4 mr-2" />
                <span>Exécuter</span>
              </div>
            </button>

            <!-- Résultat de l'exécution -->
            <div v-if="executionResult !== null" class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Résultat
              </h4>
              <div class="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div v-if="executionError" class="text-red-600 dark:text-red-400">
                  <LucideAlertTriangle class="w-4 h-4 inline-block mr-1" />
                  <span>{{ executionError }}</span>
                </div>
                <div v-else>
                  <pre class="text-sm whitespace-pre-wrap break-all font-mono text-gray-800 dark:text-gray-200">{{ formatExecutionResult(executionResult) }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  LucideArrowLeft, LucideLoader, LucideFileQuestion, LucideChevronRight,
  LucidePlay, LucideFileSearch, LucideFileX, LucideAlertTriangle, LucideCheck
} from 'lucide-vue-next';
import { useSmartContractStore } from '@/stores/smartContractStore';
import { useAutomatonContractStore } from '@/stores/automatonContractStore';
import { useFlowExecution } from '@/composables/contract/useFlowExecution';
import FlowProgressViewer from '@/components/contract/FlowProgressViewer.vue';
import { ContractStatus } from '@/enums/ContractStatus';
import toast from '@/composables/Toast/useToast';

const route = useRoute();
const router = useRouter();

// Stores
const smartContractStore = useSmartContractStore();
const automatonContractStore = useAutomatonContractStore();

// Composable pour la gestion du flow
const { updateFlowExecutionStatuses } = useFlowExecution();

// États
const contractName = ref('');
const contractId = ref('');
const deploymentInfo = ref(null);
const originalContractData = ref(null);
const deploymentFlowData = ref(null);
const isLoading = ref(true);
const selectedClause = ref(null);
const selectedFunction = ref(null);
const functionInputs = ref([]);
const executionResult = ref(null);
const executionError = ref(null);
const executionLoading = computed(() => smartContractStore.executionLoading);
const completedAutomates = ref(new Set());
const flowProgressViewerRef = ref(null);

// Calculs pour les statistiques
const totalAutomatesCount = computed(() => 
  deploymentInfo.value ? Object.keys(deploymentInfo.value).length : 0
);

const completedAutomatesCount = computed(() => completedAutomates.value.size);

// Fonctions pour la gestion des automates
const isAutomateCompleted = (clauseKey) => {
  return completedAutomates.value.has(clauseKey);
};

const getAutomateCardClass = (clauseKey) => {
  if (isAutomateCompleted(clauseKey)) {
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  }
  return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
};

// Fonction pour obtenir le vrai nom de l'automate
const getAutomateName = (clauseKey) => {
  if (originalContractData.value && originalContractData.value.automates) {
    const automatonIndex = parseInt(clauseKey.replace('Automata', ''));
    if (!isNaN(automatonIndex) && originalContractData.value.automates[automatonIndex]) {
      const automate = originalContractData.value.automates[automatonIndex];
      return automate.name || `Automate ${automatonIndex + 1}`;
    }
  }
  return formatClauseName(clauseKey);
};

const formatClauseName = (name) => {
  if (!name) return 'Automate';
  if (name.startsWith('Automata')) {
    const num = name.replace('Automata', '');
    if (!isNaN(parseInt(num))) {
      return `Automate ${parseInt(num) + 1}`;
    }
  }
  return name;
};

// Obtenir les fonctions disponibles pour la clause sélectionnée
const availableFunctions = computed(() => {
  if (!selectedClause.value || !deploymentInfo.value || !deploymentInfo.value[selectedClause.value]) {
    return [];
  }
  
  const abi = deploymentInfo.value[selectedClause.value].abi || [];
  return abi.filter(item => item.type === 'function');
});

// Sélectionner une clause
const selectClause = (clauseName) => {
  selectedClause.value = clauseName;
  selectedFunction.value = null;
  executionResult.value = null;
  executionError.value = null;
  functionInputs.value = [];
};

// Sélectionner une fonction
const selectFunction = (func) => {
  selectedFunction.value = func;
  executionResult.value = null;
  executionError.value = null;
  functionInputs.value = func.inputs ? Array(func.inputs.length).fill('') : [];
};

// Fonctions utilitaires pour l'affichage
const getFunctionDescription = (func) => {
  if (!func) return '';
  
  let desc = '';
  
  if (func.stateMutability === 'view' || func.stateMutability === 'pure') {
    desc += 'Lecture de données sans modifier l\'état';
  } else if (func.stateMutability === 'payable') {
    desc += 'Transaction nécessitant de l\'Ether';
  } else {
    desc += 'Transaction modifiant l\'état de la blockchain';
  }
  
  const inputDesc = func.inputs && func.inputs.length > 0 
    ? `${func.inputs.length} paramètre(s)` 
    : 'aucun paramètre';
  
  const outputDesc = func.outputs && func.outputs.length > 0 
    ? `retourne ${formatOutputs(func.outputs)}` 
    : 'ne retourne rien';
  
  desc += ` - ${inputDesc}, ${outputDesc}`;
  
  return desc;
};

const formatOutputs = (outputs) => {
  if (!outputs || outputs.length === 0) return 'void';
  if (outputs.length === 1) return outputs[0].type;
  return `(${outputs.map(o => o.type).join(', ')})`;
};

const getFunctionTypeClass = (stateMutability) => {
  switch (stateMutability) {
    case 'view':
    case 'pure':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    case 'payable':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    default:
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
  }
};

const getFunctionTypeLabel = (stateMutability) => {
  switch (stateMutability) {
    case 'view':
      return 'Lecture';
    case 'pure':
      return 'Pur';
    case 'payable':
      return 'Payable';
    default:
      return 'Transaction';
  }
};

const getInputPlaceholder = (input) => {
  if (input.type.includes('int')) return '123';
  if (input.type === 'string') return 'texte';
  if (input.type === 'bool') return 'true/false';
  if (input.type === 'address') return '0x...';
  return input.type;
};

const formatExecutionResult = (result) => {
  if (result === null || result === undefined) return 'Aucun résultat';
  if (typeof result === 'object') {
    return JSON.stringify(result, null, 2);
  }
  return String(result);
};

// Fonction pour vérifier si un automate est terminé sur la blockchain
const checkAutomateCompletion = async (clauseKey) => {
  try {
    const result = await smartContractStore.executeContractFunction(
      contractId.value,
      clauseKey,
      'is_completed',
      []
    );
    
    return result.success && result.data.result === true;
  } catch (error) {
    return false;
  }
};

// Fonction pour recharger les statuts depuis la blockchain
const refreshAutomateStatuses = async () => {
  if (!deploymentInfo.value) return;
  
  completedAutomates.value.clear();
  await loadCompletedAutomates();
};

const isContractCompleted = computed(() => {
  if (!deploymentInfo.value) return false;
  
  const totalAutomates = Object.keys(deploymentInfo.value).length;
  const completedCount = completedAutomates.value.size;
  
  return totalAutomates > 0 && completedCount === totalAutomates;
});

// Gestionnaire d'événement pour les completions d'automates
const onAutomateCompleted = async (automateInfo) => {
  if (automateInfo && automateInfo.clauseKey) {
    completedAutomates.value.add(automateInfo.clauseKey);
    await checkAndUpdateContractCompletion();
  }
};

// Fonction pour analyser et formater les erreurs d'exécution
const parseExecutionError = (error) => {
  let errorMessage = '';
  
  // Vérifier si c'est une erreur de serveur avec un détail structuré
  if (error.response && error.response.data && error.response.data.detail) {
    const detail = error.response.data.detail;
    errorMessage = detail.message || detail.toString();
  } else if (error.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = error.toString();
  }
  
  // Vérifier les types d'erreurs spécifiques
  if (errorMessage.includes("No valid transition conditions met")) {
    return {
      type: 'transition_error',
      message: "L'action n'a pas pu être exécutée. Certaines conditions ne sont pas encore remplies."
    };
  } else if (errorMessage.includes("execution reverted")) {
    return {
      type: 'revert_error', 
      message: "L'exécution de la transaction a été annulée par le contrat."
    };
  } else if (errorMessage.includes("insufficient funds")) {
    return {
      type: 'funds_error',
      message: "Fonds insuffisants pour exécuter cette transaction."
    };
  } else if (errorMessage.includes("gas")) {
    return {
      type: 'gas_error',
      message: "Erreur de gas lors de l'exécution de la transaction."
    };
  }
  
  return {
    type: 'execution_error',
    message: "Erreur d'exécution de la fonction."
  };
};

// Exécuter la fonction sélectionnée
const executeFunction = async () => {
  if (!selectedClause.value || !selectedFunction.value) {
    toast.error('Veuillez sélectionner un automate et une fonction');
    return;
  }

  try {
    executionResult.value = null;
    executionError.value = null;

    const processedInputs = functionInputs.value.map((value, index) => {
      const inputType = selectedFunction.value.inputs[index].type;

      if (inputType.includes('int')) {
        return Number(value);
      } else if (inputType === 'bool') {
        return value.toLowerCase() === 'true';
      }

      return value;
    });

    const result = await smartContractStore.executeContractFunction(
      contractId.value, 
      selectedClause.value,
      selectedFunction.value.name,
      processedInputs
    );

    if (result.success) {
      executionResult.value = result.data.result ?? result.data;
      toast.success('Fonction exécutée avec succès');
      
      await refreshAutomateStatuses();
      flowProgressViewerRef.value?.refreshStatus();
      await checkAndUpdateContractCompletion();

    } else {
      // Analyser l'erreur et afficher un message approprié
      const errorInfo = parseExecutionError(result.error || result);
      executionError.value = errorInfo.message;
      
      // Afficher le toast selon le type d'erreur
      if (errorInfo.type === 'transition_error') {
        toast.warning(errorInfo.message);
      } else {
        toast.error(errorInfo.message);
      }
    }
  } catch (error) {
    // Analyser l'erreur capturée
    const errorInfo = parseExecutionError(error);
    executionError.value = errorInfo.message;
    
    // Afficher le toast selon le type d'erreur  
    if (errorInfo.type === 'transition_error') {
      toast.warning(errorInfo.message);
    } else {
      toast.error(errorInfo.message);
    }
  }
};

const checkAndUpdateContractCompletion = async () => {
  if (isContractCompleted.value) {
    try {
      await automatonContractStore.updateContractStatus(
        contractId.value, 
        ContractStatus.COMPLETED
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du contrat:', error);
    }
  }
};

// Charger les données originales du contrat
const loadOriginalContractData = async (contractName) => {
  try {
    const result = await automatonContractStore.fetchContractById(contractName);
    
    if (result.success && result.data) {
      originalContractData.value = result.data;
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

// Charger le flow de déploiement
const loadDeploymentFlow = () => {
  try {
    if (originalContractData.value && originalContractData.value.automates) {
      const flowAutomate = originalContractData.value.automates.find(a => a.id === 'flow-deploiement');
      if (flowAutomate) {
        deploymentFlowData.value = flowAutomate;
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement du flow:', error);
  }
};

// Charger les automates terminés en vérifiant directement sur la blockchain
const loadCompletedAutomates = async () => {
  if (!deploymentInfo.value) return;
  
  const statusChecks = Object.keys(deploymentInfo.value).map(async (clauseKey) => {
    try {
      const isCompleted = await checkAutomateCompletion(clauseKey);
      if (isCompleted) {
        completedAutomates.value.add(clauseKey);
      }
      return { clauseKey, isCompleted };
    } catch (error) {
      return { clauseKey, isCompleted: false };
    }
  });
  
  try {
    await Promise.all(statusChecks);
  } catch (error) {
    console.error('Erreur lors de la vérification des automates:', error);
  }
};

// Charger les informations du contrat
const loadContractInfo = async () => {
  isLoading.value = true;
  
  try {
    const name = route.params.name;
    if (!name) {
      isLoading.value = false;
      return;
    }
    
    contractId.value = name;
    
    const originalDataLoaded = await loadOriginalContractData(name);
    
    if (originalDataLoaded && originalContractData.value && originalContractData.value.name) {
      contractName.value = originalContractData.value.name;
    } else {
      contractName.value = name;
    }
    
    loadDeploymentFlow();
    
    try {
      const result = await smartContractStore.fetchDeployedContractInfo(name);
      
      if (result.success) {
        deploymentInfo.value = result.data.automatons || result.data;
        await loadCompletedAutomates();
        
        const clauseNames = Object.keys(deploymentInfo.value);
        if (clauseNames.length > 0) {
          selectClause(clauseNames[0]);
        }
      } else {
        deploymentInfo.value = null;
      }
    } catch (apiError) {
      deploymentInfo.value = null;
    }
  } catch (error) {
    deploymentInfo.value = null;
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  loadContractInfo();
});

watch(() => route.params.name, (newName) => {
  if (newName && newName !== contractName.value) {
    loadContractInfo();
  }
});

watch(isContractCompleted, (newValue) => {
  if (newValue) {
    checkAndUpdateContractCompletion();
  }
});
</script>