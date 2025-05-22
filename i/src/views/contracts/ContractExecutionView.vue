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
          Les informations de déploiement pour ce contrat ne sont pas disponibles. Veuillez vérifier que le contrat a bien été déployé.
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
        <!-- Colonne gauche: liste des clauses -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Clauses disponibles
          </h2>
          
          <div class="space-y-3">
            <div v-for="(info, clauseName) in deploymentInfo" :key="clauseName"
                 @click="selectClause(clauseName)"
                 :class="[
                   'p-3 rounded-lg cursor-pointer transition-colors border',
                   selectedClause === clauseName 
                     ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                     : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                 ]"
            >
              <div class="flex justify-between items-center">
                <h3 class="font-medium" :class="selectedClause === clauseName ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'">
                  {{ formatClauseName(clauseName) }}
                </h3>
                <LucideChevronRight v-if="selectedClause === clauseName" class="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {{ info.address }}
              </p>
            </div>
          </div>
        </div>

        <!-- Colonne centrale: fonctions disponibles -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span>Fonctions disponibles</span>
            <span v-if="selectedClause" class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({{ formatClauseName(selectedClause) }})
            </span>
          </h2>

          <div v-if="!selectedClause" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <LucideFileSearch class="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Veuillez sélectionner une clause pour voir les fonctions disponibles</p>
          </div>

          <div v-else-if="availableFunctions.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <LucideFileX class="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Aucune fonction disponible pour cette clause</p>
          </div>

          <div v-else class="space-y-3">
            <div v-for="func in availableFunctions" :key="func.name"
                 @click="selectFunction(func)"
                 :class="[
                   'p-3 rounded-lg cursor-pointer transition-colors border',
                   selectedFunction && selectedFunction.name === func.name
                     ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                     : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                 ]"
            >
              <div class="flex justify-between items-center">
                <h3 class="font-medium" :class="selectedFunction && selectedFunction.name === func.name ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'">
                  {{ func.name }}
                </h3>
                <span 
                  :class="[
                    'px-2 py-0.5 text-xs rounded-full',
                    getFunctionTypeClass(func.stateMutability)
                  ]"
                >
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

            <!-- Paramètres de la fonction (s'il y en a) -->
            <div  class="mb-4">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paramètres
              </h4>
              
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
  LucideArrowLeft, 
  LucideLoader, 
  LucideFileQuestion, 
  LucideChevronRight,
  LucidePlay,
  LucideFileSearch,
  LucideFileX,
  LucideArrowLeft as LucideArrowLeftIcon,
  LucideAlertTriangle
} from 'lucide-vue-next';
import { useSmartContractStore } from '@/stores/smartContractStore';
import toast from '@/composables/Toast/useToast';

const route = useRoute();
const router = useRouter();

// Store
const smartContractStore = useSmartContractStore();

// États
const contractName = ref('');
const contractId = ref('');
const deploymentInfo = ref(null);
const isLoading = ref(true);
const selectedClause = ref(null);
const selectedFunction = ref(null);
const functionInputs = ref([]);
const executionResult = ref(null);
const executionError = ref(null);
const executionLoading = computed(() => smartContractStore.executionLoading);

const argsString = ref('');
const argsError = ref('');

// Formater le nom d'une clause pour l'affichage
const formatClauseName = (name) => {
  if (!name) return 'Clause';
  
  // Transformer "Automata0" en "Clause 1"
  if (name.startsWith('Automata')) {
    const num = name.replace('Automata', '');
    if (!isNaN(parseInt(num))) {
      return `Clause ${parseInt(num) + 1}`;
    }
  }
  
  return name;
};

// Obtenir les fonctions disponibles pour la clause sélectionnée
const availableFunctions = computed(() => {
  if (!selectedClause.value || !deploymentInfo.value || !deploymentInfo.value[selectedClause.value]) {
    return [];
  }
  
  // Filtrer les fonctions ABI pour exclure certaines fonctions internes si nécessaire
  const abi = deploymentInfo.value[selectedClause.value].abi || [];
  return abi.filter(item => 
    item.type === 'function' && 
    // Optionnel: Exclure certaines fonctions internes si nécessaire
    // !item.name.startsWith('_')
    true
  );
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
  // Initialiser le tableau des inputs avec le bon nombre d'emplacements
  functionInputs.value = func.inputs ? Array(func.inputs.length).fill('') : [];
};

// Obtenir une description lisible pour la fonction
const getFunctionDescription = (func) => {
  if (!func) return '';
  
  let desc = '';
  
  // Type de fonction
  if (func.stateMutability === 'view' || func.stateMutability === 'pure') {
    desc += 'Lecture de données sans modifier l\'état';
  } else if (func.stateMutability === 'payable') {
    desc += 'Transaction nécessitant de l\'Ether';
  } else {
    desc += 'Transaction modifiant l\'état de la blockchain';
  }
  
  // Entrées et sorties
  const inputDesc = func.inputs && func.inputs.length > 0 
    ? `${func.inputs.length} paramètre(s)` 
    : 'aucun paramètre';
  
  const outputDesc = func.outputs && func.outputs.length > 0 
    ? `retourne ${formatOutputs(func.outputs)}` 
    : 'ne retourne rien';
  
  desc += ` - ${inputDesc}, ${outputDesc}`;
  
  return desc;
};

// Formater les sorties d'une fonction
const formatOutputs = (outputs) => {
  if (!outputs || outputs.length === 0) return 'void';
  
  if (outputs.length === 1) {
    return outputs[0].type;
  }
  
  return `(${outputs.map(o => o.type).join(', ')})`;
};

// Obtenir une classe de couleur pour le type de fonction
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

// Obtenir un libellé pour le type de fonction
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

// Obtenir un placeholder pour un champ de saisie
const getInputPlaceholder = (input) => {
  if (input.type.includes('int')) return '123';
  if (input.type === 'string') return 'texte';
  if (input.type === 'bool') return 'true/false';
  if (input.type === 'address') return '0x...';
  return input.type;
};

// Formater le résultat de l'exécution
const formatExecutionResult = (result) => {
  if (result === null || result === undefined) return 'Aucun résultat';
  
  if (typeof result === 'object') {
    return JSON.stringify(result, null, 2);
  }
  
  return String(result);
};

// Exécuter la fonction sélectionnée
const executeFunction = async () => {
  if (!selectedClause.value || !selectedFunction.value) {
    toast.error('Veuillez sélectionner une clause et une fonction');
    return;
  }

  try {
    executionResult.value = null;
    executionError.value = null;

    // Convertir les inputs selon leur type
    const processedInputs = functionInputs.value.map((value, index) => {
      const inputType = selectedFunction.value.inputs[index].type;

      if (inputType.includes('int')) {
        return Number(value);
      } else if (inputType === 'bool') {
        return value.toLowerCase() === 'true';
      }

      // Adresse, string, etc.
      return value;
    });

    // Exécution via le store
    const result = await smartContractStore.executeContractFunction(
      contractName.value,
      selectedClause.value,
      selectedFunction.value.name,
      processedInputs
    );

    if (result.success) {
      // ✅ La nouvelle structure : `result.data.result`
      executionResult.value = result.data.result ?? result.data;
      toast.success('Fonction exécutée avec succès');
    } else {
      executionError.value = result.error;
      toast.error(`Erreur: ${result.error}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'exécution de la fonction :", error);
    executionError.value = error.message;
    toast.error(`Erreur: ${error.message}`);
  }
};


// Charger les informations du contrat
const loadContractInfo = async () => {
  isLoading.value = true;
  
  try {
    // Récupérer le nom du contrat depuis l'URL
    const name = route.params.name;
    if (!name) {
      isLoading.value = false;
      return;
    }
    
    contractId.value = name;
    contractName.value = name;
    
    // Essayer d'abord de récupérer depuis localStorage (pour compatibilité)
    const storedData = localStorage.getItem(`contract_deployment_${name}`);
    
    if (storedData) {
      deploymentInfo.value = JSON.parse(storedData);
      
      // Sélectionner la première clause par défaut
      const clauseNames = Object.keys(deploymentInfo.value);
      if (clauseNames.length > 0) {
        selectClause(clauseNames[0]);
      }
      
      toast.success('Informations du contrat chargées depuis le stockage local');
    } else {
      // Si pas d'infos dans localStorage, récupérer depuis l'API
      try {
        const result = await smartContractStore.fetchDeployedContractInfo(name);
        
        if (result.success) {
          deploymentInfo.value = result.data.automatons || result.data;
          
          // Sélectionner la première clause par défaut
          const clauseNames = Object.keys(deploymentInfo.value);
          if (clauseNames.length > 0) {
            selectClause(clauseNames[0]);
          }
          
          toast.success('Informations du contrat chargées depuis le serveur');
        } else {
          // Si l'API ne retourne pas de données, afficher un message d'erreur
          deploymentInfo.value = null;
          toast.error(`Impossible de récupérer les informations du contrat: ${result.error}`);
        }
      } catch (apiError) {
        console.error('Erreur lors de l\'appel à l\'API:', apiError);
        toast.error('Erreur de connexion au serveur');
        deploymentInfo.value = null;
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des informations du contrat:', error);
    toast.error('Erreur lors du chargement des informations du contrat');
    deploymentInfo.value = null;
  } finally {
    isLoading.value = false;
  }
};

// Charger les informations au montage du composant
onMounted(() => {
  loadContractInfo();
});

// Réagir aux changements de route
watch(() => route.params.name, (newName) => {
  if (newName && newName !== contractName.value) {
    loadContractInfo();
  }
});
</script>

<style scoped>
/* Styles spécifiques au composant */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>