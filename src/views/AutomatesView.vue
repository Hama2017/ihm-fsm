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
              placeholder="Rechercher un automate..."
              class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors duration-300"
            />
          </div>
          <select class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300">
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="error">En erreur</option>
          </select>
        </div>
        
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200">
          <LucidePlus class="h-4 w-4" />
          <span>Nouvel automate</span>
        </button>
      </div>
      
      <!-- Automate editor -->
      <AutomateEditor />
      
      <!-- Liste d'automates sous forme de cartes -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div v-for="automate in automates" :key="automate.id" 
          class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ automate.name }}</h3>
            <div :class="`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[automate.status]}`">
              {{ automate.status }}
            </div>
          </div>
          
          <p class="text-gray-600 dark:text-gray-300 text-sm mb-6">{{ automate.description }}</p>
          
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
              @click="selectAutomate(automate.id)"
            >
              Éditer
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import AutomateEditor from '../components/fsm/AutomateEditor.vue';
  import { LucidePlus, LucideSearch, LucidePencil, LucideTrash2 } from 'lucide-vue-next';
  
  // Status CSS classes
  const statusClasses = {
    'Actif': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
    'Inactif': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    'En erreur': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
  };
  
  // Sample automates data
  const automates = ref([
    {
      id: 1,
      name: 'Automate de traitement de paiements',
      description: 'Gère automatiquement les flux de paiements blockchain et les réconciliations.',
      status: 'Actif'
    },
    {
      id: 2,
      name: 'Gestionnaire de NFT',
      description: 'Automatise le minting et le transfert de NFTs selon les règles définies.',
      status: 'Inactif'
    },
    {
      id: 3,
      name: 'Agrégateur DeFi',
      description: 'Répartit les fonds entre différents protocoles DeFi pour optimiser les rendements.',
      status: 'En erreur'
    },
    {
      id: 4,
      name: 'Validateur de transactions',
      description: 'Vérifie la conformité des transactions selon les politiques établies.',
      status: 'Actif'
    },
    {
      id: 5,
      name: 'Moniteur de sécurité',
      description: 'Surveille les activités suspectes et alerte en cas d\'anomalies détectées.',
      status: 'Actif'
    }
  ]);
  
  // Methods
  const selectAutomate = (id) => {
    console.log(`Automate ${id} sélectionné pour édition`);
    // Ici, vous implementeriez la logique pour charger l'automate dans l'éditeur
  };
  </script>