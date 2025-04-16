<template>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{{ $route.meta.title }}</h1>
      
      <!-- Actions toolbar -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <LucideSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Rechercher un contrat..."
              class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors duration-300"
            />
          </div>
          <select 
            v-model="statusFilter"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="draft">Brouillon</option>
          </select>
        </div>
        
        <router-link 
          :to="{ name: 'create-contract' }" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200"
        >
          <LucideFilePlus class="h-4 w-4" />
          <span>Nouveau contrat</span>
        </router-link>
      </div>
      
      <!-- Liste des contrats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="contract in filteredContracts" 
          :key="contract.id" 
          class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ contract.name }}</h3>
            <div :class="`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[contract.status]}`">
              {{ contract.status }}
            </div>
          </div>
          
          <div class="flex flex-col space-y-2 mb-4">
            <div class="flex items-center text-sm">
              <LucideHash class="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
              <span class="text-gray-700 dark:text-gray-300">ID: {{ contract.id }}</span>
            </div>
            <div class="flex items-center text-sm">
              <LucideBox class="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
              <span class="text-gray-700 dark:text-gray-300">{{ contract.automates.length }} automate(s)</span>
            </div>
            <div class="flex items-center text-sm">
              <LucideCalendar class="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
              <span class="text-gray-700 dark:text-gray-300">Créé le: {{ formatDate(contract.createdAt) }}</span>
            </div>
          </div>
          
          <div class="flex justify-between items-center">
            <div class="flex space-x-2">
              <button class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                <LucidePencil class="h-4 w-4" />
              </button>
              <button class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                <LucideTrash2 class="h-4 w-4" />
              </button>
            </div>
            
            <button 
              class="px-3 py-1 rounded-lg text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
              @click="viewContract(contract.id)"
            >
              Détails
            </button>
          </div>
        </div>
      </div>
      
      <!-- Message si aucun contrat trouvé -->
      <div v-if="filteredContracts.length === 0" class="text-center py-10">
        <LucideFileSearch class="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucun contrat trouvé</h3>
        <p class="mt-2 text-gray-500 dark:text-gray-400">
          Il n'y a aucun contrat correspondant à vos critères de recherche.
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useThemeStore } from '../../stores/theme';
  import { storeToRefs } from 'pinia';
  import { 
    LucideFilePlus, 
    LucideSearch, 
    LucidePencil, 
    LucideTrash2, 
    LucideBox, 
    LucideHash, 
    LucideCalendar,
    LucideFileSearch
  } from 'lucide-vue-next';
  
  // Router
  const router = useRouter();
  
  // Theme store
  const themeStore = useThemeStore();
  const { darkMode } = storeToRefs(themeStore);
  
  // State
  const searchQuery = ref('');
  const statusFilter = ref('all');
  
  // Status CSS classes
  const statusClasses = {
    'Actif': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
    'Inactif': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    'Brouillon': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
  };
  
  // Exemple de données de contrats
  const contracts = ref([
    {
      id: "0001",
      name: "CONTRACT 0001",
      status: "Actif",
      createdAt: new Date(2024, 9, 5),
      automates: [
        {
          id: "01",
          name: "AUTOMATE 01",
          active: true,
          states: [
            { id: "state-1", label: "État A" },
            { id: "state-2", label: "État B" }
          ],
          transitions: [
            { id: "transition-1", source: "state-1", target: "state-2", label: "aller" }
          ]
        }
      ]
    },
    {
      id: "0002",
      name: "CONTRACT 0002",
      status: "Brouillon",
      createdAt: new Date(2024, 8, 15),
      automates: [
        {
          id: "01",
          name: "AUTOMATE 01",
          active: true,
          states: [
            { id: "state-1", label: "État Initial" },
            { id: "state-2", label: "État Final" }
          ],
          transitions: [
            { id: "transition-1", source: "state-1", target: "state-2", label: "terminer" }
          ]
        },
        {
          id: "02",
          name: "AUTOMATE 02",
          active: false,
          states: [
            { id: "state-1", label: "État A" },
            { id: "state-2", label: "État B" }
          ],
          transitions: []
        }
      ]
    },
    {
      id: "0003",
      name: "CONTRACT 0003",
      status: "Inactif",
      createdAt: new Date(2024, 7, 22),
      automates: []
    }
  ]);
  
  // Filtrer les contrats selon la recherche et le statut
  const filteredContracts = computed(() => {
    return contracts.value.filter(contract => {
      const matchesSearch = contract.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                           contract.id.toLowerCase().includes(searchQuery.value.toLowerCase());
      
      const matchesStatus = statusFilter.value === 'all' || 
                           (statusFilter.value === 'active' && contract.status === 'Actif') ||
                           (statusFilter.value === 'inactive' && contract.status === 'Inactif') ||
                           (statusFilter.value === 'draft' && contract.status === 'Brouillon');
      
      return matchesSearch && matchesStatus;
    });
  });
  
  // Méthodes
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  const viewContract = (contractId) => {
    // Rediriger vers la page de détails du contrat (à implémenter)
    console.log(`Voir les détails du contrat ${contractId}`);
    // router.push({ name: 'contract-details', params: { id: contractId } });
  };
  </script>