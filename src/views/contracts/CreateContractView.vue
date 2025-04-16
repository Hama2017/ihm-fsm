<template>
  <div>
    <!-- En-tête avec nom du contrat et bouton de sauvegarde -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {{ contractName.trim() || 'Nouveau contrat' }}
      </h1>
      <button 
        @click="saveContract"
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition duration-200"
        :disabled="!contractName.trim()"
      >
        <LucideSave class="h-4 w-4" />
        <span>Sauvegarder</span>
      </button>
    </div>
      
    <!-- Champ pour le nom du contrat -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex-grow">
          <label for="contract-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom du contrat
          </label>
          <input 
            id="contract-name"
            type="text" 
            v-model="contractName"
            placeholder="Saisir le nom du contrat..." 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
          />
        </div>
      </div>
    </div>
      
    <!-- Contenu principal avec la liste des automates et l'éditeur -->
    <div class="grid grid-cols-[1fr_3fr_1fr] gap-6">
      <!-- Colonne gauche : Liste des automates -->
      <div>
        <AutomateList 
          :automates="contractAutomates"
          :activeAutomate="activeAutomateId"
          @select-automate="selectAutomate"
          @add-automate="addAutomate"
          @edit-automate="editAutomate"
          @remove-automate="removeAutomate"
        />
      </div>

      <!-- Colonne centrale : Éditeur d'automate -->
      <div v-if="activeAutomateId">
        <div class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-inner h-[500px] relative transition-colors">
          <VueFlow 
            v-model:nodes="currentNodes" 
            v-model:edges="currentEdges"
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
            @click="saveAutomate"
          >
            <LucideCheck class="w-4 h-4" />
            <span class="ml-2">Appliquer</span>
          </button>
        </div>
      </div>
      <div v-else class="flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl h-[500px] text-gray-500 dark:text-gray-400">
        <div class="text-center p-8">
          <LucideFileWarning class="w-12 h-12 mx-auto mb-4" />
          <p>Aucun automate sélectionné.</p>
          <p class="mt-2">Veuillez créer ou sélectionner un automate dans la liste.</p>
        </div>
      </div>

      <!-- Colonne droite : États et Fonctions -->
      <div class="space-y-6">
        <StateList
          v-if="activeAutomateId"
          v-model:nodes="currentNodes"
          :edges="currentEdges"
          @add-state="onAddState"
          @edit-state="onEditState"
          @remove-state="onRemoveState"
          @select-state="onSelectState"
          :selectedState="activeStateId"
        />     
        <FunctionList 
          v-if="activeAutomateId"
          :transitions="availableTransitions"
          :activeTransition="activeTransitionId"
          @select-transition="selectTransition"
          @add-transition="addTransition"
          @edit-transition="editTransition"
          @remove-transition="removeTransition"
        />
      </div>
    </div>
    
    <!-- Container pour les toasts -->
    <ToastContainer />
    
    <!-- Modals -->
    <TransitionModal 
      ref="transitionModal"
      :transitions="availableTransitions"
      @confirm="onTransitionConfirm"
    />
    
    <!-- Modal pour l'ajout/édition d'un automate -->
    <Modal
      v-model="showAutomateModal"
      :title="editingAutomateId ? 'Modifier l\'automate' : 'Nouvel automate'"
      confirm-text="Valider"
      @confirm="confirmAutomateEdit"
    >
      <div class="space-y-4">
        <label for="automate-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nom de l'automate
        </label>
        <input 
          id="automate-name"
          v-model="editingAutomateName"
          type="text"
          placeholder="ex: Processus de validation"
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <p v-if="automateModalError" class="text-sm text-red-600 dark:text-red-400">
          {{ automateModalError }}
        </p>
      </div>
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
import { ref, watch, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import { Controls } from '@vue-flow/controls';
import { Background } from '@vue-flow/background';
import { LucideSave, LucideCheck, LucideFileWarning } from 'lucide-vue-next';

import AutomateList from '@/components/fsm/AutomateList.vue';
import StateList from '@/components/fsm/StateList.vue';
import FunctionList from '@/components/fsm/FunctionList.vue';
import Modal from '@/components/ui/UiModal.vue';
import TransitionModal from '@/components/ui/UiTransitionModal.vue';
import ToastContainer from '@/components/ui/ToastContainer.vue';
import toast from '@/components/ui/ToastService';
import { useThemeStore } from '@/stores/theme';
import { storeToRefs } from 'pinia';

// Import des styles VueFlow
import '@vue-flow/core/dist/style.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';

// Router
const router = useRouter();

// Theme store
const themeStore = useThemeStore();
const { darkMode } = storeToRefs(themeStore);

// --- États réactifs ---
const contractName = ref('');
const contractAutomates = ref([]);
const activeAutomateId = ref(null);
const activeStateId = ref(null);
const activeTransitionId = ref(null);

// Nœuds et arêtes pour l'automate actif
const currentNodes = ref([]);
const currentEdges = ref([]);

// Références aux modals
const transitionModal = ref(null);
const showAutomateModal = ref(false);
const showEdgeUpdateModal = ref(false);
const editingAutomateId = ref(null);
const editingAutomateName = ref('');
const automateModalError = ref('');

// Variables pour la mise à jour des arêtes
const edgeUpdateData = ref(null);
const edgeUpdateSourceName = ref('');
const edgeUpdateTargetName = ref('');

// --- Liste des transitions disponibles ---
// Cette liste pourrait être chargée depuis une API ou un store
const availableTransitions = ref([
  { id: 'transition-1', value: 'valider', label: 'Valider' },
  { id: 'transition-2', value: 'refuser', label: 'Refuser' },
  { id: 'transition-3', value: 'reporter', label: 'Reporter' },
  { id: 'transition-4', value: 'annuler', label: 'Annuler' },
  { id: 'transition-5', value: 'terminer', label: 'Terminer' },
  { id: 'transition-6', value: 'suspendre', label: 'Suspendre' },
  { id: 'transition-7', value: 'reprendre', label: 'Reprendre' },
  { id: 'transition-8', value: 'commenter', label: 'Commenter' },
  { id: 'transition-9', value: 'escalader', label: 'Escalader' },
  { id: 'transition-10', value: 'transférer', label: 'Transférer' }
]);

// --- Gestion des événements VueFlow ---
const { onNodeClick, findNode, setSelectedElements } = useVueFlow();

// --- Styles des nœuds en fonction du thème ---
const isDarkMode = computed(() => darkMode.value);

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

// Mettre à jour les styles des nœuds quand le thème change
watch(isDarkMode, () => {
  updateNodeStyles(activeStateId.value);
});

// Mise à jour des styles de nœuds
const updateNodeStyles = (selectedId) => {
  currentNodes.value.forEach(node => {
    node.style = node.id === selectedId 
      ? getSelectedNodeStyle() 
      : getBaseNodeStyle();
  });
}

// Sélection d'un nœud dans VueFlow
onNodeClick(({ node }) => {
  // Si le nœud cliqué est déjà le nœud actif, le désélectionner
  if (activeStateId.value === node.id) {
    activeStateId.value = null;
    updateNodeStyles(null);
    setSelectedElements({ nodes: [], edges: [] });
  } else {
    // Sinon, sélectionner le nouveau nœud
    activeStateId.value = node.id;
    updateNodeStyles(node.id);
  }
});

// --- Fonctions pour interagir avec les automates ---
const selectAutomate = (id) => {
  if (activeAutomateId.value === id) {
    // Si on clique sur l'automate déjà actif, on ne fait rien
    return;
  }
  
  // Si on change d'automate, on sauvegarde l'état actuel si nécessaire
  if (activeAutomateId.value) {
    saveCurrentAutomateState();
  }
  
  // Puis on charge le nouvel automate
  activeAutomateId.value = id;
  loadAutomateState(id);
  
  // Réinitialiser l'état actif
  activeStateId.value = null;
  activeTransitionId.value = null;
};

const addAutomate = () => {
  // Réinitialiser les champs du modal
  editingAutomateId.value = null;
  editingAutomateName.value = '';
  automateModalError.value = '';
  
  // Afficher le modal
  showAutomateModal.value = true;
};

const editAutomate = (id) => {
  const automate = contractAutomates.value.find(a => a.id === id);
  if (!automate) return;
  
  // Préremplir les champs du modal
  editingAutomateId.value = id;
  editingAutomateName.value = automate.name;
  automateModalError.value = '';
  
  // Afficher le modal
  showAutomateModal.value = true;
};

const removeAutomate = (id) => {
  // Trouver l'index de l'automate à supprimer
  const index = contractAutomates.value.findIndex(a => a.id === id);
  if (index === -1) return;
  
  // Si on supprime l'automate actif, il faut réinitialiser l'affichage
  if (activeAutomateId.value === id) {
    activeAutomateId.value = null;
    currentNodes.value = [];
    currentEdges.value = [];
    activeStateId.value = null;
    activeTransitionId.value = null;
  }
  
  // Supprimer l'automate
  contractAutomates.value.splice(index, 1);
  
  // Si c'était le dernier automate actif, sélectionner le premier disponible
  if (contractAutomates.value.length > 0 && !activeAutomateId.value) {
    selectAutomate(contractAutomates.value[0].id);
  }
  
  toast.success('Automate supprimé avec succès');
};

const confirmAutomateEdit = () => {
  // Validation
  if (!editingAutomateName.value.trim()) {
    automateModalError.value = 'Le nom de l\'automate ne peut pas être vide';
    return;
  }
  
  // Vérifier si le nom existe déjà (sauf pour l'automate en cours d'édition)
  const nameExists = contractAutomates.value.some(a => 
    a.name.toLowerCase() === editingAutomateName.value.trim().toLowerCase() && 
    a.id !== editingAutomateId.value
  );
  
  if (nameExists) {
    automateModalError.value = 'Un automate avec ce nom existe déjà';
    return;
  }
  
  if (editingAutomateId.value) {
    // Modification d'un automate existant
    const automate = contractAutomates.value.find(a => a.id === editingAutomateId.value);
    if (automate) {
      automate.name = editingAutomateName.value.trim();
      toast.success(`Automate "${automate.name}" modifié avec succès`);
    }
  } else {
    // Création d'un nouvel automate
    const newId = generateNewAutomateId();
    const newAutomate = {
      id: newId,
      name: editingAutomateName.value.trim(),
      states: [
        { id: 'state-1', label: 'État Initial' },
        { id: 'state-2', label: 'État Final' }
      ],
      transitions: [
        { id: 'edge-1', source: 'state-1', target: 'state-2', label: 'terminer' }
      ]
    };
    
    contractAutomates.value.push(newAutomate);
    toast.success(`Automate "${newAutomate.name}" créé avec succès`);
    
    // Sélectionner le nouvel automate
    selectAutomate(newId);
  }
  
  // Fermer le modal
  showAutomateModal.value = false;
};

// Générer un nouvel ID pour un automate
const generateNewAutomateId = () => {
  if (contractAutomates.value.length === 0) {
    return '01';
  }
  
  // Trouver l'ID maximum et incrémenter
  const maxId = Math.max(...contractAutomates.value.map(a => parseInt(a.id)));
  return String(maxId + 1).padStart(2, '0');
};

// --- Fonctions pour interagir avec les états ---
const onAddState = (state) => {
  // Générer une position aléatoire dans une zone visible
  const randomPosition = {
    x: 50 + Math.random() * 400, // Entre 50 et 450 px
    y: 50 + Math.random() * 300, // Entre 50 et 350 px
  };
  
  // Ajouter le nouvel état
  currentNodes.value.push({
    id: state.id,
    position: randomPosition,
    data: { label: state.libelle },
    style: getBaseNodeStyle(),
  });
  
  toast.success('État ajouté avec succès');
};

const onEditState = ({ id, libelle }) => {
  const node = currentNodes.value.find(n => n.id === id);
  if (node) {
    node.data.label = libelle;
    toast.success('État modifié avec succès');
  }
};

const onRemoveState = (id) => {
  // Supprimer le nœud
  currentNodes.value = currentNodes.value.filter(n => n.id !== id);
  
  // Si le nœud supprimé était sélectionné, désélectionner
  if (activeStateId.value === id) {
    activeStateId.value = null;
  }
  
  // Supprimer également les connexions associées
  currentEdges.value = currentEdges.value.filter(e => e.source !== id && e.target !== id);
  
  toast.success('État supprimé avec succès');
};

const onSelectState = (stateId) => {
  // Si l'état est déjà sélectionné, le désélectionner
  if (activeStateId.value === stateId) {
    // Désélectionner
    activeStateId.value = null;
    updateNodeStyles(null);
    setSelectedElements({ nodes: [], edges: [] });
  } else {
    // Sélectionner le nouvel état
    activeStateId.value = stateId;
    updateNodeStyles(stateId);
    
    // Sélectionner le nœud dans VueFlow si stateId n'est pas null
    if (stateId) {
      const node = findNode(stateId);
      if (node) {
        setSelectedElements({ nodes: [node], edges: [] });
      }
    }
  }
};

// --- Fonctions pour interagir avec les transitions ---
const onConnectNodes = ({ source, target }) => {
  // Éviter les connexions d'un nœud à lui-même
  if (source === target) {
    toast.error('Impossible de connecter un état à lui-même');
    return;
  }
  
  // Vérifier si cette connexion existe déjà
  const connectionExists = currentEdges.value.some(
    edge => edge.source === source && edge.target === target
  );
  
  if (connectionExists) {
    toast.error('Cette transition existe déjà');
    return;
  }
  
  // Récupérer les noms des états source et cible pour le dialogue
  const sourceNode = currentNodes.value.find(node => node.id === source);
  const targetNode = currentNodes.value.find(node => node.id === target);
  const sourceName = sourceNode ? sourceNode.data.label : source;
  const targetName = targetNode ? targetNode.data.label : target;
  
  // Ouvrir le modal de sélection de transition
  transitionModal.value.open(source, target, sourceName, targetName);
};

const onTransitionConfirm = ({ source, target, transition }) => {
  const sourceNode = currentNodes.value.find(node => node.id === source);
  const targetNode = currentNodes.value.find(node => node.id === target);
  const sourceName = sourceNode ? sourceNode.data.label : source;
  const targetName = targetNode ? targetNode.data.label : target;
  
  // Générer un ID unique pour la nouvelle transition
  const newEdgeId = `edge-${Date.now()}`;
  
  // Ajouter la nouvelle transition
  const newEdge = {
    id: newEdgeId,
    source,
    target,
    label: transition,
  };
  
  currentEdges.value.push(newEdge);
  toast.success(`Transition ajoutée: ${sourceName} → ${targetName}`);
};

const onEdgeUpdate = ({ oldEdge, newConnection }) => {
  // Récupérer les noms des états source et cible pour le dialogue
  const sourceNode = currentNodes.value.find(node => node.id === newConnection.source);
  const targetNode = currentNodes.value.find(node => node.id === newConnection.target);
  const sourceName = sourceNode ? sourceNode.data.label : newConnection.source;
  const targetName = targetNode ? targetNode.data.label : newConnection.target;
  
  // Stocker les données pour la confirmation
  edgeUpdateData.value = { oldEdge, newConnection };
  edgeUpdateSourceName.value = sourceName;
  edgeUpdateTargetName.value = targetName;
  
  // Ouvrir le modal de confirmation
  showEdgeUpdateModal.value = true;
};

const confirmEdgeUpdate = () => {
  const { oldEdge, newConnection } = edgeUpdateData.value;
  
  // Supprimer l'ancienne connexion
  currentEdges.value = currentEdges.value.filter(e => e.id !== oldEdge.id);
  
  // Ajouter la nouvelle connexion avec le même label
  const updatedEdge = {
    ...oldEdge,
    id: `edge-${Date.now()}`,
    source: newConnection.source,
    target: newConnection.target,
  };
  
  currentEdges.value.push(updatedEdge);
  toast.success('Transition mise à jour');
  
  // Fermer le modal
  showEdgeUpdateModal.value = false;
};

const selectTransition = (id) => {
  activeTransitionId.value = id === activeTransitionId.value ? null : id;
};

const addTransition = (transition) => {
  const existingTransition = availableTransitions.value.find(t => t.value === transition.value);
  
  if (!existingTransition) {
    // Générer un ID unique pour la nouvelle transition
    const transitionId = `transition-${Date.now()}`;
    
    // Ajouter la transition à la liste
    availableTransitions.value.push({
      id: transitionId,
      value: transition.value,
      label: transition.label
    });
    
    toast.success(`Transition "${transition.label}" ajoutée`);
  } else {
    toast.error('Cette transition existe déjà');
  }
};

const editTransition = (transition) => {
  const existingTransition = availableTransitions.value.find(t => t.id === transition.id);
  
  if (existingTransition) {
    // Vérifier si une autre transition a déjà cette valeur
    const duplicateTransition = availableTransitions.value.find(t => 
      t.value === transition.value && t.id !== transition.id
    );
    
    if (duplicateTransition) {
      toast.error('Une transition avec cette valeur existe déjà');
      return;
    }
    
    // Mettre à jour la transition
    existingTransition.value = transition.value;
    existingTransition.label = transition.label;
    
    // Mettre à jour les arêtes qui utilisent cette transition
    currentEdges.value.forEach(edge => {
      if (edge.label === existingTransition.value) {
        edge.label = transition.value;
      }
    });
    
    toast.success(`Transition "${transition.label}" modifiée`);
  }
};

const removeTransition = (id) => {
  const index = availableTransitions.value.findIndex(t => t.id === id);
  
  if (index !== -1) {
    const transition = availableTransitions.value[index];
    
    // Vérifier si la transition est utilisée dans des arêtes
    const isUsed = currentEdges.value.some(edge => edge.label === transition.value);
    
    if (isUsed) {
      toast.error('Cette transition est utilisée dans au moins un automate et ne peut pas être supprimée');
      return;
    }
    
    // Supprimer la transition
    availableTransitions.value.splice(index, 1);
    
    // Si c'était la transition active, la désélectionner
    if (activeTransitionId.value === id) {
      activeTransitionId.value = null;
    }
    
    toast.success(`Transition "${transition.label}" supprimée`);
  }
};

// --- Fonctions pour sauvegarder/charger l'état des automates ---
const loadAutomateState = (automateId) => {
  const automate = contractAutomates.value.find(a => a.id === automateId);
  
  if (!automate) {
    currentNodes.value = [];
    currentEdges.value = [];
    return;
  }
  
  // Convertir les états en nœuds pour VueFlow
  currentNodes.value = automate.states.map(state => ({
    id: state.id,
    position: state.position || { x: 50 + Math.random() * 400, y: 50 + Math.random() * 300 },
    data: { label: state.label },
    style: getBaseNodeStyle(),
  }));
  
  // Charger les transitions
  currentEdges.value = automate.transitions.map(transition => ({
    id: transition.id,
    source: transition.source,
    target: transition.target,
    label: transition.label,
  }));
};

const saveCurrentAutomateState = () => {
  if (!activeAutomateId.value) return;
  
  const automate = contractAutomates.value.find(a => a.id === activeAutomateId.value);
  
  if (!automate) return;
  
  // Convertir les nœuds en états
  automate.states = currentNodes.value.map(node => ({
    id: node.id,
    label: node.data.label,
    position: { x: node.position.x, y: node.position.y },
  }));
  
  // Sauvegarder les transitions
  automate.transitions = currentEdges.value.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
  }));
};

// --- Fonction pour sauvegarder l'automate courant ---
const saveAutomate = () => {
  if (!activeAutomateId.value) return;
  
  saveCurrentAutomateState();
  toast.success('Automate sauvegardé avec succès');
};

// --- Fonction pour sauvegarder le contrat complet
const saveContract = () => {
  // Validation
  if (!contractName.value.trim()) {
    toast.error('Veuillez saisir un nom de contrat');
    return;
  }
  
  if (contractAutomates.value.length === 0) {
    toast.error('Veuillez créer au moins un automate');
    return;
  }
  
  // Sauvegarder l'automate courant si nécessaire
  if (activeAutomateId.value) {
    saveCurrentAutomateState();
  }
  
  // Construire l'objet contrat selon la structure spécifiée
  const contract = {
    id: generateContractId(),
    name: contractName.value.trim(),
    automates: contractAutomates.value.map(automate => ({
      id: automate.id,
      name: automate.name,
      active: automate.id === activeAutomateId.value,
      states: automate.states,
      transitions: automate.transitions
    }))
  };
  
  // Afficher l'objet en console
  console.log('Contrat sauvegardé:', JSON.stringify(contract, null, 2));
  
  // Afficher un toast de succès
  toast.success('Contrat sauvegardé avec succès!');
  
  // Naviguer vers la liste des contrats
  setTimeout(() => {
    router.push({ name: 'contracts' });
  }, 1500);
};

// Générer un ID de contrat
const generateContractId = () => {
  // Ici on pourrait récupérer le dernier ID utilisé depuis une API
  // Pour cet exemple, on génère simplement un ID formaté avec des zéros
  return '00' + Math.floor(Math.random() * 100).toString().padStart(2, '0');
};

// --- Initialisation ---
onMounted(() => {
  // Créer un automate par défaut
  const defaultAutomate = {
    id: '01',
    name: 'AUTOMATE 01',
    states: [
      { id: 'state-1', label: 'État Initial', position: { x: 100, y: 150 } },
      { id: 'state-2', label: 'État Final', position: { x: 300, y: 150 } }
    ],
    transitions: [
      { id: 'edge-1', source: 'state-1', target: 'state-2', label: 'terminer' }
    ]
  };
  
  contractAutomates.value.push(defaultAutomate);
  
  // Sélectionner l'automate par défaut
  selectAutomate('01');
});

</script>