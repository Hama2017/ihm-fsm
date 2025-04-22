<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-5 transition-colors duration-300">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">
        Etats <span class="text-sm text-gray-400">({{ sortedStates.length }})</span>
      </h2>

      <div class="flex items-center space-x-3">
        <!-- Tri (seulement icône) -->
        <button @click="toggleSort" class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          <LucideArrowDownUp class="w-4 h-4 text-gray-800 dark:text-gray-200" />
        </button>

        <!-- Ajouter (plus petit avec hover amélioré) -->
        <button 
          @click="$emit('open-add-modal')"
          class="bg-gradient-to-tr from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700 dark:text-white px-2.5 py-1.5 rounded-full hover:shadow-lg hover:scale-105 hover:bg-blue-500 transition-all duration-200 flex items-center"
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

    <!-- Liste des états avec scroll et style de scrollbar personnalisé -->
    <div v-if="sortedStates.length > 0" class="max-h-[500px] overflow-y-auto pr-1" style="scrollbar-width: thin; scrollbar-color: #cbd5e0 #f1f5f9;">
      <ul class="space-y-3">
        <li 
          v-for="(state, index) in filteredStates" 
          :key="index"
          class="relative group mb-4"
        >
          <!-- Carte d'état avec design amélioré -->
          <div :class="[
            'flex flex-col border rounded-lg overflow-hidden shadow-sm',
            selectedState === state.id 
              ? 'border-blue-500 dark:border-blue-400' 
              : 'border-gray-200 dark:border-gray-700'
          ]">
            <!-- Contenu principal de la carte d'état -->
            <div :class="[
              'px-4 py-3',
              selectedState === state.id 
                ? 'bg-blue-600 dark:bg-blue-700 border-b border-blue-700 dark:border-blue-800' 
                : 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'
            ]">
              <div class="flex justify-between items-center">
                <span :class="[
                  'font-medium',
                  selectedState === state.id 
                    ? 'text-white' 
                    : 'text-gray-800 dark:text-gray-200'
                ]">{{ state.label }}</span>
                
                <!-- Badge de sélection -->
                <span v-if="selectedState === state.id" class="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                  Sélectionné
                </span>
              </div>
            </div>
            
            <!-- Boutons d'action -->
            <div class="flex bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 divide-x divide-gray-200 dark:divide-gray-700">
              <!-- Bouton principal -->
              <button
                @click="toggleSelectState(state.id)"
                :class="[
                  'flex-grow py-2 px-3 text-sm font-medium transition-colors',
                  selectedState === state.id
                    ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                ]"
              >
                {{ selectedState === state.id ? 'Désélectionner' : 'Sélectionner' }}
              </button>
              
              <!-- Bouton de modification -->
              <button 
                @click.stop="$emit('open-edit-modal', state.id)" 
                class="px-3 py-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                title="Modifier"
              >
                <LucidePencil class="w-4 h-4" />
              </button>
              
              <!-- Bouton de suppression -->
              <button 
                @click.stop="$emit('open-remove-modal', state.id)" 
                class="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Supprimer"
              >
                <LucideTrash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </li>
      </ul>
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
  LucideSearch
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