<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-5 transition-colors duration-300">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white tracking-wide">
        Déclencheurs <span class="text-sm text-gray-400">({{ edges.length }})</span>
      </h2>
      <div class="flex items-center space-x-3">
        <!-- Bouton de tri -->
        <button @click="toggleSort" class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
          <LucideArrowDownUp class="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <!-- Bouton d'ajout -->
        <button 
          @click="$emit('open-add-modal')"
          class="bg-blue-500 text-white dark:bg-blue-600 dark:text-white px-3 py-1.5 rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <LucidePlus class="w-3.5 h-3.5" />
          <span class="ml-1.5 text-xs font-medium">Ajouter</span>
        </button>
      </div>
    </div>
    
    <!-- Message si vide -->
    <div v-if="edges.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
      Cliquer sur le bouton <strong>"Ajouter"</strong> pour créer un déclencheur.
    </div>
    
    <!-- Barre de recherche pour filtrer les fonctions -->
    <div v-if="edges.length > 0" class="mb-4">
      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Rechercher un déclencheur..."
          class="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500">
          <LucideSearch class="w-4 h-4" />
        </div>
      </div>
    </div>
    
    <!-- Liste des transitions avec défilement -->
    <div v-if="edges.length > 0" class="max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
      <ul class="space-y-3">
        <li 
          v-for="edge in filteredEdges" 
          :key="edge.id"
          class="relative group mb-4"
        >
          <!-- Carte de transition -->
          <div :class="[
            'flex flex-col border rounded-lg overflow-hidden shadow-sm transition-all duration-200',
            activeTransition === edge.id 
              ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900' 
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
          ]"
             @click="$emit('select-transition', edge.id)">
            <!-- En-tête avec le nom de la fonction -->
            <div :class="[
              'px-4 py-3',
              activeTransition === edge.id 
                ? 'bg-blue-500 dark:bg-blue-600' 
                : 'bg-gray-50 dark:bg-gray-800'
            ]">
              <div class="flex justify-between items-center">
                <span :class="[
                  'font-medium',
                  activeTransition === edge.id 
                    ? 'text-white' 
                    : 'text-gray-800 dark:text-gray-200'
                ]">{{ edge.label }}</span>
              </div>
            </div>
            
            <!-- Corps avec les informations de nœuds -->
            <div class="px-4 py-3 bg-white dark:bg-gray-800">
              <div class="flex items-center justify-center space-x-2 text-sm mb-2">
                <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                  {{ getNodeName(edge.source) }}
                </span>
                <LucideArrowRight class="text-blue-500 dark:text-blue-400" />
                <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                  {{ getNodeName(edge.target) }}
                </span>
              </div>
              
              <div class="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                <!-- Section Conditions -->
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Conditions :</span>
                  </div>
                  
                  <!-- Liste des conditions si présentes -->
                  <div v-if="edge.conditions && edge.conditions.length > 0" class="space-y-2">
                    <div 
                      v-for="conditionId in edge.conditions" 
                      :key="conditionId"
                      class="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800/50 group/condition"
                    >
                      <span class="text-sm text-blue-700 dark:text-blue-300 truncate pr-2">
                        {{ getConditionLabel(conditionId) }}
                      </span>
                      <div class="flex items-center space-x-1 opacity-70 group-hover/condition:opacity-100 transition-opacity">
                        <button 
                          @click="$emit('open-condition-info', conditionId)"
                          class="p-1 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 transition-colors"
                          title="Voir les détails"
                        >
                          <LucideInfo class="w-3.5 h-3.5" />
                        </button>
                        <button 
                          @click="$emit('remove-condition', edge.id, conditionId)"
                          class="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 transition-colors"
                          title="Retirer la condition"
                        >
                          <LucideX class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    <!-- Bouton pour ajouter plus de conditions quand il y en a déjà -->
                    <button 
                      @click="$emit('open-add-conditions', edge)"
                      class="mt-2 w-full py-1.5 flex items-center justify-center text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                    >
                      <LucidePlus class="w-3 h-3 mr-1" />
                      Ajouter plus de conditions
                    </button>
                  </div>
                  <!-- Bouton stylisé si aucune condition -->
                  <div v-else>
                    <button 
                      @click="$emit('open-add-conditions', edge)" 
                      class="w-full py-2 flex items-center justify-center text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-md border border-dashed border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                    >
                      <LucidePlus class="w-4 h-4 mr-2" /> 
                      Ajouter des conditions
                    </button>
                  </div>
                </div>
                
                <!-- Section Dépendances -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Dépendances de clauses :</span>
                  </div>
                  
                  <!-- Liste des dépendances si présentes -->
                  <div v-if="edge.automataDependencies && edge.automataDependencies.length > 0" class="space-y-2">
                    <div 
                      v-for="dependencyId in edge.automataDependencies" 
                      :key="dependencyId"
                      class="flex items-center justify-between px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-100 dark:border-purple-800/50 group/dependency"
                    >
                      <span class="text-sm text-purple-700 dark:text-purple-300 truncate pr-2">
                        {{ getAutomataName(dependencyId) }}
                      </span>
                      <div class="flex items-center space-x-1 opacity-70 group-hover/dependency:opacity-100 transition-opacity">
                        <button 
                          @click="$emit('remove-dependency', edge.id, dependencyId)"
                          class="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 transition-colors"
                          title="Retirer la dépendance"
                        >
                          <LucideX class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    <!-- Bouton pour ajouter plus de dépendances quand il y en a déjà -->
                    <button 
                      @click="$emit('open-add-dependencies', edge)"
                      class="mt-2 w-full py-1.5 flex items-center justify-center text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-md border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors"
                    >
                      <LucidePlus class="w-3 h-3 mr-1" />
                      Ajouter plus de dépendances
                    </button>
                  </div>
                  <!-- Bouton stylisé si aucune dépendance -->
                  <div v-else>
                    <button 
                      @click="$emit('open-add-dependencies', edge)" 
                      class="w-full py-2 flex items-center justify-center text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-md border border-dashed border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors"
                    >
                      <LucideGitBranch class="w-4 h-4 mr-2" /> 
                      Dépendance clause
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Boutons d'action -->
            <div class="flex bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 divide-x divide-gray-200 dark:divide-gray-700">
              <!-- Bouton principal -->
              <button
                :class="[
                  'flex-grow py-2.5 px-3 text-sm font-medium transition-colors',
                  activeTransition === edge.id
                    ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                ]"
              >
                {{ activeTransition === edge.id ? 'Désélectionner' : 'Sélectionner' }}
              </button>
              
              <!-- Boutons d'action secondaires -->
              <div class="flex divide-x divide-gray-200 dark:divide-gray-700">
                <!-- Bouton de modification -->
                <button 
                  @click.stop="$emit('edit-transition', edge)" 
                  class="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Modifier"
                >
                  <LucidePencil class="w-4 h-4" />
                </button>
                
                <!-- Bouton d'inversion -->
                <button 
                  @click.stop="$emit('reverse-transition', edge)" 
                  class="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Inverser"
                >
                  <LucideArrowDownUp class="w-4 h-4" />
                </button>
                
                <!-- Bouton de suppression -->
                <button 
                  @click.stop="$emit('remove-transition', edge.id)" 
                  class="px-3 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Supprimer"
                >
                  <LucideTrash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    
    <!-- Message si aucun résultat après filtrage -->
    <div v-if="edges.length > 0 && filteredEdges.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
      Aucun déclencheur ne correspond à votre recherche.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  LucidePlus, 
  LucidePencil, 
  LucideTrash2, 
  LucideArrowDownUp, 
  LucideArrowRight, 
  LucideSearch,
  LucideInfo,
  LucideX,
  LucideGitBranch
} from 'lucide-vue-next';

// Props
const props = defineProps({
  edges: {
    type: Array,
    default: () => []
  },
  nodes: {
    type: Array,
    default: () => []
  },
  packetCondition: {
    type: Array,
    default: () => []
  },
  activeTransition: {
    type: String,
    default: null
  },
  contractAutomates: {
    type: Array,
    default: () => []
  }
});

// Événements émis
const emit = defineEmits([
  'select-transition', 
  'edit-transition', 
  'remove-transition', 
  'reverse-transition',
  'open-add-modal',
  'open-add-conditions',
  'open-condition-info',
  'remove-condition',
  'open-add-dependencies',
  'remove-dependency'
]);

// États réactifs
const sortAsc = ref(true);
const searchQuery = ref('');

// Computed properties
const sortedEdges = computed(() => {
  const edgesWithConditions = props.edges.map(edge => ({
    ...edge,
    conditions: edge.conditions || [],
    automataDependencies: edge.automataDependencies || []
  }));
  
  return [...edgesWithConditions].sort((a, b) => {
    const comparison = sortAsc.value
      ? a.label.localeCompare(b.label)
      : b.label.localeCompare(a.label);
    
    if (comparison === 0) {
      const aDependenciesCount = a.automataDependencies ? a.automataDependencies.length : 0;
      const bDependenciesCount = b.automataDependencies ? b.automataDependencies.length : 0;
      
      return sortAsc.value 
        ? aDependenciesCount - bDependenciesCount 
        : bDependenciesCount - aDependenciesCount;
    }
    
    return comparison;
  });
});

const filteredEdges = computed(() => {
  if (!searchQuery.value.trim()) return sortedEdges.value;
  
  const query = searchQuery.value.toLowerCase().trim();
  return sortedEdges.value.filter(edge => {
    if (edge.label.toLowerCase().includes(query)) return true;
    
    const sourceNode = props.nodes.find(n => n.id === edge.source);
    const targetNode = props.nodes.find(n => n.id === edge.target);
    
    const sourceName = sourceNode && sourceNode.data ? sourceNode.data.label.toLowerCase() : '';
    const targetName = targetNode && targetNode.data ? targetNode.data.label.toLowerCase() : '';
    
    const conditionsMatch = (edge.conditions || []).some(conditionId => {
      const conditionLabel = getConditionLabel(conditionId).toLowerCase();
      return conditionLabel.includes(query);
    });
    
    const automataDependenciesMatch = (edge.automataDependencies || []).some(dependencyId => {
      const automateName = getAutomataName(dependencyId).toLowerCase();
      return automateName.includes(query);
    });
    
    return sourceName.includes(query) || 
           targetName.includes(query) || 
           conditionsMatch ||
           automataDependenciesMatch;
  });
});

// Méthodes utilitaires
const getNodeName = (nodeId) => {
  const node = props.nodes.find(n => n.id === nodeId);
  return node && node.data ? node.data.label : nodeId;
};

const findCondition = (conditionId) => {
  for (const pkg of props.packetCondition) {
    const condition = pkg.functions.find(c => c.id === conditionId);
    if (condition) return condition;
  }
  return null;
};

const getConditionLabel = (conditionId) => {
  const condition = findCondition(conditionId);
  return condition ? condition.label : conditionId;
};

const getAutomataName = (dependencyId) => {
  const automate = props.contractAutomates.find(a => a.id === dependencyId);
  return automate ? automate.name : dependencyId;
};

// Méthodes
const toggleSort = () => {
  sortAsc.value = !sortAsc.value;
};
</script>