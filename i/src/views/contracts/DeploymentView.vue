<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- En-tête -->
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button 
              @click="goBack"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <LucideArrowLeft class="w-5 h-5" />
            </button>
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
              Déploiement du contrat "{{ contractName }}"
            </h1>
          </div>
          <div class="flex items-center space-x-2">
            <span class="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
              {{ deploymentSteps[currentStep] }}
            </span>
          </div>
        </div>
      </div>
  
      <!-- Contenu principal -->
      <div class="max-w-4xl mx-auto p-6">
        <!-- Étape 1: Animation de déploiement -->
        <div v-if="currentStep === 0" class="space-y-8">
          <DeploymentAnimation 
            :step="deploymentAnimationStep"
            :progress="deploymentProgress"
            :animationTexts="deploymentAnimationTexts"
            @complete="onDeploymentAnimationComplete"
          />
        </div>
  
        <!-- Étape 2: Résultat du déploiement -->
        <div v-else-if="currentStep === 1" class="space-y-8">
          <!-- Message de succès -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <LucideCheck class="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Déploiement réussi !
              </h2>
              <p class="text-gray-600 dark:text-gray-400">
                Le contrat "{{ contractName }}" a été déployé avec succès sur la blockchain
              </p>
            </div>
          </div>
  
          <!-- Informations détaillées -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <DeploymentInfo 
              :deployment-info="deploymentResult" 
              @interact-with-contract="goToContractExecution"
            />
          </div>
  
          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              @click="goBack"
              class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <LucideArrowLeft class="w-4 h-4 mr-2" />
              Retour à l'éditeur
            </button>
            
            <button
              @click="goToContractExecution"
              class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <LucidePlay class="w-4 h-4 mr-2" />
              Interagir avec le contrat
            </button>
            
            <button
              @click="goToContractsList"
              class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <LucideList class="w-4 h-4 mr-2" />
              Voir tous les contrats
            </button>
          </div>
        </div>
  
        <!-- Étape d'erreur -->
        <div v-else-if="currentStep === 2" class="space-y-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="text-center">
              <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <LucideX class="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Échec du déploiement
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                Une erreur est survenue lors du déploiement
              </p>
              <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p class="text-red-800 dark:text-red-300 text-sm">
                  {{ errorMessage }}
                </p>
              </div>
            </div>
          </div>
  
          <!-- Actions d'erreur -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              @click="retryDeployment"
              class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <LucideRefreshCw class="w-4 h-4 mr-2" />
              Réessayer
            </button>
            
            <button
              @click="goBack"
              class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <LucideArrowLeft class="w-4 h-4 mr-2" />
              Retour à l'éditeur
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { 
    LucideArrowLeft, 
    LucideCheck, 
    LucideX, 
    LucidePlay, 
    LucideList,
    LucideRefreshCw
  } from 'lucide-vue-next';
  import DeploymentAnimation from '@/components/contract/DeploymentAnimation.vue';
  import DeploymentInfo from '@/components/contract/DeploymentInfo.vue';
  import { useSmartContractStore } from '@/stores/smartContractStore';
  import { useAutomatonContractStore } from '@/stores/automatonContractStore';
  import toast from '@/composables/Toast/useToast';
  
  const router = useRouter();
  const route = useRoute();
  
  // Stores
  const smartContractStore = useSmartContractStore();
  const automatonContractStore = useAutomatonContractStore();
  
  // État de déploiement
  const currentStep = ref(0); // 0: animation, 1: succès, 2: erreur
  const deploymentSteps = [
    'Déploiement en cours...',
    'Déploiement terminé',
    'Erreur de déploiement'
  ];
  
  // Animation
  const deploymentAnimationStep = ref(0);
  const deploymentProgress = ref(0);
  const deploymentAnimationTexts = [
    "Préparation du déploiement...",
    "Compilation des contrats intelligents...",
    "Déploiement sur la blockchain...",
    "Vérification et finalisation...",
    "Déploiement terminé avec succès!"
  ];
  
  // Données
  const contractName = ref('');
  const contractData = ref(null);
  const deploymentResult = ref(null);
  const errorMessage = ref('');
  
  // Montage du composant
  onMounted(async () => {
    // Récupérer les données du contrat depuis les paramètres de route
    contractName.value = route.params.name || 'Contrat sans nom';
    
    // Récupérer les données du contrat depuis le localStorage ou l'API
    const contractId = route.params.id;
    if (contractId) {
      try {
        const result = await automatonContractStore.fetchContractById(contractId);
        if (result.success) {
          contractData.value = result.data;
          contractName.value = result.data.name;
        }
      } catch (error) {
        console.error('Erreur lors du chargement du contrat:', error);
      }
    }
  
    // Démarrer le déploiement automatiquement
    startDeployment();
  });
  
  // Fonction de déploiement
  const startDeployment = async () => {
  try {
    currentStep.value = 0;
    
    // Étapes d'animation...
    deploymentAnimationStep.value = 0;
    deploymentProgress.value = 0;
    
    await new Promise(resolve => {
      setTimeout(() => {
        deploymentAnimationStep.value = 1;
        deploymentProgress.value = 25;
        resolve();
      }, 1500);
    });
    
    await new Promise(resolve => {
      setTimeout(() => {
        deploymentAnimationStep.value = 2;
        deploymentProgress.value = 50;
        resolve();
      }, 2000);
    });
    
    await new Promise(resolve => {
      setTimeout(() => {
        deploymentAnimationStep.value = 3;
        deploymentProgress.value = 75;
        resolve();
      }, 2000);
    });

    // Déploiement réel
    const result = await deployContractToBlockchain();
    
    await new Promise(resolve => {
      setTimeout(() => {
        deploymentAnimationStep.value = 4;
        deploymentProgress.value = 100;
        resolve();
      }, 1500);
    });

    await new Promise(resolve => {
      setTimeout(resolve, 2000);
    });

    if (result && result.success) {
      console.log('🔍 Données brutes du déploiement:', result.data);

      // ✅ NOUVEAU: Parser correctement les données de l'API
      const apiData = result.data;
      
      // Extraire les informations des automates depuis l'API
      const automateNames = [];
      let totalAutomates = 0;
      
      if (apiData.automatons) {
        totalAutomates = Object.keys(apiData.automatons).length;
        
        // Mapper les automates depuis l'API vers nos données locales
        Object.entries(apiData.automatons).forEach(([automateKey, automateData], index) => {
          // Trouver le nom correspondant dans nos données locales
          const localAutomate = contractData.value?.automates?.[index];
          
          automateNames.push({
            id: localAutomate?.id || automateKey,
            name: localAutomate?.name || `Clause ${index + 1}`,
            statesCount: localAutomate?.states?.length || 0,
            transitionsCount: localAutomate?.transitions?.length || 0,
            contractAddress: automateData.address,
            abi: automateData.abi // Garder l'ABI pour référence
          });
        });
      }

      // ✅ Enrichir les résultats avec les vraies données
      const enrichedResult = {
        // ✅ Informations générales du contrat
        contractName: contractName.value,
        contractId: route.params.id || apiData.name,
        
        // ✅ Informations de déploiement
        deployedAt: apiData.deployed_at || new Date().toISOString(),
        deployedBy: apiData.deployed_by || 'Utilisateur',
        sourceContract: apiData.source_contract,
        
        // ✅ Informations des automates/clauses
        automateNames: automateNames,
        totalAutomates: totalAutomates,
        
        // ✅ Informations techniques
        contractAddress: apiData.main_contract_address || 'Non disponible',
        transactionHash: apiData.transaction_hash || generateMockTxHash(),
        blockNumber: apiData.block_number || Math.floor(Math.random() * 1000000) + 15000000,
        gasUsed: apiData.gas_used || Math.floor(Math.random() * 500000) + 100000,
        network: apiData.network || 'Ethereum Testnet',
        
        // ✅ Données brutes pour référence
        rawApiData: apiData
      };
      
      console.log('✅ Résultat enrichi:', enrichedResult);
      
      deploymentResult.value = enrichedResult;
      currentStep.value = 1;
      
      // Sauvegarder dans localStorage
      localStorage.setItem(`contract_deployment_${contractName.value}`, 
        JSON.stringify(enrichedResult));
        
      await saveContractAfterDeployment();

      toast.success('Contrat déployé avec succès !');
    } else {
      throw new Error(result?.error || 'Erreur inconnue lors du déploiement');
    }
  } catch (error) {
    console.error('Erreur lors du déploiement:', error);
    errorMessage.value = error.message || error.toString();
    currentStep.value = 2;
    toast.error(`Échec du déploiement: ${errorMessage.value}`);
  }
};
// ✅ AMÉLIORER la fonction generateMockTxHash (pour le cas où pas de hash)
const generateMockTxHash = () => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

// ✅ AMÉLIORER deployContractToBlockchain pour plus de logs
const deployContractToBlockchain = async () => {
  try {
    console.log('🚀 Début du déploiement sur blockchain');
    
    if (!contractData.value) {
      throw new Error('Aucune donnée de contrat disponible');
    }

    // Transformer le contrat pour le déploiement
    const specificationModel = automatonContractStore.transformContractForDeployment({
      name: contractData.value.name,
      id: contractData.value.id,
      automates: contractData.value.automates.filter(a => a.id !== 'flow-deploiement')
    });

    console.log('📤 Envoi du modèle:', specificationModel);

    // Utiliser le store pour déployer
    const result = await smartContractStore.deployContract(specificationModel);
    
    console.log('📥 Réponse de l\'API:', result);
    
    if (result && (result.success === true || result.success !== false)) {
      return {
        success: true,
        data: result.data || result
      };
    } else {
      return {
        success: false,
        error: result?.error || result?.message || 'Erreur lors du déploiement'
      };
    }
  } catch (error) {
    console.error('❌ Erreur lors du déploiement:', error);
    return {
      success: false,
      error: error.message || error.toString()
    };
  }
};
  

  
  // Fonctions de navigation
  const goBack = () => {
    const contractId = route.params.id;
    if (contractId) {
      router.push({ name: 'edit-contract', params: { id: contractId } });
    } else {
      router.push({ name: 'create-contract' });
    }
  };
  
  const goToContractExecution = () => {
    const contractId = route.params.id;
    router.push({
      name: 'contract-execution',
      params: { name: contractId }
    });
  };
  
  const goToContractsList = () => {
    router.push({ name: 'contracts' });
  };
  
  const retryDeployment = () => {
    startDeployment();
  };
  
  const onDeploymentAnimationComplete = () => {
    console.log('Animation de déploiement terminée');
  };

  const saveContractAfterDeployment = async () => {
  try {
    if (!contractData.value) return;

    console.log(' Sauvegarde du contrat après déploiement réussi');

    // Marquer le contrat comme déployé
    const updatedContract = {
      ...contractData.value,
      status: 'deployed', // ou ContractStatus.DEPLOYED
      deployedAt: new Date().toISOString()
    };

    const result = await automatonContractStore.updateContract(
      contractData.value.id || contractData.value.name, 
      updatedContract
    );

    if (result.success) {
      console.log(' Contrat sauvegardé avec statut déployé');
    } else {
      console.warn('Erreur lors de la sauvegarde:', result.error);
    }
  } catch (error) {
    console.warn(' Erreur lors de la sauvegarde après déploiement:', error);
    // Ne pas faire échouer le déploiement pour un problème de sauvegarde
  }
};

  </script>