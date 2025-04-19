<template>
  <!-- Éditeur d'automate en grille 3 colonnes -->
  <div class="grid grid-cols-[1fr_3fr_1fr] gap-6">
    <!-- Colonne gauche : Liste des automates -->
    <div>
      <AutomateList />
    </div>

    <!-- Colonne centrale : VueFlow (éditeur visuel) -->
    <div>
      <div class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-inner h-[500px] relative transition-colors">
        <VueFlow 
          v-model:nodes="nodes" 
          v-model:edges="edges"
          class="h-full w-full"
          @connect="onConnectNodes"
          @edgeUpdate="onEdgeUpdate"
        >
          <MiniMap pannable zoomable />
          <Controls />
          <Background />
        </VueFlow>

        <button
          class="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium flex items-center shadow-lg"
          @click="showDeployConfirmation = true"
        >
          <LucideRocket class="w-4 h-4" />
          <span class="ml-2">Déployer</span>
        </button>
      </div>
    </div>

    <!-- Colonne droite : États et Fonctions -->
    <div class="space-y-6">
      <StateList
        v-model:nodes="nodes"
        :edges="edges"
        @add-state="onAddState"
        @edit-state="onEditState"
        @remove-state="onRemoveState"
        @select-state="onSelectState"
        :selectedState="activeNodeId"
      />     
      <FunctionList />
    </div>
    
    <!-- Container pour les toasts -->
    <ToastContainer />
    
    <!-- Modals -->
    <TransitionModal 
      ref="transitionModal"
      :transitions="availableTransitions"
      @confirm="onTransitionConfirm"
    />
    
    <!-- Modal de confirmation de déploiement -->
    <Modal
      v-model="showDeployConfirmation"
      title="Déployer l'automate"
      confirm-text="Déployer"
      @confirm="deployAutomate"
    >
      <p class="text-gray-700 dark:text-gray-300">
        Êtes-vous sûr de vouloir déployer cet automate ?
      </p>
    </Modal>
    
    <!-- Modal de mise à jour des connexions -->
    <Modal
      v-model="showEdgeUpdateModal"
      title="Modifier la transition"
      @confirm="confirmEdgeUpdate"
    >
      <div class="space-y-3">
        <div class="flex items-center">
          <span class="font-medium w-32 text-gray-700 dark:text-gray-300">Nouvelle origine:</span>
          <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
            {{ edgeUpdateSourceName }}
          </span>
        </div>
        <div class="flex items-center">
          <span class="font-medium w-32 text-gray-700 dark:text-gray-300">Nouvelle destination:</span>
          <span class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
            {{ edgeUpdateTargetName }}
          </span>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import { Background } from '@vue-flow/background'

import AutomateList from '@/components/fsm/AutomateList.vue'
import StateList from '@/components/fsm/StateList.vue'
import FunctionList from '@/components/fsm/FunctionList.vue'
import { LucideRocket } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import Modal from '@/components/ui/UiModal.vue'
import TransitionModal from '@/components/ui/UiTransitionModal.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import toast from '@/components/ui/ToastService'

const themeStore = useThemeStore();

// Styles VueFlow
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import '@vue-flow/core/dist/style.css'

// --- Styles des nœuds en fonction du thème ---
const isDarkMode = computed(() => themeStore.darkMode)

// Styles de base pour les nœuds normaux
const getBaseNodeStyle = () => {
  return {
    padding: '8px 16px',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '9999px',
    transition: 'all 0.2s ease',
    backgroundColor: isDarkMode.value ? '#374151' : '#f3f4f6', // dark:bg-gray-700 : bg-gray-100
    color: isDarkMode.value ? '#d1d5db' : '#1f2937', // dark:text-gray-300 : text-gray-800
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  }
}

// Styles pour les nœuds sélectionnés
const getSelectedNodeStyle = () => {
  return {
    padding: '8px 16px',
    fontSize: '0.875rem',
    fontWeight: '600',
    borderRadius: '9999px',
    transition: 'all 0.2s ease',
    background: 'linear-gradient(to top right, #3b82f6, #1d4ed8)', // from-blue-500 to-blue-700
    color: '#ffffff', // text-white
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-lg
  }
}

// --- Liste des transitions disponibles ---
const availableTransitions = ref([
  { value: 'valider', label: 'Valider' },
  { value: 'refuser', label: 'Refuser' },
  { value: 'reporter', label: 'Reporter' },
  { value: 'annuler', label: 'Annuler' },
  { value: 'terminer', label: 'Terminer' },
  { value: 'suspendre', label: 'Suspendre' },
  { value: 'reprendre', label: 'Reprendre' },
  { value: 'commenter', label: 'Commenter' },
  { value: 'escalader', label: 'Escalader' },
  { value: 'transférer', label: 'Transférer' }
])

// --- Références réactives ---
const nodes = ref([
  {
    id: 'state-1',
    position: { x: 100, y: 150 },
    data: { label: 'État Initial' },
    style: getBaseNodeStyle(),
  },
  {
    id: 'state-2',
    position: { x: 300, y: 150 },
    data: { label: 'État Final' },
    style: getBaseNodeStyle(),
  }
])

const edges = ref([
  { id: 'edge-1', source: 'state-1', target: 'state-2', label: 'terminer' },
])

const activeNodeId = ref(null)

// --- Références aux modals ---
const transitionModal = ref(null)
const showDeployConfirmation = ref(false)

// Variables pour la mise à jour des arêtes
const showEdgeUpdateModal = ref(false)
const edgeUpdateData = ref(null)
const edgeUpdateSourceName = ref('')
const edgeUpdateTargetName = ref('')

// --- Gestion des événements VueFlow ---
const { onNodeClick, findNode, setSelectedElements } = useVueFlow()

// Mettre à jour les styles des nœuds quand le thème change
watch(isDarkMode, () => {
  updateNodeStyles(activeNodeId.value)
})

// Sélection d'un nœud dans VueFlow avec possibilité de désélection
onNodeClick(({ node }) => {
  // Si le nœud cliqué est déjà le nœud actif, le désélectionner
  if (activeNodeId.value === node.id) {
    activeNodeId.value = null
    updateNodeStyles(null)
    setSelectedElements({ nodes: [], edges: [] })
  } else {
    // Sinon, sélectionner le nouveau nœud
    activeNodeId.value = node.id
    updateNodeStyles(node.id)
  }
})

// Mise à jour des styles de nœuds
const updateNodeStyles = (selectedId) => {
  nodes.value.forEach(node => {
    node.style = node.id === selectedId 
      ? getSelectedNodeStyle() 
      : getBaseNodeStyle()
  })
}

// Sélection d'un état depuis la liste avec possibilité de désélection
const onSelectState = (stateId) => {
  // Si l'état est déjà sélectionné, le désélectionner
  if (activeNodeId.value === stateId) {
    // Désélectionner
    activeNodeId.value = null
    updateNodeStyles(null)
    setSelectedElements({ nodes: [], edges: [] })
  } else {
    // Sélectionner le nouvel état
    activeNodeId.value = stateId
    updateNodeStyles(stateId)
    
    // Sélectionner le nœud dans VueFlow si stateId n'est pas null
    if (stateId) {
      const node = findNode(stateId)
      if (node) {
        setSelectedElements({ nodes: [node], edges: [] })
      }
    }
  }
}

// --- Ajouter un nouvel état ---
const onAddState = (state) => {
  // Générer une position aléatoire dans une zone visible
  const randomPosition = {
    x: 50 + Math.random() * 400, // Entre 50 et 450 px
    y: 50 + Math.random() * 300, // Entre 50 et 350 px
  }
  
  nodes.value.push({
    id: state.id,
    position: randomPosition,
    data: { label: state.libelle },
    style: getBaseNodeStyle(),
  })
}

// --- Modifier un état ---
const onEditState = ({ id, libelle }) => {
  const node = nodes.value.find(n => n.id === id)
  if (node) {
    node.data.label = libelle
  }
}

// --- Supprimer un état ---
const onRemoveState = (id) => {
  nodes.value = nodes.value.filter(n => n.id !== id)
  // Si le nœud supprimé était sélectionné, désélectionner
  if (activeNodeId.value === id) {
    activeNodeId.value = null
  }
  // Supprimer également les connexions associées
  edges.value = edges.value.filter(e => e.source !== id && e.target !== id)
}

// --- Connexion entre deux nœuds avec sélection de transition ---
const onConnectNodes = ({ source, target }) => {
  // Éviter les connexions d'un nœud à lui-même
  if (source === target) {
    toast.error('Impossible de connecter un état à lui-même', { duration: 3000 })
    return
  }
  
  // Vérifier si cette connexion existe déjà
  const connectionExists = edges.value.some(
    edge => edge.source === source && edge.target === target
  )
  
  if (connectionExists) {
    toast.error('Cette transition existe déjà', { duration: 3000 })
    return
  }
  
  // Récupérer les noms des états source et cible pour le dialogue
  const sourceNode = nodes.value.find(node => node.id === source)
  const targetNode = nodes.value.find(node => node.id === target)
  const sourceName = sourceNode ? sourceNode.data.label : source
  const targetName = targetNode ? targetNode.data.label : target
  
  // Ouvrir le modal de sélection de transition
  transitionModal.value.open(source, target, sourceName, targetName)
}

// --- Callback de confirmation du modal de transition ---
const onTransitionConfirm = ({ source, target, transition }) => {
  const sourceNode = nodes.value.find(node => node.id === source)
  const targetNode = nodes.value.find(node => node.id === target)
  const sourceName = sourceNode ? sourceNode.data.label : source
  const targetName = targetNode ? targetNode.data.label : target
  
  const newEdge = {
    id: `edge-${Date.now()}`,
    source,
    target,
    label: transition,
  }
  
  edges.value.push(newEdge)
  toast.success(`Transition ajoutée: ${sourceName} → ${targetName}`, { duration: 3000 })
}

// --- Mettre à jour une connexion existante ---
const onEdgeUpdate = ({ oldEdge, newConnection }) => {
  // Récupérer les noms des états source et cible pour le dialogue
  const sourceNode = nodes.value.find(node => node.id === newConnection.source)
  const targetNode = nodes.value.find(node => node.id === newConnection.target)
  const sourceName = sourceNode ? sourceNode.data.label : newConnection.source
  const targetName = targetNode ? targetNode.data.label : newConnection.target
  
  // Stocker les données pour la confirmation
  edgeUpdateData.value = { oldEdge, newConnection }
  edgeUpdateSourceName.value = sourceName
  edgeUpdateTargetName.value = targetName
  
  // Ouvrir le modal de confirmation
  showEdgeUpdateModal.value = true
}

// --- Confirmer la mise à jour d'une arête ---
const confirmEdgeUpdate = () => {
  const { oldEdge, newConnection } = edgeUpdateData.value
  
  // Supprimer l'ancienne connexion
  edges.value = edges.value.filter(e => e.id !== oldEdge.id)
  
  // Ajouter la nouvelle connexion avec le même label
  const updatedEdge = {
    ...oldEdge,
    id: `edge-${Date.now()}`,
    source: newConnection.source,
    target: newConnection.target,
  }
  
  edges.value.push(updatedEdge)
  toast.success('Transition mise à jour', { duration: 3000 })
  
  // Fermer le modal
  showEdgeUpdateModal.value = false
}

// --- Déploiement de l'automate ---
const deployAutomate = () => {
  // Vérification de validité de l'automate
  if (nodes.value.length < 2) {
    toast.error('L\'automate doit contenir au moins deux états', { duration: 3000 })
    showDeployConfirmation.value = false
    return
  }
  
  if (edges.value.length === 0) {
    toast.error('L\'automate doit contenir au moins une transition', { duration: 3000 })
    showDeployConfirmation.value = false
    return
  }
  
  // Si tout est valide
  console.log('Automate déployé :', { nodes: nodes.value, edges: edges.value })
  
  toast.success('Votre automate a été déployé avec succès', { duration: 3000 })
  showDeployConfirmation.value = false
}
</script>