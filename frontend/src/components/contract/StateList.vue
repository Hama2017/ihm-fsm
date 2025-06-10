<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-5 transition-colors duration-300">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">
        États <span class="text-sm text-gray-400">({{ sortedStates.length }})</span>
      </h2>

      <div class="flex items-center space-x-3">
        <!-- Tri -->
        <button @click="toggleSort" class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
          <LucideArrowDownUp class="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>

        <!-- Ajouter -->
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
    <div v-if="sortedStates.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
      Cliquer sur le bouton <strong>"Ajouter"</strong> pour ajouter un état.
    </div>

    <!-- Barre de recherche pour filtrer les états -->
    <div v-if="sortedStates.length > 0" class="mb-4">
      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Rechercher un état..."
          class="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500">
          <LucideSearch class="w-4 h-4" />
        </div>
      </div>
    </div>

    <!-- Container avec hauteur fixe pour le défilement -->
    <div v-if="sortedStates.length > 0" class="relative min-h-0" style="height: 500px;">
      <!-- Liste des états avec scroll et style de scrollbar personnalisé -->
      <div class="absolute inset-0 overflow-y-auto scrolling-touch custom-scrollbar">
        <ul class="space-y-3 pb-4">
          <li 
            v-for="(state, index) in filteredStates" 
            :key="index"
            class="relative group mb-4"
          >
            <!-- Carte d'état avec design amélioré -->
            <div 
              :class="[
                'flex flex-col border rounded-lg overflow-hidden shadow-sm transition-all duration-200',
                selectedState === state.id 
                  ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
              ]"

                @click="toggleSelectState(state.id)"
            >
              <!-- Contenu principal de la carte d'état -->
              <div :class="[
                'px-4 py-3',
                selectedState === state.id 
                  ? 'bg-blue-500 dark:bg-blue-600' 
                  : 'bg-gray-50 dark:bg-gray-800'
              ]">
                <div class="flex justify-between items-center">
                  <span :class="[
                    'font-medium',
                    selectedState === state.id 
                      ? 'text-white' 
                      : 'text-gray-800 dark:text-gray-200'
                  ]">{{ state.label }}</span>
                  
                  <!-- Badge de sélection
                  <span v-if="selectedState === state.id" class="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                    Sélectionné
                  </span>
                   -->
                </div>
              </div>

              
              <!-- Indicateur de type d'état
              <div class="px-4 py-1 bg-white dark:bg-gray-800">
            
                

                <div class="flex items-center justify-between mb-1">
                  <div>
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Type :</span>
                    <span 
                      :class="[
                        'ml-2 px-2 py-1 text-xs rounded-md',
                        getStateTypeClass(getStateType(state.id))
                      ]"
                    >
                      {{ getStateTypeName(getStateType(state.id)) }}
                    </span>
                  </div>
                </div>
                
               
               
               
               

                 Nombre de connexions entrantes/sortantes 
                <div class="flex items-center justify-between mt-2 text-sm">
                  <div class="flex items-center text-gray-600 dark:text-gray-400">
                    <div class="flex items-center mr-3">
                      <LucideArrowDownCircle class="w-4 h-4 mr-1 text-green-500 dark:text-green-400" />
                      <span>{{ getIncomingEdgesCount(state.id) }}</span>
                    </div>
                    <div class="flex items-center">
                      <LucideArrowUpCircle class="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" />
                      <span>{{ getOutgoingEdgesCount(state.id) }}</span>
                    </div>
                  </div>
                </div>
              </div>
               -->
              
              <!-- Boutons d'action -->
              <div class="flex bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 divide-x divide-gray-200 dark:divide-gray-700">
                <!-- Bouton principal -->
                <button

                  :class="[
                    'flex-grow py-2.5 px-3 text-sm font-medium transition-colors',
                    selectedState === state.id
                      ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  ]"
                >
                  {{ selectedState === state.id ? 'Désélectionner' : 'Sélectionner' }}
                </button>
                
                <!-- Boutons d'action secondaires -->
                <div class="flex divide-x divide-gray-200 dark:divide-gray-700">
                  <!-- Bouton de modification -->
                  <button 
                  v-if="state.label !== 'COMPLETED'"

                    @click.stop="$emit('open-edit-modal', state.id)" 
                    class="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Modifier"
                  >
                    <LucidePencil class="w-4 h-4" />
                  </button>
                  
                  <!-- Bouton de suppression -->
                  <button 
                  v-if="state.label !== 'COMPLETED'"

                    @click.stop="$emit('open-remove-modal', state.id)" 
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
    </div>
    
    <!-- Message si aucun résultat après filtrage -->
    <div v-if="sortedStates.length > 0 && filteredStates.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
      Aucun état ne correspond à votre recherche.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  LucidePlus,
  LucidePencil,
  LucideTrash2,
  LucideArrowDownUp,
  LucideSearch,
  LucideArrowDownCircle,
  LucideArrowUpCircle
} from 'lucide-vue-next'

const emits = defineEmits([
  'add-state', 
  'edit-state', 
  'remove-state', 
  'select-state', 
  'open-add-modal', 
  'open-edit-modal', 
  'open-remove-modal'
])

const nodes = defineModel('nodes')
const props = defineProps({
  selectedState: { type: String, default: null },
  edges: { type: Array, default: () => [] }
})

const sortAsc = ref(true)
const searchQuery = ref('')

const states = computed(() => 
  Array.isArray(nodes.value)
    ? nodes.value.map(node => ({ id: node.id, label: node.data.label }))
    : []
)

const sortedStates = computed(() => {
  return [...states.value].sort((a, b) =>
    sortAsc.value
      ? a.label.localeCompare(b.label)
      : b.label.localeCompare(a.label)
  )
})

const filteredStates = computed(() => {
  if (!searchQuery.value.trim()) return sortedStates.value
  const query = searchQuery.value.toLowerCase().trim()
  return sortedStates.value.filter(state => 
    state.label.toLowerCase().includes(query)
  )
})

const getStateType = (stateId) => {
  const node = nodes.value.find(n => n.id === stateId);
  console.log('ff',node)
  if (!node) return 'standard';
  
  // Détermine le type d'état basé sur les propriétés du nœud
  if (node.type === 'initial' || (node.data && node.data.type === 'initial')) {
    return 'initial';
  } else if (node.type === 'final' || (node.data && node.data.type === 'final')) {
    return 'final';
  }
  
  // Par défaut, considérer comme état standard
  return 'standard';
};

const getStateTypeName = (type) => {
  switch (type) {
    case 'initial': return 'Initial';
    case 'final': return 'Final';
    default: return 'Standard';
  }
};

const getStateTypeClass = (type) => {
  switch (type) {
    case 'initial': 
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    case 'final': 
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    default: 
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  }
};

const getIncomingEdgesCount = (stateId) => {
  return props.edges.filter(edge => edge.target === stateId).length;
};

const getOutgoingEdgesCount = (stateId) => {
  return props.edges.filter(edge => edge.source === stateId).length;
};

const toggleSelectState = (id) => {
  if (props.selectedState === id) {
    emits('select-state', null)
  } else {
    emits('select-state', id)
  }
}

const toggleSort = () => {
  sortAsc.value = !sortAsc.value
}
</script>

<style scoped>
/* Personnalisation améliorée de la barre de défilement */
.custom-scrollbar {
  scrollbar-width: auto;
}

/* Styles pour les navigateurs webkit (Chrome, Safari, etc.) */
.custom-scrollbar::-webkit-scrollbar {
  width: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
  border-radius: 8px;
  border: 2px solid #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #a0a0a0;
}

/* Styles pour le mode sombre */
.dark .custom-scrollbar::-webkit-scrollbar-track {
  background: #2d3748;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4a5568;
  border: 2px solid #2d3748;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #718096;
}

/* Ajustements CSS pour éviter les problèmes de débordement */
.min-h-0 {
  min-height: 0;
}

.scrolling-touch {
  -webkit-overflow-scrolling: touch;
}
</style>