<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-5 transition-colors duration-300">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">
        TRANSITIONS <span class="text-sm text-gray-400">({{ transitions.length }})</span>
      </h2>
      <div>
        <button 
          @click="showAddModal = true"
          class="bg-gradient-to-tr from-indigo-100 to-indigo-200 text-indigo-700 dark:from-indigo-900 dark:to-indigo-800 dark:text-indigo-300 px-2 py-1 rounded-full hover:scale-105 transition flex items-center"
        >
          <LucidePlus class="w-4 h-4" />
          <span class="ml-2 text-sm font-medium">Ajouter</span>
        </button>
      </div>
    </div>
    
    <!-- Message si vide -->
    <div v-if="transitions.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
      Cliquer sur le bouton <strong>"Ajouter"</strong> pour créer une transition.
    </div>
    
    <!-- Liste des transitions -->
    <ul v-else class="space-y-3">
      <li 
        v-for="transition in sortedTransitions" 
        :key="transition.id"
        class="relative group"
      >
        <div class="flex items-center">
          <!-- Bouton transition -->
          <button
            @click="$emit('select-transition', transition.id)"
            :class="[
              'flex-grow px-4 py-2 text-sm font-medium shadow-sm rounded-full transition-colors duration-200 text-left',
              activeTransition === transition.id
                ? 'bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-semibold shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            ]"
          >
            {{ transition.label }}
            <span class="text-xs ml-1 opacity-70">({{ transition.value }})</span>
          </button>

          <!-- Actions -->
          <div class="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
            <button @click.stop="openEditModal(transition)" class="flex items-center p-1 rounded-full transition bg-yellow-500 text-white hover:bg-yellow-600">
              <LucidePencil class="w-4 h-4" />
            </button>

            <button @click.stop="openRemoveModal(transition.id)" class="flex items-center p-1 rounded-full transition bg-red-600 text-white hover:bg-red-700">
              <LucideTrash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </li>
    </ul>
    
    <!-- Modal Ajouter Transition -->
    <Modal
      v-model="showAddModal"
      title="Ajouter une transition"
      confirm-text="Ajouter"
      @confirm="confirmAdd"
    >
      <div class="space-y-4">
        <div>
          <label for="transition-label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Libellé
          </label>
          <input 
            id="transition-label"
            v-model="newTransition.label"
            type="text"
            placeholder="Ex: Valider"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label for="transition-value" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Valeur (utilisée dans le code)
          </label>
          <input 
            id="transition-value"
            v-model="newTransition.value"
            type="text"
            placeholder="Ex: valider"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            La valeur doit être unique et en minuscules sans espaces.
          </p>
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
        <div>
          <label for="edit-transition-label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Libellé
          </label>
          <input 
            id="edit-transition-label"
            v-model="editingTransition.label"
            type="text"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label for="edit-transition-value" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Valeur (utilisée dans le code)
          </label>
          <input 
            id="edit-transition-value"
            v-model="editingTransition.value"
            type="text"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
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
      <p class="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
        Note: Si cette transition est utilisée dans un automate, elle ne pourra pas être supprimée.
      </p>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed,watch } from 'vue';
import { LucidePlus, LucidePencil, LucideTrash2 } from 'lucide-vue-next';
import Modal from '@/components/ui/UiModal.vue';

// Props
const props = defineProps({
  transitions: {
    type: Array,
    default: () => []
  },
  activeTransition: {
    type: String,
    default: null
  }
});

// Événements émis
const emit = defineEmits(['select-transition', 'add-transition', 'edit-transition', 'remove-transition']);

// États pour les modaux
const showAddModal = ref(false);
const showEditModal = ref(false);
const showRemoveModal = ref(false);
const modalError = ref('');
const removeTransitionId = ref(null);

// Nouvelle transition
const newTransition = ref({
  label: '',
  value: ''
});

// Transition en cours d'édition
const editingTransition = ref({
  id: '',
  label: '',
  value: ''
});

// Transitions triées par ordre alphabétique
const sortedTransitions = computed(() => {
  return [...props.transitions].sort((a, b) => a.label.localeCompare(b.label));
});

// Réinitialiser les champs du modal d'ajout
const resetAddModal = () => {
  newTransition.value = {
    label: '',
    value: ''
  };
  modalError.value = '';
};

// Ouvrir le modal d'édition
const openEditModal = (transition) => {
  editingTransition.value = { ...transition };
  modalError.value = '';
  showEditModal.value = true;
};

// Ouvrir le modal de suppression
const openRemoveModal = (id) => {
  removeTransitionId.value = id;
  showRemoveModal.value = true;
};

// Valider les champs d'une transition
const validateTransition = (transition) => {
  // Vérifier que les champs requis sont remplis
  if (!transition.label.trim()) {
    modalError.value = 'Le libellé est requis';
    return false;
  }
  
  if (!transition.value.trim()) {
    modalError.value = 'La valeur est requise';
    return false;
  }
  
  // Vérifier que la valeur est au format valide
  if (!/^[a-z0-9_]+$/.test(transition.value)) {
    modalError.value = 'La valeur doit contenir uniquement des lettres minuscules, des chiffres et des underscores';
    return false;
  }
  
  return true;
};

// Confirmer l'ajout d'une transition
const confirmAdd = () => {
  if (!validateTransition(newTransition.value)) {
    return;
  }
  
  // Vérifier que la valeur est unique
  const existingTransition = props.transitions.find(
    t => t.value === newTransition.value.trim()
  );
  
  if (existingTransition) {
    modalError.value = 'Une transition avec cette valeur existe déjà';
    return;
  }
  
  // Émettre l'événement pour ajouter la transition
  emit('add-transition', {
    value: newTransition.value.trim(),
    label: newTransition.value.label.trim()
  });
  
  // Fermer le modal et réinitialiser les champs
  showAddModal.value = false;
  resetAddModal();
};

// Confirmer la modification d'une transition
const confirmEdit = () => {
  if (!validateTransition(editingTransition.value)) {
    return;
  }
  
  // Vérifier que la valeur est unique
  const duplicateTransition = props.transitions.find(
    t => t.value === editingTransition.value.value.trim() && t.id !== editingTransition.value.id
  );
  
  if (duplicateTransition) {
    modalError.value = 'Une transition avec cette valeur existe déjà';
    return;
  }
  
  // Émettre l'événement pour modifier la transition
  emit('edit-transition', {
    id: editingTransition.value.id,
    value: editingTransition.value.value.trim(),
    label: editingTransition.value.label.trim()
  });
  
  // Fermer le modal
  showEditModal.value = false;
};

// Confirmer la suppression d'une transition
const confirmRemove = () => {
  emit('remove-transition', removeTransitionId.value);
  showRemoveModal.value = false;
  removeTransitionId.value = null;
};

// Réinitialiser les champs lorsque les modaux se ferment
watch(showAddModal, (newVal) => {
  if (!newVal) {
    resetAddModal();
  }
});

watch(showEditModal, (newVal) => {
  if (!newVal) {
    modalError.value = '';
  }
});
</script>