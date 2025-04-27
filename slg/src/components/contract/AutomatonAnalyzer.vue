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
      
      <div class="flex justify-between text-xs">
        <span class="text-gray-600 dark:text-gray-400">Conditions utilisées</span>
        <span class="font-medium text-gray-800 dark:text-gray-200">{{ totalConditionsUsed }}</span>
      </div>
      
      <div class="flex justify-between text-xs">
        <span class="text-gray-600 dark:text-gray-400">Dépendances de clauses</span>
        <span class="font-medium text-gray-800 dark:text-gray-200">{{ totalDependenciesUsed }}</span>
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

    <!-- Détails: États et transitions -->
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
          <ul class="text-xs space-y-2 ml-2">
            <li 
              v-for="transition in transitions" 
              :key="transition.id" 
              class="border-l-2 border-blue-100 dark:border-blue-900/30 pl-2 pb-2"
            >
              <div class="text-gray-700 dark:text-gray-300 font-medium">
                {{ transition.sourceName }} → {{ transition.targetName }}
                <span class="text-blue-600 dark:text-blue-400">({{ transition.label }})</span>
              </div>
              
              <!-- Conditions associées à cette transition -->
              <div v-if="transition.conditions && transition.conditions.length > 0" class="mt-1 ml-3">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Conditions requises:</div>
                <div class="space-y-1">
                  <div 
                    v-for="conditionId in transition.conditions" 
                    :key="conditionId"
                    class="flex items-center"
                  >
                    <div class="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mr-1.5"></div>
                    <span class="text-gray-600 dark:text-gray-300">
                      {{ getConditionLabel(conditionId) }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="mt-1 ml-3 text-xs text-gray-500 dark:text-gray-400">
                Aucune condition requise
              </div>
              
              <!-- Dépendances de clauses associées à cette transition -->
              <div v-if="transition.automataDependencies && transition.automataDependencies.length > 0" class="mt-2 ml-3">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Dépendances de clauses:</div>
                <div class="space-y-1">
                  <div 
                    v-for="dependencyId in transition.automataDependencies" 
                    :key="dependencyId"
                    class="flex items-center"
                  >
                    <div class="w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-purple-500 mr-1.5"></div>
                    <span class="text-gray-600 dark:text-gray-300">
                      {{ getAutomataDependencyName(dependencyId) }}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Conditions les plus utilisées -->
    <div class="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-xs font-medium text-gray-700 dark:text-gray-300">Utilisation des conditions</h4>
        <button 
          @click="toggleConditionUsage" 
          class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {{ showConditionUsage ? 'Masquer' : 'Afficher' }}
        </button>
      </div>
      
      <div v-if="showConditionUsage" class="space-y-3">
        <div v-if="conditionUsageStats.length > 0">
          <div class="max-h-40 overflow-y-auto pr-1 custom-scrollbar">
            <table class="w-full text-xs border-collapse">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-700">
                  <th class="py-1 px-2 text-left text-gray-600 dark:text-gray-300 font-medium">Condition</th>
                  <th class="py-1 px-2 text-center text-gray-600 dark:text-gray-300 font-medium">Utilisations</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="stat in conditionUsageStats" 
                  :key="stat.id"
                  class="border-t border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                >
                  <td class="py-1 px-2 text-gray-700 dark:text-gray-300">{{ stat.label }}</td>
                  <td class="py-1 px-2 text-center">
                    <span 
                      class="inline-block px-1.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getUsageCountClass(stat.count)"
                    >
                      {{ stat.count }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
          Aucune condition n'est utilisée dans cet automate
        </div>
      </div>
    </div>
    
    <!-- Dépendances de clauses utilisées -->
    <div class="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-xs font-medium text-gray-700 dark:text-gray-300">Dépendances de clauses</h4>
        <button 
          @click="toggleDependencyUsage" 
          class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {{ showDependencyUsage ? 'Masquer' : 'Afficher' }}
        </button>
      </div>
      
      <div v-if="showDependencyUsage" class="space-y-3">
        <div v-if="dependencyUsageStats.length > 0">
          <div class="max-h-40 overflow-y-auto pr-1 custom-scrollbar">
            <table class="w-full text-xs border-collapse">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-700">
                  <th class="py-1 px-2 text-left text-gray-600 dark:text-gray-300 font-medium">Clause</th>
                  <th class="py-1 px-2 text-center text-gray-600 dark:text-gray-300 font-medium">Utilisations</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="stat in dependencyUsageStats" 
                  :key="stat.id"
                  class="border-t border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/10"
                >
                  <td class="py-1 px-2 text-gray-700 dark:text-gray-300">{{ stat.label }}</td>
                  <td class="py-1 px-2 text-center">
                    <span 
                      class="inline-block px-1.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getUsageCountClass(stat.count, 'purple')"
                    >
                      {{ stat.count }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
          Aucune dépendance de clause n'est utilisée dans cet automate
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
  },
  packetCondition: {
    type: Array,
    default: () => []
  },
  contractAutomates: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['analyze']);

// États internes
const showDetails = ref(false);
const showConditionUsage = ref(false);
const showDependencyUsage = ref(false);

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
      conditions: edge.conditions || [],
      automataDependencies: edge.automataDependencies || [],
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

// Nombre total de conditions utilisées
const totalConditionsUsed = computed(() => {
  return props.edges.reduce((total, edge) => {
    return total + (edge.conditions ? edge.conditions.length : 0);
  }, 0);
});

// Nombre total de dépendances utilisées
const totalDependenciesUsed = computed(() => {
  return props.edges.reduce((total, edge) => {
    return total + (edge.automataDependencies ? edge.automataDependencies.length : 0);
  }, 0);
});

// Statistiques d'utilisation des conditions
const conditionUsageStats = computed(() => {
  // Compter l'utilisation de chaque condition
  const conditionCounts = {};
  
  props.edges.forEach(edge => {
    if (edge.conditions && edge.conditions.length > 0) {
      edge.conditions.forEach(conditionId => {
        if (conditionCounts[conditionId]) {
          conditionCounts[conditionId]++;
        } else {
          conditionCounts[conditionId] = 1;
        }
      });
    }
  });
  
  // Transformer en tableau pour l'affichage et trier par utilisation
  const stats = Object.keys(conditionCounts).map(conditionId => {
    return {
      id: conditionId,
      label: getConditionLabel(conditionId),
      count: conditionCounts[conditionId]
    };
  });
  
  return stats.sort((a, b) => b.count - a.count);
});

// Statistiques d'utilisation des dépendances d'automates
const dependencyUsageStats = computed(() => {
  // Compter l'utilisation de chaque dépendance d'automate
  const dependencyCounts = {};
  
  props.edges.forEach(edge => {
    if (edge.automataDependencies && edge.automataDependencies.length > 0) {
      edge.automataDependencies.forEach(dependencyId => {
        if (dependencyCounts[dependencyId]) {
          dependencyCounts[dependencyId]++;
        } else {
          dependencyCounts[dependencyId] = 1;
        }
      });
    }
  });
  
  // Transformer en tableau pour l'affichage et trier par utilisation
  const stats = Object.keys(dependencyCounts).map(dependencyId => {
    return {
      id: dependencyId,
      label: getAutomataDependencyName(dependencyId),
      count: dependencyCounts[dependencyId]
    };
  });
  
  return stats.sort((a, b) => b.count - a.count);
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

// Fonction pour obtenir le libellé d'une condition
const getConditionLabel = (conditionId) => {
  for (const packet of props.packetCondition) {
    for (const condition of packet.functions) {
      if (condition.id === conditionId) {
        return condition.label;
      }
    }
  }
  return conditionId;
};

// Fonction pour obtenir le nom d'une dépendance d'automate
const getAutomataDependencyName = (dependencyId) => {

  console.log(dependencyId)
  // Format attendu: "Automata1", nous extrayons le "1"
  const automataId = dependencyId.replace('Automata', '');
  const automate = props.contractAutomates.find(a => a.id === automataId);
  return automate ? automate.name : `Automate ${automataId}`;
};

// Fonction pour définir la classe de couleur selon le nombre d'utilisations
const getUsageCountClass = (count, color = 'blue') => {
  if (color === 'purple') {
    if (count >= 3) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    } else if (count === 2) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  } else {
    if (count >= 3) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    } else if (count === 2) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// Fonction pour basculer l'affichage des détails
const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

// Fonction pour basculer l'affichage des statistiques d'utilisation des conditions
const toggleConditionUsage = () => {
  showConditionUsage.value = !showConditionUsage.value;
};

// Fonction pour basculer l'affichage des statistiques d'utilisation des dépendances
const toggleDependencyUsage = () => {
  showDependencyUsage.value = !showDependencyUsage.value;
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

<style scoped>
/* Personnalisation de la barre de défilement */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f1f5f9;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 4px;
}

.dark .custom-scrollbar {
  scrollbar-color: #4b5563 #1f2937;
}

.dark .custom-scrollbar::-webkit-scrollbar-track {
  background: #1f2937;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
</style>