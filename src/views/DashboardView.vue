<script setup>
import { ref } from 'vue';

const stats = ref([
  { id: 'total-contracts', title: 'Contrats Déployés', value: '24', change: '+12%', trend: 'up' },
  { id: 'active-contracts', title: 'Contrats Actifs', value: '18', change: '+8%', trend: 'up' },
  { id: 'automata', title: 'Automates', value: '56', change: '+15%', trend: 'up' },
  { id: 'transactions', title: 'Transactions', value: '432', change: '-3%', trend: 'down' },
]);

const recentContracts = ref([
  { id: '001', name: 'Contrat Commercial A', automata: 4, status: 'active', created: '2025-04-10' },
  { id: '002', name: 'Contrat Assurance B', automata: 6, status: 'active', created: '2025-04-08' },
  { id: '003', name: 'Contrat Services C', automata: 3, status: 'pending', created: '2025-04-05' },
  { id: '004', name: 'Contrat Immobilier D', automata: 5, status: 'inactive', created: '2025-03-28' },
]);

const recentAutomata = ref([
  { id: 'a001', name: 'Clause de paiement', contract: 'Contrat Commercial A', status: 'active', transitions: 8 },
  { id: 'a002', name: 'Clause de livraison', contract: 'Contrat Commercial A', status: 'active', transitions: 6 },
  { id: 'a003', name: 'Clause de résiliation', contract: 'Contrat Assurance B', status: 'pending', transitions: 4 },
  { id: 'a004', name: 'Clause de garantie', contract: 'Contrat Services C', status: 'active', transitions: 5 },
]);

// Statut des couleurs pour les badges
const statusColors = {
  active: 'bg-success/20 text-success',
  pending: 'bg-warning/20 text-warning',
  inactive: 'bg-secondary-400/20 text-secondary-400',
};
</script>

<template>
  <div>
    <h2 class="text-2xl font-semibold text-white mb-6">Tableau de bord</h2>
    
    <!-- Cartes statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div 
        v-for="stat in stats" 
        :key="stat.id" 
        class="bg-secondary-800 rounded-lg p-4 border border-secondary-700 hover:border-primary-500 transition-colors"
      >
        <h3 class="text-secondary-400 text-sm font-medium mb-1">{{ stat.title }}</h3>
        <div class="flex items-end justify-between">
          <span class="text-2xl font-semibold text-white">{{ stat.value }}</span>
          <span 
            class="text-xs font-medium px-2 py-1 rounded-full"
            :class="stat.trend === 'up' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'"
          >
            {{ stat.change }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Contenu principal en deux colonnes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Contrats récents -->
      <div class="bg-secondary-800 rounded-lg border border-secondary-700 overflow-hidden">
        <div class="p-4 border-b border-secondary-700 flex justify-between items-center">
          <h3 class="text-white font-medium">Contrats récents</h3>
          <button class="text-primary-500 hover:text-primary-400 text-sm font-medium">Voir tous</button>
        </div>
        <div class="p-4">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-xs text-secondary-400 uppercase">
                  <th class="pb-3 pl-4">Nom</th>
                  <th class="pb-3">Automates</th>
                  <th class="pb-3">Statut</th>
                  <th class="pb-3 pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="contract in recentContracts" 
                  :key="contract.id"
                  class="border-t border-secondary-700 hover:bg-secondary-700/30"
                >
                  <td class="py-3 pl-4 text-white">{{ contract.name }}</td>
                  <td class="py-3 text-secondary-300">{{ contract.automata }}</td>
                  <td class="py-3">
                    <span 
                      class="text-xs font-medium px-2 py-1 rounded-full"
                      :class="statusColors[contract.status]"
                    >
                      {{ contract.status }}
                    </span>
                  </td>
                  <td class="py-3 pr-4 text-secondary-300">{{ contract.created }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Automates récents -->
      <div class="bg-secondary-800 rounded-lg border border-secondary-700 overflow-hidden">
        <div class="p-4 border-b border-secondary-700 flex justify-between items-center">
          <h3 class="text-white font-medium">Automates récents</h3>
          <button class="text-primary-500 hover:text-primary-400 text-sm font-medium">Voir tous</button>
        </div>
        <div class="p-4">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-xs text-secondary-400 uppercase">
                  <th class="pb-3 pl-4">Nom</th>
                  <th class="pb-3">Contrat</th>
                  <th class="pb-3">Statut</th>
                  <th class="pb-3 pr-4">Transitions</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="automata in recentAutomata" 
                  :key="automata.id"
                  class="border-t border-secondary-700 hover:bg-secondary-700/30"
                >
                  <td class="py-3 pl-4 text-white">{{ automata.name }}</td>
                  <td class="py-3 text-secondary-300">{{ automata.contract }}</td>
                  <td class="py-3">
                    <span 
                      class="text-xs font-medium px-2 py-1 rounded-full"
                      :class="statusColors[automata.status]"
                    >
                      {{ automata.status }}
                    </span>
                  </td>
                  <td class="py-3 pr-4 text-secondary-300">{{ automata.transitions }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Section d'actions rapides -->
    <div class="mt-6 bg-secondary-800 rounded-lg border border-secondary-700 p-4">
      <h3 class="text-white font-medium mb-4">Actions rapides</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <button class="p-4 rounded-lg bg-primary-700/20 border border-primary-700/30 hover:bg-primary-700/30 text-left transition-colors">
          <div class="flex items-center space-x-3">
            <div class="bg-primary-500/20 p-2 rounded-lg">
              <SvgIcon name="document" className="text-primary-500" />
            </div>
            <div>
              <h4 class="text-white font-medium">Créer un contrat</h4>
              <p class="text-secondary-400 text-sm">Démarrer un nouveau contrat</p>
            </div>
          </div>
        </button>
        
        <button class="p-4 rounded-lg bg-success/10 border border-success/20 hover:bg-success/20 text-left transition-colors">
          <div class="flex items-center space-x-3">
            <div class="bg-success/20 p-2 rounded-lg">
              <SvgIcon name="puzzle" className="text-success" />
            </div>
            <div>
              <h4 class="text-white font-medium">Ajouter un automate</h4>
              <p class="text-secondary-400 text-sm">Créer une nouvelle clause</p>
            </div>
          </div>
        </button>
        
        <button class="p-4 rounded-lg bg-info/10 border border-info/20 hover:bg-info/20 text-left transition-colors">
          <div class="flex items-center space-x-3">
            <div class="bg-info/20 p-2 rounded-lg">
              <SvgIcon name="arrows" className="text-info" />
            </div>
            <div>
              <h4 class="text-white font-medium">Déployer</h4>
              <p class="text-secondary-400 text-sm">Déployer sur la blockchain</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>