<template>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{{ $route.meta.title }}</h1>
  
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div v-for="(stat, index) in stats" :key="index" 
          class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ stat.value }}</p>
            </div>
            <div :class="`h-10 w-10 rounded-full flex items-center justify-center ${stat.iconBg}`">
              <component :is="stat.icon" class="h-5 w-5 text-white" />
            </div>
          </div>
          <div class="mt-4">
            <p :class="`text-sm ${stat.changeColor}`">
              <span>{{ stat.changePrefix }} {{ stat.change }}</span>
              <span class="text-gray-500 dark:text-gray-400 ml-1">vs mois précédent</span>
            </p>
          </div>
        </div>
      </div>
  
      <!-- Grid layout pour les composants FSM -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AutomateList />
        <FunctionList />
        <StateList />
      </div>
    </div>
  </template>
  
  <script setup>
  import AutomateList from '../components/fsm/AutomateList.vue';
  import FunctionList from '../components/fsm/FunctionList.vue';
  import StateList from '../components/fsm/StateList.vue';
  import { LucideRocket, LucideCode, LucideCircuitBoard } from 'lucide-vue-next';
  
  // Stats mock data
  const stats = [
    {
      label: 'Automates actifs',
      value: '24',
      icon: LucideRocket,
      iconBg: 'bg-blue-600',
      change: '12%',
      changePrefix: '+',
      changeColor: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Fonctions utilisées',
      value: '46',
      icon: LucideCode,
      iconBg: 'bg-indigo-600',
      change: '4%',
      changePrefix: '+',
      changeColor: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'États configurés',
      value: '12',
      icon: LucideCircuitBoard,
      iconBg: 'bg-purple-600',
      change: '2%',
      changePrefix: '-',
      changeColor: 'text-red-600 dark:text-red-400'
    }
  ];
  </script>