<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-5 transition-colors duration-300">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">
        Clauses <span class="text-sm text-gray-400">({{ automates.length }})</span>
      </h2>
      <div class="flex items-center space-x-3">
        <!-- Bouton de tri -->
        <button @click="toggleSort" class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          <LucideArrowDownUp class="w-4 h-4 text-gray-800 dark:text-gray-200" />
        </button>
        <!-- Bouton d'ajout -->
        <button 
          @click="$emit('add-automate')"
          class="bg-gradient-to-tr from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700 dark:text-white px-2.5 py-1.5 rounded-full hover:shadow-lg hover:scale-105 hover:bg-blue-500 transition-all duration-200 flex items-center"
        >
          <LucidePlus class="w-3.5 h-3.5" />
          <span class="ml-1.5 text-xs font-medium">Ajouter</span>
        </button>
      </div>
    </div>
    
    <!-- Message si vide -->
    <div v-if="automates.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
      Cliquer sur le bouton <strong>"Ajouter"</strong> pour créer une clause.
    </div>
    
    <!-- Barre de recherche pour filtrer les automates -->
    <div v-if="automates.length > 0" class="mb-4">
      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Rechercher une clause..."
          class="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500">
          <LucideSearch class="w-4 h-4" />
        </div>
      </div>
    </div>
    
    <!-- Liste des automates avec défilement -->
    <div v-if="automates.length > 0" class="max-h-[500px] overflow-y-auto pr-1" style="scrollbar-width: thin; scrollbar-color: #cbd5e0 #f1f5f9;">
      <ul class="space-y-3">
        <li v-for="automate in filteredAutomates" :key="automate.id" class="relative group">
          <div class="flex items-center">
            <!-- Bouton automate -->
            <button 
              :class="[
                'flex-grow px-4 py-2 text-sm font-medium shadow-sm rounded-full transition-colors duration-200 text-left',
                activeAutomate === automate.id 
                  ? 'bg-gradient-to-tr from-blue-500 to-blue-700 text-white font-semibold shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
              ]"
              @click="$emit('select-automate', automate.id)"
            >
              {{ automate.name }}
            </button>

            <!-- Actions (en mode hover comme avant) -->
            <div class="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
              <button @click.stop="$emit('edit-automate', automate.id)" class="flex items-center p-1 rounded-full transition bg-yellow-500 text-white hover:bg-yellow-600">
                <LucidePencil class="w-4 h-4" />
              </button>

              <button @click.stop="openDeleteConfirmation(automate.id)" class="flex items-center p-1 rounded-full transition bg-red-600 text-white hover:bg-red-700">
                <LucideTrash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
    
    <!-- Message si aucun résultat après filtrage -->
    <div v-if="automates.length > 0 && filteredAutomates.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
      Aucune clause ne correspond à votre recherche.
    </div>
    
    <!-- Modal de confirmation de suppression -->
    <Modal
      v-model="showDeleteModal"
      title="Supprimer cette clause ?"
      confirm-text="Oui, supprimer"
      variant="danger"
      @confirm="confirmDelete"
    >
      <p class="text-gray-700 dark:text-gray-300">
        Êtes-vous sûr de vouloir supprimer cette clause ? Cette action est irréversible.
      </p>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { LucidePlus, LucidePencil, LucideTrash2, LucideArrowDownUp, LucideSearch } from 'lucide-vue-next';
import Modal from '@/components/ui/UiModal.vue';
import toast from '@/composables/Toast/useToast';

// Props
const props = defineProps({
  automates: {
    type: Array,
    default: () => []
  },
  activeAutomate: {
    type: String,
    default: null
  }
});

// Événements émis
const emit = defineEmits(['select-automate', 'add-automate', 'edit-automate', 'remove-automate']);

// État pour le tri
const sortAsc = ref(true);
// État pour la recherche
const searchQuery = ref('');

// État pour la modal de suppression
const showDeleteModal = ref(false);
const automateToDelete = ref(null);

// Liste triée des automates
const sortedAutomates = computed(() => {
  return [...props.automates].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return sortAsc.value ? comparison : -comparison;
  });
});

// Liste filtrée par recherche
const filteredAutomates = computed(() => {
  if (!searchQuery.value.trim()) return sortedAutomates.value;
  
  const query = searchQuery.value.toLowerCase().trim();
  return sortedAutomates.value.filter(automate => 
    automate.name.toLowerCase().includes(query)
  );
});

// Inverser l'ordre de tri
const toggleSort = () => {
  sortAsc.value = !sortAsc.value;
};

// Ouvrir la modal de confirmation de suppression
const openDeleteConfirmation = (id) => {
  try {
    automateToDelete.value = id;
    showDeleteModal.value = true;
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du modal de suppression:', error);
    toast.error('Impossible d\'ouvrir la boîte de dialogue de suppression');
  }
};

// Confirmer la suppression
const confirmDelete = () => {
  try {
    emit('remove-automate', automateToDelete.value);
    showDeleteModal.value = false;
    automateToDelete.value = null;
    
    toast.success('Clause supprimé avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'automate:', error);
    toast.error('Erreur lors de la suppression de l\'automate');
  }
};
</script>