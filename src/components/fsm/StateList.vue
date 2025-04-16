<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-5 transition-colors duration-300">
    
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">
        ETATS <span class="text-sm text-gray-400">({{ sortedStates.length }})</span>
      </h2>

      <div class="flex items-center space-x-2">
        <!-- Tri -->
        <button @click="toggleSort" class="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          <LucideArrowDownUp class="w-4 h-4 text-gray-800 dark:text-gray-200" />
        </button>

        <!-- Ajouter -->
        <button 
          @click="showAddStateModal = true"
          class="bg-gradient-to-tr from-purple-100 to-purple-200 text-purple-700 dark:from-purple-900 dark:to-purple-800 dark:text-purple-300 px-2 py-1 rounded-full hover:scale-105 transition flex items-center"
        >
          <LucidePlus class="w-4 h-4" />
          <span class="ml-2 text-sm font-medium">Ajouter</span>
        </button>
      </div>
    </div>

    <!-- Message si vide -->
    <div v-if="sortedStates.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
      Cliquer sur le bouton <strong>"Ajouter"</strong> pour ajouter un état.
    </div>

    <!-- Liste des états -->
    <ul v-else class="space-y-3">
      <li 
        v-for="(state, index) in sortedStates" 
        :key="index"
        class="relative group"
      >
        <div class="flex items-center">
          <!-- Bouton état -->
          <button
            @click="toggleSelectState(state.id)"
            :class="[
              'flex-grow px-4 py-2 text-sm font-medium shadow-sm rounded-full transition-colors duration-200 text-left',
              selectedState === state.id
                ? 'bg-gradient-to-tr from-blue-500 to-blue-700 text-white font-semibold shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            ]"
          >
            {{ state.label }}
          </button>

          <!-- Actions -->
          <div class="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
            <button @click.stop="openEditStateModal(state.id)" class="flex items-center p-1 rounded-full transition bg-yellow-500 text-white hover:bg-yellow-600">
              <LucidePencil class="w-4 h-4" />
            </button>

            <button @click.stop="openRemoveStateModal(state.id)" class="flex items-center p-1 rounded-full transition bg-red-600 text-white hover:bg-red-700">
              <LucideTrash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </li>
    </ul>
    
    <!-- Modals -->
    <!-- Modal Ajouter État -->
    <Modal
      v-model="showAddStateModal"
      title="Ajouter un état"
      confirm-text="Ajouter"
      @confirm="confirmAddState"
    >
      <div class="space-y-4">
        <label for="new-state-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nom du nouvel état
        </label>
        <input 
          id="new-state-name"
          v-model="newStateName"
          type="text"
          placeholder="ex: EN_COURS"
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <p v-if="addStateError" class="text-sm text-red-600 dark:text-red-400">
          {{ addStateError }}
        </p>
      </div>
    </Modal>
    
    <!-- Modal Modifier État -->
    <Modal
      v-model="showEditStateModal"
      title="Modifier un état"
      confirm-text="Modifier"
      @confirm="confirmEditState"
    >
      <div class="space-y-4">
        <label for="edit-state-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nouveau nom
        </label>
        <input 
          id="edit-state-name"
          v-model="editStateName"
          type="text"
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <p v-if="editStateError" class="text-sm text-red-600 dark:text-red-400">
          {{ editStateError }}
        </p>
      </div>
    </Modal>
    
    <!-- Modal Supprimer État -->
    <Modal
      v-model="showRemoveStateModal"
      title="Supprimer cet état ?"
      confirm-text="Oui, supprimer"
      variant="danger"
      @confirm="confirmRemoveState"
    >
      <div class="space-y-2">
        <p class="text-gray-700 dark:text-gray-300">
          Cette action est irréversible.
        </p>
        <p v-if="stateUsedInEdges" class="text-yellow-600 dark:text-yellow-400 font-medium">
          Cet état est utilisé dans une ou plusieurs transitions qui seront également supprimées.
        </p>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  LucidePlus,
  LucidePencil,
  LucideTrash2,
  LucideArrowDownUp
} from 'lucide-vue-next'
import Modal from '@/components/ui/UiModal.vue'
import toast from '@/components/ui/ToastService'

// --- Props / Événements
const emits = defineEmits(['add-state', 'edit-state', 'remove-state', 'select-state'])
const nodes = defineModel('nodes') // v-model:nodes

// Accepter les edges en prop pour vérifier si un état est utilisé dans des transitions
const props = defineProps({
  selectedState: {
    type: String,
    default: null
  },
  edges: {
    type: Array,
    default: () => []
  }
})

// --- États internes
const sortAsc = ref(true)

// --- États modaux
const showAddStateModal = ref(false)
const showEditStateModal = ref(false)
const showRemoveStateModal = ref(false)
const newStateName = ref('')
const editStateName = ref('')
const editStateId = ref(null)
const removeStateId = ref(null)
const addStateError = ref('')
const editStateError = ref('')
const stateUsedInEdges = ref(false)

// --- Liste des états dérivée de nodes
const states = computed(() => 
  Array.isArray(nodes.value)
    ? nodes.value.map(node => ({
        id: node.id,
        label: node.data.label
      }))
    : []
)

// --- Liste triée
const sortedStates = computed(() => {
  return [...states.value].sort((a, b) =>
    sortAsc.value
      ? a.label.localeCompare(b.label)
      : b.label.localeCompare(a.label)
  )
})

// --- Vider les formulaires lorsque les modals se ferment
watch(showAddStateModal, (newVal) => {
  if (!newVal) {
    newStateName.value = ''
    addStateError.value = ''
  }
})

watch(showEditStateModal, (newVal) => {
  if (!newVal) {
    editStateName.value = ''
    editStateId.value = null
    editStateError.value = ''
  }
})

// --- Vérifier si un nom d'état existe déjà (insensible à la casse)
const stateNameExists = (name, excludeId = null) => {
  return states.value.some(state => 
    state.label.toLowerCase() === name.toLowerCase() && 
    state.id !== excludeId
  )
}

// --- Sélectionner/désélectionner un état (modifié pour liaison bidirectionnelle)
const toggleSelectState = (id) => {
  // Si l'état est déjà sélectionné, on l'émet avec null pour désélectionner
  if (props.selectedState === id) {
    emits('select-state', null)
  } else {
    // Sinon, on sélectionne le nouvel état
    emits('select-state', id)
  }
}

// --- Inverser l'ordre de tri
const toggleSort = () => {
  sortAsc.value = !sortAsc.value
}

// --- Ajouter un état avec validation
const confirmAddState = () => {
  // Validation
  if (!newStateName.value || !newStateName.value.trim()) {
    addStateError.value = 'Le nom de l\'état ne peut pas être vide!'
    return
  }
  
  // Validation du nom unique
  if (stateNameExists(newStateName.value)) {
    addStateError.value = 'Un état avec ce nom existe déjà!'
    return
  }
  
  const newId = 'state-' + (nodes.value?.length + 1 || 1)
  emits('add-state', { id: newId, libelle: newStateName.value.trim() })
  
  // Fermer le modal
  showAddStateModal.value = false
  
  // Afficher un toast de succès
  toast.success('État ajouté avec succès', { position: 'top-right', duration: 3000 })
}

// --- Ouvrir le modal de modification d'état
const openEditStateModal = (id) => {
  const node = nodes.value?.find(n => n.id === id)
  if (node) {
    editStateId.value = id
    editStateName.value = node.data.label
    showEditStateModal.value = true
  }
}

// --- Modifier un état avec validation
const confirmEditState = () => {
  // Validation
  if (!editStateName.value || !editStateName.value.trim()) {
    editStateError.value = 'Le nom de l\'état ne peut pas être vide!'
    return
  }
  
  // Validation du nom unique (en excluant l'ID actuel)
  if (stateNameExists(editStateName.value, editStateId.value)) {
    editStateError.value = 'Un état avec ce nom existe déjà!'
    return
  }
  
  emits('edit-state', { id: editStateId.value, libelle: editStateName.value.trim() })
  
  // Fermer le modal
  showEditStateModal.value = false
  
  // Afficher un toast de succès
  toast.success('État modifié avec succès', { position: 'top-right', duration: 3000 })
}

// --- Ouvrir le modal de suppression d'état
const openRemoveStateModal = (id) => {
  removeStateId.value = id
  stateUsedInEdges.value = checkIfStateUsedInEdges(id)
  showRemoveStateModal.value = true
}

// --- Supprimer un état
const confirmRemoveState = () => {
  emits('remove-state', removeStateId.value)
  
  // Fermer le modal
  showRemoveStateModal.value = false
  
  // Afficher un toast de succès
  toast.success('État supprimé avec succès', { position: 'top-right', duration: 3000 })
}

// Vérifier si un état est utilisé dans des transitions
const checkIfStateUsedInEdges = (stateId) => {
  return props.edges.some(edge => edge.source === stateId || edge.target === stateId)
}
</script>