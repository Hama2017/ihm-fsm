<template>
    <div class="analyzer-panel bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">Analyse de l'automate</h3>
        <button 
          @click="refreshAnalysis"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          title="Rafraîchir l'analyse"
        >
          <LucideRefreshCw class="w-3.5 h-3.5" />
        </button>
      </div>
  
      <!-- État général -->
      <div class="mb-4">
        <div class="flex items-center mb-2">
          <div 
            class="w-3 h-3 rounded-full mr-2"
            :class="isValid ? 'bg-green-500' : 'bg-red-500'"
          ></div>
          <span class="text-sm font-medium" :class="isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
            {{ isValid ? 'Automate valide' : 'Automate invalide' }}
          </span>
        </div>
        
        <p v-if="!isValid" class="text-xs text-red-600 dark:text-red-400 mt-1">
          {{ validationMessage }}
        </p>
      </div>
  
      <!-- Statistiques -->
      <div class="space-y-2">
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">États</span>
          <span class="font-medium text-gray-800 dark:text-gray-200">{{ stats.states }}</span>
        </div>
        
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">Transitions</span>
          <span class="font-medium text-gray-800 dark:text-gray-200">{{ stats.transitions }}</span>
        </div>
        
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">États initiaux</span>
          <span 
            class="font-medium"
            :class="stats.initialStates === 1 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'"
          >{{ stats.initialStates }}</span>
        </div>
        
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">États finaux</span>
          <span 
            class="font-medium"
            :class="stats.finalStates > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'"
          >{{ stats.finalStates }}</span>
        </div>
        
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">États isolés</span>
          <span 
            class="font-medium"
            :class="stats.isolatedStates === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
          >{{ stats.isolatedStates }}</span>
        </div>
        
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">Cycles détectés</span>
          <span 
            class="font-medium"
            :class="!hasCycle ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
          >{{ hasCycle ? 'Oui' : 'Non' }}</span>
        </div>
      </div>
  
      <!-- Liste des problèmes détectés -->
      <div v-if="issues.length > 0" class="mt-4">
        <h4 class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Problèmes à résoudre :</h4>
        <ul class="space-y-1.5">
          <li 
            v-for="(issue, index) in issues" 
            :key="index" 
            class="text-xs flex items-start"
          >
            <LucideAlertCircle class="w-3 h-3 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
            <span class="text-gray-700 dark:text-gray-300">{{ issue }}</span>
          </li>
        </ul>
      </div>
  
      <!-- Liste des états et transitions -->
      <div class="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-xs font-medium text-gray-700 dark:text-gray-300">Détails des composants</h4>
          <button 
            @click="toggleDetails" 
            class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            {{ showDetails ? 'Masquer' : 'Afficher' }}
          </button>
        </div>
        
        <div v-if="showDetails" class="space-y-3">
          <div v-if="states.length > 0">
            <h5 class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">États :</h5>
            <ul class="text-xs space-y-0.5 ml-2">
              <li v-for="state in states" :key="state.id" class="flex items-center">
                <span 
                  class="w-2 h-2 rounded-full mr-1.5"
                  :class="getStateStatusColor(state)"
                ></span>
                <span class="text-gray-700 dark:text-gray-300">{{ state.label }}</span>
              </li>
            </ul>
          </div>
          
          <div v-if="transitions.length > 0">
            <h5 class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Transitions :</h5>
            <ul class="text-xs space-y-0.5 ml-2">
              <li v-for="transition in transitions" :key="transition.id" class="text-gray-700 dark:text-gray-300">
                {{ transition.sourceName }} → {{ transition.targetName }}
                ({{ transition.label }})
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  import { LucideRefreshCw, LucideAlertCircle } from 'lucide-vue-next';
  
  const props = defineProps({
    nodes: {
      type: Array,
      default: () => []
    },
    edges: {
      type: Array,
      default: () => []
    },
    validationErrors: {
      type: Array,
      default: () => []
    },
    cyclePath: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['analyze']);
  
  // États internes
  const showDetails = ref(false);
  
  // Liste formatée des états
  const states = computed(() => {
    return props.nodes.map(node => ({
      id: node.id,
      label: node.data.label,
      position: node.position,
      // Un état est initial s'il n'a pas de transitions entrantes
      isInitial: !props.edges.some(edge => edge.target === node.id),
      // Un état est final s'il n'a pas de transitions sortantes
      isFinal: !props.edges.some(edge => edge.source === node.id),
      // Un état est isolé s'il n'a ni transitions entrantes ni sortantes
      isIsolated: !props.edges.some(edge => edge.target === node.id || edge.source === node.id)
    }));
  });
  
  // Liste formatée des transitions
  const transitions = computed(() => {
    return props.edges.map(edge => {
      const sourceNode = props.nodes.find(node => node.id === edge.source);
      const targetNode = props.nodes.find(node => node.id === edge.target);
      
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        sourceName: sourceNode ? sourceNode.data.label : edge.source,
        targetName: targetNode ? targetNode.data.label : edge.target
      };
    });
  });
  
  // Statistiques sur l'automate
  const stats = computed(() => {
    return {
      states: props.nodes.length,
      transitions: props.edges.length,
      initialStates: states.value.filter(state => state.isInitial).length,
      finalStates: states.value.filter(state => state.isFinal).length,
      isolatedStates: states.value.filter(state => state.isIsolated).length
    };
  });
  
  // Présence de cycle
  const hasCycle = computed(() => props.cyclePath.length > 0);
  
  // Validation globale de l'automate
  const isValid = computed(() => {
    return props.validationErrors.length === 0 && !hasCycle.value && stats.value.isolatedStates === 0;
  });
  
  // Message de validation
  const validationMessage = computed(() => {
    if (props.validationErrors.length > 0) {
      return props.validationErrors[0];
    }
    if (hasCycle.value) {
      return `Cycle détecté: ${props.cyclePath.join(' → ')}`;
    }
    if (stats.value.isolatedStates > 0) {
      return 'Des états isolés ont été détectés';
    }
    return '';
  });
  
  // Liste des problèmes détectés
  const issues = computed(() => {
    const problemList = [];
    
    // Ajouter les erreurs de validation
    problemList.push(...props.validationErrors);
    
    // Vérifier s'il y a un cycle
    if (hasCycle.value) {
      problemList.push(`Cycle détecté: ${props.cyclePath.join(' → ')}`);
    }
    
    // Vérifier les états isolés
    if (stats.value.isolatedStates > 0) {
      const isolatedStateNames = states.value
        .filter(state => state.isIsolated)
        .map(state => state.label)
        .join(', ');
      
      problemList.push(`États isolés: ${isolatedStateNames}`);
    }
    
    // Vérifier s'il y a un état initial
    if (stats.value.initialStates === 0) {
      problemList.push('Aucun état initial détecté');
    } else if (stats.value.initialStates > 1) {
      problemList.push(`Plusieurs états initiaux détectés (${stats.value.initialStates})`);
    }
    
    // Vérifier s'il y a un état final
    if (stats.value.finalStates === 0) {
      problemList.push('Aucun état final détecté');
    }
    
    return problemList;
  });
  
  // Fonction pour obtenir la couleur de statut d'un état
  const getStateStatusColor = (state) => {
    if (state.isIsolated) {
      return 'bg-red-500';
    }
    if (state.isInitial) {
      return 'bg-green-500';
    }
    if (state.isFinal) {
      return 'bg-blue-500';
    }
    return 'bg-gray-500';
  };
  
  // Fonction pour basculer l'affichage des détails
  const toggleDetails = () => {
    showDetails.value = !showDetails.value;
  };
  
  // Fonction pour rafraîchir l'analyse
  const refreshAnalysis = () => {
    emit('analyze');
  };
  
  // Observer les changements pour rafraîchir automatiquement l'analyse
  watch([() => props.nodes, () => props.edges], () => {
    emit('analyze');
  }, { deep: true });
  </script>