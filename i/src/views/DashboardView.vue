<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
      {{ t('dashboard.title') }}
    </h1>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600 dark:text-gray-400">{{ t('dashboard.loading') }}</span>
    </div>

    <!-- Stats Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="(stat, index) in dashboardStats" :key="index" 
        class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300 hover:shadow-lg">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ stat.value }}</p>
          </div>
          <div :class="`h-12 w-12 rounded-full flex items-center justify-center ${stat.iconBg}`">
            <component :is="stat.icon" class="h-6 w-6 text-white" />
          </div>
        </div>
        <div v-if="stat.change !== undefined" class="mt-4">
          <p :class="`text-sm ${stat.changeColor}`">
            <span>{{ stat.changePrefix }}{{ stat.change }}%</span>
            <span class="text-gray-500 dark:text-gray-400 ml-1">{{ t('dashboard.vs_last_month') }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Contracts Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ t('dashboard.contracts_evolution') }}
        </h3>
        <!-- Simple CSS Chart -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.chart.draft_contracts') }}</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ contractStats.draft }}</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                 :style="`width: ${contractStats.draftPercentage}%`"></div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.chart.deployed_contracts') }}</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ contractStats.deployed }}</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-green-500 h-2 rounded-full transition-all duration-500" 
                 :style="`width: ${contractStats.deployedPercentage}%`"></div>
          </div>
        </div>
      </div>

      <!-- Admin Stats or User Progress -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ isAdmin ? t('dashboard.admin_overview') : t('dashboard.progress') }}
        </h3>
        <div v-if="isAdmin" class="space-y-4">
          <!-- Admin stats -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.stats.total_packages') }}</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ packageStore.packages.length }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.stats.total_contracts') }}</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ contractStore.contracts.length }}</span>
          </div>
         
        </div>
        <div v-else class="space-y-4">
          <!-- User progress -->
          <div class="text-center">
            <div class="relative inline-flex items-center justify-center w-24 h-24">
              <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="4" 
                        fill="transparent" class="text-gray-300 dark:text-gray-700"/>
                <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="4" 
                        fill="transparent" stroke-linecap="round"
                        class="text-blue-600 transition-all duration-500"
                        :stroke-dasharray="251.2" 
                        :stroke-dashoffset="251.2 - (contractStats.completionRate / 100) * 251.2"/>
              </svg>
              <span class="absolute text-xl font-bold text-gray-900 dark:text-white">
                {{ contractStats.completionRate }}%
              </span>
            </div>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.completion_rate') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {{ t('dashboard.recent_activity') }}
      </h3>
      <div v-if="recentContracts.length > 0" class="space-y-3">
        <div v-for="contract in recentContracts" :key="contract.id" 
          class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex items-center">
            <div :class="`h-3 w-3 rounded-full mr-3 ${getStatusColor(contract.status)}`"></div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ contract.name }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(contract.updatedAt) }} • {{ getStatusLabel(contract.status) }}
              </p>
            </div>
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ contract.automates?.length || 0 }} {{ t('dashboard.automatons') }}
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
        {{ t('dashboard.no_recent_activity') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useI18n } from '@/composables/i18n/useI18n';
import { useAuthStore } from '@/stores/AuthStore';
import { useAutomatonContractStore } from '@/stores/automatonContractStore';
import { usePackageStore } from '@/stores/packageStore';
import { useThemeStore } from '@/stores/theme';
import { storeToRefs } from 'pinia';
import { 
  LucideRocket, 
  LucideCode, 
  LucideCircuitBoard, 
  LucideFileText,
  LucidePackage
} from 'lucide-vue-next';
// import Chart from 'chart.js/auto'; // Désactivé temporairement

// Composables
const { t, formatDate } = useI18n();
const authStore = useAuthStore();
const contractStore = useAutomatonContractStore();
const packageStore = usePackageStore();
const themeStore = useThemeStore();

// Reactive refs
const { darkMode } = storeToRefs(themeStore);
const { isAdmin } = storeToRefs(authStore);

// State
const loading = ref(true);
// const contractsChart = ref(null); // Désactivé temporairement
// const usersChart = ref(null);     // Désactivé temporairement
// const statusChart = ref(null);    // Désactivé temporairement

const contractStats = computed(() => {
  const contracts = contractStore.contracts || [];
  const draft = contracts.filter(c => c.status === 'draft').length;
  const deployed = contracts.filter(c => c.status === 'deployed').length;
  const total = contracts.length;
  
  return {
    draft,
    deployed,
    total,
    draftPercentage: total > 0 ? Math.round((draft / total) * 100) : 0,
    deployedPercentage: total > 0 ? Math.round((deployed / total) * 100) : 0,
    completionRate: total > 0 ? Math.round((deployed / total) * 100) : 0
  };
});

const dashboardStats = computed(() => {
  const contracts = contractStore.contracts || [];
  const packages = packageStore.packages || [];
  
  const draftContracts = contracts.filter(c => c.status === 'draft').length;
  const deployedContracts = contracts.filter(c => c.status === 'deployed').length;
  const totalAutomatons = contracts.reduce((sum, c) => sum + (c.automates?.length || 0), 0);

  if (isAdmin.value) {
    // Stats pour admin - DONNÉES RÉELLES UNIQUEMENT
    return [
      {
        label: t('dashboard.stats.total_contracts'),
        value: contracts.length.toString(),
        subtitle: t('dashboard.stats.all_users'),
        icon: LucideFileText,
        iconBg: 'bg-blue-600'
      },
      {
        label: t('dashboard.stats.deployed_contracts'),
        value: deployedContracts.toString(),
        subtitle: t('dashboard.stats.active_on_blockchain'),
        icon: LucideRocket,
        iconBg: 'bg-green-600'
      },
      {
        label: t('dashboard.stats.total_packages'),
        value: packages.length.toString(),
        subtitle: t('dashboard.stats.available_functions'),
        icon: LucidePackage,
        iconBg: 'bg-purple-600'
      },
      {
        label: t('dashboard.stats.draft_contracts'),
        value: draftContracts.toString(),
        subtitle: t('dashboard.stats.in_development'),
        icon: LucideCode,
        iconBg: 'bg-yellow-600'
      }
    ];
  } else {
    // Stats pour utilisateur normal - DONNÉES RÉELLES UNIQUEMENT
    return [
      {
        label: t('dashboard.stats.my_contracts'),
        value: contracts.length.toString(),
        icon: LucideFileText,
        iconBg: 'bg-blue-600'
      },
      {
        label: t('dashboard.stats.draft_contracts'),
        value: draftContracts.toString(),
        icon: LucideCode,
        iconBg: 'bg-yellow-600'
      },
      {
        label: t('dashboard.stats.deployed_contracts'),
        value: deployedContracts.toString(),
        icon: LucideRocket,
        iconBg: 'bg-green-600'
      },
      {
        label: t('dashboard.stats.total_automatons'),
        value: totalAutomatons.toString(),
        icon: LucideCircuitBoard,
        iconBg: 'bg-purple-600'
      }
    ];
  }
});

const recentContracts = computed(() => {
  return contractStore.contracts
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);
});

// Methods
const getStatusColor = (status) => {
  switch (status) {
    case 'deployed': return 'bg-green-500';
    case 'draft': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

const getStatusLabel = (status) => {
  return t(`contract.status.${status}`) || status;
};

// Methods pour les graphiques Chart.js (désactivées temporairement)
/*
const createContractsChart = () => {
  // Code Chart.js désactivé temporairement
};

const createUsersChart = () => {
  // Code Chart.js désactivé temporairement
};

const createStatusChart = () => {
  // Code Chart.js désactivé temporairement
};
*/

// Lifecycle
onMounted(async () => {
  try {
    // Charger les données
    await Promise.all([
      contractStore.fetchContracts(),
      packageStore.fetchPackages()
    ]);

    // Note: Graphiques Chart.js désactivés temporairement
    // Pour activer, installer: npm install chart.js
    // Puis décommenter les imports et fonctions Chart.js
  } catch (error) {
    console.error('Erreur lors du chargement des données du dashboard:', error);
  } finally {
    loading.value = false;
  }
});
</script>