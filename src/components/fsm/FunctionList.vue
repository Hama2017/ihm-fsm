<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-5 transition-colors duration-300">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">
        Fonctions <span class="text-sm text-gray-400">({{ edges.length }})</span>
      </h2>
      <div class="flex items-center space-x-3">
        <!-- Bouton de tri (seulement icône) -->
        <button @click="toggleSort" class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          <LucideArrowDownUp class="w-4 h-4 text-gray-800 dark:text-gray-200" />
        </button>
        <!-- Bouton d'ajout (complètement arrondi, plus petit, avec hover amélioré) -->
        <button 
          @click="showAddTransitionModal = true"
          class="bg-gradient-to-tr from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700 dark:text-white px-2.5 py-1.5 rounded-full hover:shadow-lg hover:scale-105 hover:bg-blue-500 transition-all duration-200 flex items-center"
        >
          <LucidePlus class="w-3.5 h-3.5" />
          <span class="ml-1.5 text-xs font-medium">Ajouter</span>
        </button>
      </div>
    </div>
    
    <!-- Message si vide -->
    <div v-if="edges.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
      Cliquer sur le bouton <strong>"Ajouter"</strong> pour créer une transition.
    </div>
    
    <!-- Barre de recherche pour filtrer les fonctions -->
    <div v-if="edges.length > 0" class="mb-4">
      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Rechercher une fonction..."
          class="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500">
          <LucideSearch class="w-4 h-4" />
        </div>
      </div>
    </div>
    
    <!-- Liste des transitions avec défilement -->
    <div v-if="edges.length > 0" class="max-h-[500px] overflow-y-auto pr-1" style="scrollbar-width: thin; scrollbar-color: #cbd5e0 #f1f5f9;">
      <ul class="space-y-3">
        <li 
          v-for="edge in filteredEdges" 
          :key="edge.id"
          class="relative group mb-4"
        >
          <!-- Carte de transition avec informations mieux espacées -->
          <div :class="[
            'flex flex-col border rounded-lg overflow-hidden shadow-sm',
            activeTransition === edge.id 
              ? 'border-blue-500 dark:border-blue-400' 
              : 'border-gray-200 dark:border-gray-700'
          ]">
            <!-- En-tête avec le nom de la fonction - change de couleur quand sélectionné -->
            <div :class="[
              'px-4 py-3',
              activeTransition === edge.id 
                ? 'bg-blue-600 dark:bg-blue-700 border-b border-blue-700 dark:border-blue-800' 
                : 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'
            ]">
              <div class="flex justify-between items-center">
                <span :class="[
                  'font-medium',
                  activeTransition === edge.id 
                    ? 'text-white' 
                    : 'text-gray-800 dark:text-gray-200'
                ]">{{ edge.label }}</span>
                
                <!-- Statut de sélection -->
                <span v-if="activeTransition === edge.id" class="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                  Sélectionnée
                </span>
              </div>
            </div>
            
            <!-- Corps avec les informations de nœuds -->
            <div class="px-4 py-3 bg-white dark:bg-gray-800">
              <div class="flex items-center justify-center space-x-2 text-sm">
                <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-300">
                  {{ getNodeName(edge.source) }}
                </span>
                <LucideArrowRight class="text-blue-500 dark:text-blue-400" />
                <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-300">
                  {{ getNodeName(edge.target) }}
                </span>
              </div>
            </div>
            
            <!-- Boutons d'action -->
            <div class="flex bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 divide-x divide-gray-200 dark:divide-gray-700">
              <!-- Bouton principal - change de texte selon l'état de sélection -->
              <button
                @click="$emit('select-transition', edge.id)"
                :class="[
                  'flex-grow py-2 px-3 text-sm font-medium transition-colors',
                  activeTransition === edge.id
                    ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                ]"
              >
                {{ activeTransition === edge.id ? 'Désélectionner' : 'Sélectionner' }}
              </button>
              
              <!-- Bouton de modification -->
              <button 
                @click.stop="openEditModal(edge)" 
                class="px-3 py-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                title="Modifier"
              >
                <LucidePencil class="w-4 h-4" />
              </button>
              
              <!-- Bouton d'inversion -->
              <button 
                @click.stop="openReverseEdgeModal(edge)" 
                class="px-3 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                title="Inverser"
              >
                <LucideArrowDownUp class="w-4 h-4" />
              </button>
              
              <!-- Bouton de suppression -->
              <button 
                @click.stop="openRemoveModal(edge.id)" 
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
    <div v-if="edges.length > 0 && filteredEdges.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
      Aucune fonction ne correspond à votre recherche.
    </div>
    
    <!-- Modal Ajouter Transition -->
    <Modal
      v-model="showAddTransitionModal"
      title="Ajouter une transition"
      confirm-text="Ajouter"
      @confirm="confirmAddTransition"
    >
      <div class="space-y-4">
        <!-- Source -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            État source
          </label>
          <select 
            v-model="newTransition.source"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Sélectionner un état source</option>
            <option v-for="node in nodes" :key="node.id" :value="node.id">
              {{ node.data.label }}
            </option>
          </select>
        </div>
        
        <!-- Destination -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            État destination
          </label>
          <select 
            v-model="newTransition.target"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Sélectionner un état destination</option>
            <option v-for="node in nodes" :key="node.id" :value="node.id">
              {{ node.data.label }}
            </option>
          </select>
        </div>
        
        <!-- Fonction -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fonction
          </label>
          <select 
            v-model="newTransition.function"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Sélectionner une fonction</option>
            <option v-for="func in availableFunctions" :key="func.value" :value="func.value">
              {{ func.label }}
            </option>
          </select>
        </div>
        
        <p v-if="modalError" class="text-sm text-red-600 dark:text-red-400 mt-2">
          {{ modalError }}
        </p>
      </div>
    </Modal>
    
    <!-- Modal Modifier Transition -->
    <Modal
      v-model="showEditModal"
      title="Modifier la transition"
      confirm-text="Enregistrer"
      @confirm="confirmEdit"
    >
      <div class="space-y-4">
        <!-- Source -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            État source
          </label>
          <select 
            v-model="editingTransition.source"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option v-for="node in nodes" :key="node.id" :value="node.id">
              {{ node.data.label }}
            </option>
          </select>
        </div>
        
        <!-- Destination -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            État destination
          </label>
          <select 
            v-model="editingTransition.target"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option v-for="node in nodes" :key="node.id" :value="node.id">
              {{ node.data.label }}
            </option>
          </select>
        </div>
        
        <!-- Fonction -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fonction
          </label>
          <select 
            v-model="editingTransition.function"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option v-for="func in availableFunctions" :key="func.value" :value="func.value">
              {{ func.label }}
            </option>
          </select>
        </div>
        
        <p v-if="modalError" class="text-sm text-red-600 dark:text-red-400 mt-2">
          {{ modalError }}
        </p>
      </div>
    </Modal>
    
    <!-- Modal Supprimer Transition -->
    <Modal
      v-model="showRemoveModal"
      title="Supprimer la transition ?"
      confirm-text="Supprimer"
      variant="danger"
      @confirm="confirmRemove"
    >
      <p class="text-gray-700 dark:text-gray-300">
        Êtes-vous sûr de vouloir supprimer cette transition ? Cette action est irréversible.
      </p>
    </Modal>
    
    <!-- Modal Inverser la Transition -->
    <Modal
      v-model="showReverseModal"
      title="Inverser la transition"
      confirm-text="Inverser"
      variant="warning"
      @confirm="confirmReverse"
    >
      <div class="space-y-4">
        <p class="text-gray-700 dark:text-gray-300">
          Voulez-vous inverser le sens de la transition ?
        </p>
        <div class="flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
          <span class="font-medium text-gray-700 dark:text-gray-300">{{ getNodeName(reversingTransition.source) }}</span>
          <LucideArrowRight class="mx-2 text-blue-500" />
          <span class="font-medium text-gray-700 dark:text-gray-300">{{ getNodeName(reversingTransition.target) }}</span>
        </div>
        <div class="flex items-center justify-center">
          <LucideArrowDown class="my-2 text-yellow-500" />
        </div>
        <div class="flex items-center justify-center space-x-2 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <span class="font-medium text-gray-700 dark:text-gray-300">{{ getNodeName(reversingTransition.target) }}</span>
          <LucideArrowRight class="mx-2 text-blue-500" />
          <span class="font-medium text-gray-700 dark:text-gray-300">{{ getNodeName(reversingTransition.source) }}</span>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { LucidePlus, LucidePencil, LucideTrash2, LucideArrowDownUp, LucideArrowRight, LucideArrowDown, LucideSearch } from 'lucide-vue-next';
import Modal from '@/components/ui/UiModal.vue';
import toast from '@/components/ui/ToastService';

// Props - utilisez directement edges et nodes
const props = defineProps({
  // Les arêtes (transitions) actuelles de l'automate actif
  edges: {
    type: Array,
    default: () => []
  },
  // Nœuds de l'automate actif
  nodes: {
    type: Array,
    default: () => []
  },
  // Transitions disponibles à sélectionner
  availableFunctions: {
    type: Array,
    default: () => []
  },
  activeTransition: {
    type: String,
    default: null
  }
});

// Événements émis
const emit = defineEmits(['select-transition', 'add-transition', 'edit-transition', 'remove-transition', 'reverse-transition']);

// État pour le tri
const sortAsc = ref(true);
// État pour la recherche
const searchQuery = ref('');

// États pour les modaux
const showAddTransitionModal = ref(false);
const showEditModal = ref(false);
const showRemoveModal = ref(false);
const showReverseModal = ref(false);
const modalError = ref('');
const removeTransitionId = ref(null);
const reversingTransition = ref({
  id: '',
  source: '',
  target: '',
  label: ''
});

// Nouvelle transition
const newTransition = ref({
  source: '',
  target: '',
  function: ''
});

// Transition en cours d'édition
const editingTransition = ref({
  id: '',
  source: '',
  target: '',
  function: ''
});

// Transitions triées - utilise directement props.edges
const sortedEdges = computed(() => {
  return [...props.edges].sort((a, b) => {
    const comparison = sortAsc.value
      ? a.label.localeCompare(b.label)
      : b.label.localeCompare(a.label);
    return comparison;
  });
});

// Transitions filtrées par recherche
const filteredEdges = computed(() => {
  if (!searchQuery.value.trim()) return sortedEdges.value;
  
  const query = searchQuery.value.toLowerCase().trim();
  return sortedEdges.value.filter(edge => {
    // Recherche dans le label de la fonction
    if (edge.label.toLowerCase().includes(query)) return true;
    
    // Recherche dans les noms des états source et destination
    const sourceNode = props.nodes.find(n => n.id === edge.source);
    const targetNode = props.nodes.find(n => n.id === edge.target);
    
    const sourceName = sourceNode && sourceNode.data ? sourceNode.data.label.toLowerCase() : '';
    const targetName = targetNode && targetNode.data ? targetNode.data.label.toLowerCase() : '';
    
    return sourceName.includes(query) || targetName.includes(query);
  });
});

// Obtenir le nom d'un nœud à partir de son ID
const getNodeName = (nodeId) => {
  const node = props.nodes.find(n => n.id === nodeId);
  return node && node.data ? node.data.label : nodeId;
};

// Inverser l'ordre de tri
const toggleSort = () => {
  sortAsc.value = !sortAsc.value;
};

// Ouvrir le modal d'édition
const openEditModal = (edge) => {
  editingTransition.value = { 
    id: edge.id,
    source: edge.source,
    target: edge.target,
    function: edge.label // Utilisez le label comme fonction
  };
  modalError.value = '';
  showEditModal.value = true;
};

// Ouvrir le modal de suppression
const openRemoveModal = (id) => {
  removeTransitionId.value = id;
  showRemoveModal.value = true;
};

// Ouvrir le modal d'inversion de transition
const openReverseEdgeModal = (edge) => {
  reversingTransition.value = {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label
  };
  showReverseModal.value = true;
};

// Valider les champs de la nouvelle transition
const validateNewTransition = () => {
  if (!newTransition.value.source) {
    modalError.value = 'L\'état source est requis';
    return false;
  }
  
  if (!newTransition.value.target) {
    modalError.value = 'L\'état destination est requis';
    return false;
  }
  
  if (!newTransition.value.function) {
    modalError.value = 'La fonction est requise';
    return false;
  }
  
  // Vérifier si cette connexion existe déjà
  const connectionExists = props.edges.some(
    edge => edge.source === newTransition.value.source && edge.target === newTransition.value.target
  );
  
  if (connectionExists) {
    modalError.value = 'Cette transition existe déjà';
    return false;
  }
  
  return true;
};

// Confirmer l'ajout d'une transition
const confirmAddTransition = () => {
  try {
    if (!validateNewTransition()) {
      return;
    }
    
    // Récupérer le libellé de la fonction sélectionnée
    const selectedFunction = props.availableFunctions.find(f => f.value === newTransition.value.function);
    if (!selectedFunction) {
      modalError.value = 'Fonction invalide';
      return;
    }
    
    // Générer un ID unique pour la nouvelle transition
    const newEdgeId = `edge-${Date.now()}`;
    
    // Émettre l'événement pour ajouter la transition
    emit('add-transition', {
      id: newEdgeId,
      source: newTransition.value.source,
      target: newTransition.value.target,
      label: newTransition.value.function
    });
    
    // Fermer le modal et réinitialiser les champs
    showAddTransitionModal.value = false;
    newTransition.value = { source: '', target: '', function: '' };
    modalError.value = '';
    
    toast.success('Transition ajoutée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la transition:', error);
    modalError.value = 'Une erreur s\'est produite';
  }
};

// Confirmer la modification d'une transition
const confirmEdit = () => {
  try {
    // Vérifier si tous les champs sont remplis
    if (!editingTransition.value.source || !editingTransition.value.target || !editingTransition.value.function) {
      modalError.value = 'Tous les champs sont requis';
      return;
    }
    
    // Vérifier si la connexion existe déjà (en excluant celle en cours d'édition)
    const connectionExists = props.edges.some(
      edge => edge.source === editingTransition.value.source && 
           edge.target === editingTransition.value.target && 
           edge.id !== editingTransition.value.id
    );
    
    if (connectionExists) {
      modalError.value = 'Cette transition existe déjà';
      return;
    }
    
    // Émettre l'événement pour modifier la transition
    emit('edit-transition', {
      id: editingTransition.value.id,
      source: editingTransition.value.source,
      target: editingTransition.value.target,
      label: editingTransition.value.function
    });
    
    // Fermer le modal et réinitialiser les champs
    showEditModal.value = false;
    modalError.value = '';
    
    toast.success('Transition modifiée avec succès');
  } catch (error) {
    console.error('Erreur lors de la modification de la transition:', error);
    modalError.value = 'Une erreur s\'est produite';
  }
};

// Confirmer la suppression d'une transition
const confirmRemove = () => {
  try {
    emit('remove-transition', removeTransitionId.value);
    showRemoveModal.value = false;
    removeTransitionId.value = null;
    
    toast.success('Transition supprimée avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de la transition:', error);
    toast.error('Erreur lors de la suppression de la transition');
  }
};

// Confirmer l'inversion d'une transition
const confirmReverse = () => {
  try {
    // Créer une nouvelle transition avec source/target inversés
    const reversedEdge = {
      id: `edge-reversed-${Date.now()}`, // Nouvel ID pour la transition inversée
      source: reversingTransition.value.target,
      target: reversingTransition.value.source,
      label: reversingTransition.value.label
    };
    
    // Émettre l'événement pour ajouter la transition inversée
    emit('add-transition', reversedEdge);
    
    // Fermer le modal
    showReverseModal.value = false;
    
    toast.success('Transition inversée créée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'inversion de la transition:', error);
    toast.error('Erreur lors de l\'inversion de la transition');
  }
};
</script>