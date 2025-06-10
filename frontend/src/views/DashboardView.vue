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

    <div v-else>
      <!-- Stats Cards Globales (Admin seulement) -->
      <div v-if="isAdmin" class="mb-8">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ t('dashboard.global_statistics') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="(stat, index) in globalStats" :key="index" 
            class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300 hover:shadow-lg">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ stat.value }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ stat.subtitle }}</p>
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
      </div>

      <!-- Stats Cards Personnelles -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ isAdmin ? t('dashboard.admin_personal_section') : t('dashboard.my_statistics_section') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="(stat, index) in personalStats" :key="index" 
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
              <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                   :style="`width: ${contractStats.deployedPercentage}%`"></div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.chart.completed_contracts') }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ contractStats.completed }}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full transition-all duration-500" 
                   :style="`width: ${contractStats.completedPercentage}%`"></div>
            </div>
          </div>
        </div>

        <!-- User Progress (User seulement) -->
        <div v-if="!isAdmin" class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {{ t('dashboard.progress') }}
          </h3>
          <div class="space-y-4">
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

      <!-- Evolution Chart avec Chart.js -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('dashboard.contracts_evolution_chart') }}
          </h3>
          <div class="flex space-x-2">
            <button 
              @click="chartPeriod = 'daily'"
              :class="chartPeriod === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
              class="px-3 py-1 rounded-md text-sm transition-colors"
            >
              {{ t('dashboard.daily_period') }}
            </button>
            <button 
              @click="chartPeriod = 'monthly'"
              :class="chartPeriod === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
              class="px-3 py-1 rounded-md text-sm transition-colors"
            >
              {{ t('dashboard.monthly_period') }}
            </button>
          </div>
        </div>
        <div class="h-80">
          <canvas ref="evolutionChart"></canvas>
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
                  {{ formatDate(contract.updatedAt) }} • 
                  <span :class="statusClasses[contract.status]" class="px-2 py-0.5 rounded-full text-xs">
                    {{ getStatusLabel(contract.status) }}
                  </span>
                </p>
                <!-- Affichage de l'email du créateur -->
                <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {{ t('dashboard.created_by') }}: {{ contract.createdBy }}
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useI18n } from '@/composables/i18n/useI18n';
import { useAuthStore } from '@/stores/AuthStore';
import { useAutomatonContractStore } from '@/stores/automatonContractStore';
import { usePackageStore } from '@/stores/packageStore';
import { useThemeStore } from '@/stores/theme';
import { storeToRefs } from 'pinia';
import { ContractStatus, ContractStatusLabels } from '@/enums/ContractStatus';
import { 
  LucideRocket, 
  LucideCode, 
  LucideCircuitBoard, 
  LucideFileText,
  LucidePackage,
  LucideUsers,
  LucideActivity,
  LucideCheckCircle
} from 'lucide-vue-next';
import Chart from 'chart.js/auto';

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
const chartPeriod = ref('monthly');
const evolutionChart = ref(null);
let chartInstance = null;

// Classes de statut et couleurs
const statusClasses = {
  'draft': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  'deployed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  'completed': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
};

const getStatusBarColor = (status) => {
  switch (status) {
    case 'deployed':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    case 'draft':
    default:
      return 'bg-yellow-500';
  }
};

// Calculs pour les contrats
const allContracts = computed(() => contractStore.contracts || []);

const userContracts = computed(() => {
  if (isAdmin.value) {
    return allContracts.value.filter(c => c.createdBy === authStore.user.email);
  }
  return allContracts.value;
});

const contractStats = computed(() => {
  const contracts = userContracts.value;
  const draft = contracts.filter(c => c.status === ContractStatus.DRAFT).length;
  const deployed = contracts.filter(c => c.status === ContractStatus.DEPLOYED).length;
  const completed = contracts.filter(c => c.status === ContractStatus.COMPLETED).length;
  const total = contracts.length;
  
  return {
    draft,
    deployed,
    completed,
    total,
    draftPercentage: total > 0 ? Math.round((draft / total) * 100) : 0,
    deployedPercentage: total > 0 ? Math.round((deployed / total) * 100) : 0,
    completedPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  };
});

// Stats globales pour admin
const globalStats = computed(() => {
  if (!isAdmin.value) return [];
  
  const contracts = allContracts.value;
  
  const draftContracts = contracts.filter(c => c.status === ContractStatus.DRAFT).length;
  const deployedContracts = contracts.filter(c => c.status === ContractStatus.DEPLOYED).length;
  const completedContracts = contracts.filter(c => c.status === ContractStatus.COMPLETED).length;

  return [
    {
      label: t('dashboard.stats.global_total_contracts'),
      value: contracts.length.toString(),
      subtitle: t('dashboard.stats.all_platform'),
      icon: LucideFileText,
      iconBg: 'bg-gray-600'
    },
    {
      label: t('dashboard.stats.global_draft_contracts'),
      value: draftContracts.toString(),
      subtitle: t('dashboard.stats.all_platform'),
      icon: LucideCode,
      iconBg: 'bg-yellow-600'
    },
    {
      label: t('dashboard.stats.global_deployed_contracts'),
      value: deployedContracts.toString(),
      subtitle: t('dashboard.stats.all_platform'),
      icon: LucideRocket,
      iconBg: 'bg-blue-600'
    },
    {
      label: t('dashboard.stats.global_completed_contracts'),
      value: completedContracts.toString(),
      subtitle: t('dashboard.stats.all_platform'),
      icon: LucideCheckCircle,
      iconBg: 'bg-green-600'
    }
  ];
});

// Stats personnelles
const personalStats = computed(() => {
  const contracts = userContracts.value;
  const draftContracts = contracts.filter(c => c.status === ContractStatus.DRAFT).length;
  const deployedContracts = contracts.filter(c => c.status === ContractStatus.DEPLOYED).length;
  const completedContracts = contracts.filter(c => c.status === ContractStatus.COMPLETED).length;

  return [
    {
      label: isAdmin.value ? t('dashboard.stats.admin_my_contracts') : t('dashboard.stats.my_contracts'),
      value: contracts.length.toString(),
      icon: LucideFileText,
      iconBg: 'bg-blue-600'
    },
    {
      label: isAdmin.value ? t('dashboard.stats.admin_my_drafts') : t('dashboard.stats.draft_contracts'),
      value: draftContracts.toString(),
      icon: LucideCode,
      iconBg: 'bg-yellow-600'
    },
    {
      label: isAdmin.value ? t('dashboard.stats.admin_my_deployed') : t('dashboard.stats.deployed_contracts'),
      value: deployedContracts.toString(),
      icon: LucideRocket,
      iconBg: 'bg-blue-600'
    },
    {
      label: isAdmin.value ? t('dashboard.stats.admin_my_completed') : t('dashboard.stats.completed_contracts'),
      value: completedContracts.toString(),
      icon: LucideCheckCircle,
      iconBg: 'bg-green-600'
    }
  ];
});

// Statistiques personnelles de l'admin pour l'Admin Overview
const adminPersonalStats = computed(() => {
  if (!isAdmin.value) return { total: 0, drafts: 0, deployed: 0, completed: 0 };
  
  const adminContracts = allContracts.value.filter(c => c.createdBy === authStore.user.email);
  const drafts = adminContracts.filter(c => c.status === ContractStatus.DRAFT).length;
  const deployed = adminContracts.filter(c => c.status === ContractStatus.DEPLOYED).length;
  const completed = adminContracts.filter(c => c.status === ContractStatus.COMPLETED).length;
  
  return {
    total: adminContracts.length,
    drafts,
    deployed,
    completed
  };
});

// Statistiques supplémentaires pour admin
const uniqueUsersCount = computed(() => {
  if (!isAdmin.value) return 0;
  const users = new Set(allContracts.value.map(c => c.createdBy));
  return users.size;
});

const activeContractsCount = computed(() => {
  if (!isAdmin.value) return 0;
  return allContracts.value.filter(c => 
    c.status === ContractStatus.DEPLOYED || c.status === ContractStatus.COMPLETED
  ).length;
});

const recentContracts = computed(() => {
  const contracts = isAdmin.value ? allContracts.value : userContracts.value;
  return contracts
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);
});

// Methods
const getStatusColor = (status) => {
  return getStatusBarColor(status);
};

const getStatusLabel = (status) => {
  const statusLabel = ContractStatusLabels.find(s => s.value === status);
  return statusLabel ? statusLabel.label : status;
};

// Préparer les données pour le chart
const prepareChartData = () => {
  const contracts = isAdmin.value ? allContracts.value : userContracts.value;
  
  if (chartPeriod.value === 'monthly') {
    return prepareMonthlyData(contracts);
  } else {
    return prepareDailyData(contracts);
  }
};

const prepareMonthlyData = (contracts) => {
  const monthlyData = {};
  
  contracts.forEach(contract => {
    const date = new Date(contract.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        draft: 0,
        deployed: 0,
        completed: 0
      };
    }
    
    monthlyData[monthKey][contract.status]++;
  });
  
  // Trier les mois et prendre les 12 derniers
  const sortedMonths = Object.keys(monthlyData).sort().slice(-12);
  
  return {
    labels: sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(year, monthNum - 1);
      return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: t('dashboard.chart.draft_contracts'),
        data: sortedMonths.map(month => monthlyData[month].draft),
        backgroundColor: 'rgba(234, 179, 8, 0.5)',
        borderColor: 'rgb(234, 179, 8)',
        borderWidth: 2
      },
      {
        label: t('dashboard.chart.deployed_contracts'),
        data: sortedMonths.map(month => monthlyData[month].deployed),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      {
        label: t('dashboard.chart.completed_contracts'),
        data: sortedMonths.map(month => monthlyData[month].completed),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2
      }
    ]
  };
};

const prepareDailyData = (contracts) => {
  const dailyData = {};
  
  // Créer les 30 derniers jours
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayKey = date.toISOString().split('T')[0];
    dailyData[dayKey] = {
      draft: 0,
      deployed: 0,
      completed: 0
    };
  }
  
  contracts.forEach(contract => {
    const dayKey = contract.createdAt.split('T')[0];
    if (dailyData[dayKey]) {
      dailyData[dayKey][contract.status]++;
    }
  });
  
  const sortedDays = Object.keys(dailyData).sort();
  
  return {
    labels: sortedDays.map(day => {
      const date = new Date(day);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }),
    datasets: [
      {
        label: t('dashboard.chart.draft_contracts'),
        data: sortedDays.map(day => dailyData[day].draft),
        backgroundColor: 'rgba(234, 179, 8, 0.5)',
        borderColor: 'rgb(234, 179, 8)',
        borderWidth: 2
      },
      {
        label: t('dashboard.chart.deployed_contracts'),
        data: sortedDays.map(day => dailyData[day].deployed),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      {
        label: t('dashboard.chart.completed_contracts'),
        data: sortedDays.map(day => dailyData[day].completed),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2
      }
    ]
  };
};

const createEvolutionChart = () => {
  // Vérifier que le canvas existe et est monté
  if (!evolutionChart.value) {
    console.warn('Canvas not ready yet, skipping chart creation');
    return;
  }

  if (chartInstance) {
    chartInstance.destroy();
  }
  
  try {
    const ctx = evolutionChart.value.getContext('2d');
    const chartData = prepareChartData();
    
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: darkMode.value ? '#e5e7eb' : '#374151'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: darkMode.value ? '#9ca3af' : '#6b7280'
            },
            grid: {
              color: darkMode.value ? '#374151' : '#e5e7eb'
            }
          },
          x: {
            ticks: {
              color: darkMode.value ? '#9ca3af' : '#6b7280'
            },
            grid: {
              color: darkMode.value ? '#374151' : '#e5e7eb'
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du chart:', error);
  }
};

// Watch pour recréer le chart quand la période change
watch(chartPeriod, () => {
  nextTick(() => {
    if (evolutionChart.value) {
      createEvolutionChart();
    }
  });
});

// Watch pour recréer le chart quand le thème change
watch(darkMode, () => {
  nextTick(() => {
    if (evolutionChart.value) {
      createEvolutionChart();
    }
  });
});

// Lifecycle
onMounted(async () => {
  try {
    // Charger les données
    if (authStore.user.role === 'admin') {
      await Promise.all([
        contractStore.fetchContracts(),
        packageStore.fetchPackages()
      ]);
    } else {
      await Promise.all([
        contractStore.fetchContractsByUser(authStore.user.email),
        packageStore.fetchPackages()
      ]);
    }

  } catch (error) {
    console.error('Erreur lors du chargement des données du dashboard:', error);
  } finally {
    loading.value = false;
    
    // Créer le chart après que le loading soit terminé et le DOM mis à jour
    await nextTick();
    setTimeout(() => {
      createEvolutionChart();
    }, 100);
  }
});
</script>