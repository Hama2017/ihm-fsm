<!-- ConditionList.vue -->
<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-5 transition-colors duration-300 h-full flex flex-col">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">
          Guide conditions
        <span class="text-sm text-gray-400">({{ totalConditionsCount }})</span>
      </h2>
      <div class="flex items-center space-x-2">
        <!-- Bouton d'affichage -->
        <button 
          @click="toggleDisplayMode" 
          class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          :title="displayMode === 'compact' ? 'Affichage détaillé' : 'Affichage compact'"
        >
          <LucideList v-if="displayMode === 'compact'" class="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <LucideLayoutList v-else class="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <!-- Bouton de recherche -->
        <button 
          @click="showSearch = !showSearch" 
          class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          title="Rechercher"
        >
          <LucideSearch class="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
    
    <!-- Barre de recherche -->
    <div v-if="showSearch" class="mb-4">
      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Rechercher une condition..."
          class="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500">
          <LucideSearch class="w-4 h-4" />
        </div>
      </div>
    </div>

    <!-- Message si aucun résultat après filtrage -->
    <div v-if="filteredPackages.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
      Aucune condition ne correspond à votre recherche.
    </div>
    
    <!-- Container avec hauteur fixe pour le défilement -->
    <div v-else class="relative flex-grow min-h-0">
      <!-- Liste des packages avec défilement -->
      <div class="absolute inset-0 overflow-y-auto scrolling-touch custom-scrollbar">
        <div class="space-y-4 pb-4">
          <div v-for="pkg in filteredPackages" :key="pkg.name" class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <!-- En-tête du package -->
            <div @click="togglePackage(pkg.name)" class="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div class="flex items-center">
                <span class="font-medium text-gray-800 dark:text-gray-200">{{ pkg.label }}</span>
                <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">({{ pkg.functions.length }})</span>
              </div>
              <div>
                <LucideChevronDown v-if="expandedPackages[pkg.name]" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <LucideChevronRight v-else class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            
            <!-- Corps du package avec les conditions -->
            <div v-show="expandedPackages[pkg.name]" class="bg-white dark:bg-gray-800">
              <!-- Mode d'affichage détaillé -->
              <div v-if="displayMode === 'detailed'" class="divide-y divide-gray-200 dark:divide-gray-700">
                <div v-for="condition in pkg.functions" :key="condition.name" class="p-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                  <div class="flex justify-between items-start mb-2">
                    <h3 class="font-medium text-blue-700 dark:text-blue-300">{{ condition.label }}</h3>
                    <button 
                      @click="openConditionDetails(condition)"
                      class="p-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
                      title="Voir plus"
                    >
                      <LucideInfo class="w-4 h-4" />
                    </button>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ condition.description }}</p>
                  <div class="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    ID: <span class="font-mono">{{ condition.name }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Mode d'affichage compact -->
              <div v-else class="p-2">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div 
                    v-for="condition in pkg.functions" 
                    :key="condition.name"
                    class="flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-colors cursor-pointer"
                    @click="openConditionDetails(condition)"
                  >
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2">{{ condition.label }}</span>
                    <LucideInfo class="w-4 h-4 text-blue-500 dark:text-blue-400 opacity-60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de détails de condition -->
    <Modal
      v-model="showConditionModal"
      :title="selectedCondition ? selectedCondition.label : 'Détails de la condition'"
      confirm-text="Fermer"
      @confirm="showConditionModal = false"
    >
      <div v-if="selectedCondition" class="space-y-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50">
          <p class="text-blue-700 dark:text-blue-400">
            {{ selectedCondition.description }}
          </p>
          <div class="mt-4 text-sm">
            <div class="flex items-center text-blue-600 dark:text-blue-500 mb-2">
              <LucidePackage class="w-4 h-4 mr-2" />
              <span class="font-medium">Package :</span> 
              <span class="ml-2">{{ getPackageName(selectedCondition.name) }}</span>
            </div>
            <div class="flex items-center text-blue-600 dark:text-blue-500">
              <LucideHash class="w-4 h-4 mr-2" />
              <span class="font-medium">ID :</span> 
              <span class="ml-2 font-mono">{{ selectedCondition.name }}</span>
            </div>
          </div>
        </div>
        
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Utilisation</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Cette condition peut être associée à des transitions pour définir des règles 
            conditionnelles lors du passage d'un état à un autre.
          </p>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  LucideSearch, 
  LucideChevronDown, 
  LucideChevronRight,
  LucideInfo,
  LucideList,
  LucideLayoutList,
  LucidePackage,
  LucideHash
} from 'lucide-vue-next';
import Modal from '@/components/ui/UiModal.vue';

// Props
const props = defineProps({
  packetCondition: {
    type: Array,
    default: () => []
  }
});

// État local
const searchQuery = ref('');
const showSearch = ref(false);
const expandedPackages = ref({});
const displayMode = ref('detailed'); // 'detailed' ou 'compact'
const showConditionModal = ref(false);
const selectedCondition = ref(null);

// Initialiser les packages comme tous ouverts par défaut
onMounted(() => {
  props.packetCondition.forEach(pkg => {
    expandedPackages.value[pkg.name] = true;
  });
});

// Basculer le mode d'affichage
const toggleDisplayMode = () => {
  displayMode.value = displayMode.value === 'detailed' ? 'compact' : 'detailed';
};

// Basculer l'état d'expansion d'un package
const togglePackage = (packageId) => {
  expandedPackages.value[packageId] = !expandedPackages.value[packageId];
};

// Ouvrir le modal de détails
const openConditionDetails = (condition) => {
  selectedCondition.value = condition;
  showConditionModal.value = true;
};

// Obtenir le nom du package d'une condition
const getPackageName = (conditionId) => {
  for (const pkg of props.packetCondition) {
    if (pkg.functions.some(c => c.name === conditionId)) {
      return pkg.label;
    }
  }
  return 'Package inconnu';
};

// Filtrer les packages en fonction de la recherche
const filteredPackages = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.packetCondition;
  }
  
  const query = searchQuery.value.toLowerCase().trim();
  
  return props.packetCondition.filter(pkg => {
    // Vérifier si le nom du package correspond
    if (pkg.label.toLowerCase().includes(query)) {
      return true;
    }
    
    // Vérifier si une des conditions correspond
    const hasMatchingCondition = pkg.functions.some(condition => 
      condition.label.toLowerCase().includes(query) || 
      condition.description.toLowerCase().includes(query) ||
      condition.name.toLowerCase().includes(query)
    );
    
    return hasMatchingCondition;
  }).map(pkg => {
    // Si le package est inclus à cause de conditions spécifiques,
    // ne retourner que les conditions qui correspondent
    if (!pkg.label.toLowerCase().includes(query)) {
      return {
        ...pkg,
        functions: pkg.functions.filter(condition => 
          condition.label.toLowerCase().includes(query) || 
          condition.description.toLowerCase().includes(query) ||
          condition.name.toLowerCase().includes(query)
        )
      };
    }
    
    // Sinon, retourner le package complet
    return pkg;
  });
});

// Calculer le nombre total de conditions
const totalConditionsCount = computed(() => {
  return props.packetCondition.reduce((total, pkg) => total + pkg.functions.length, 0);
});
</script>

<style scoped>

</style>