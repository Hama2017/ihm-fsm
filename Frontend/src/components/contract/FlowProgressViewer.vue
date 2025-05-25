<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm  p-4">
      <!-- En-tête avec titre et contrôles -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Progression du contrat
        </h3>
        <div class="flex items-center space-x-3">
          <!-- Sélecteur d'auto-refresh -->
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-500">Auto-refresh:</label>
            <select 
              v-model="autoRefreshInterval"
              @change="setupAutoRefresh"
              class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="0">Désactivé</option>
              <option value="5">5s</option>
              <option value="10">10s</option>
              <option value="25">25s</option>
              <option value="60">1min</option>
            </select>
          </div>
          
          <!-- Stats -->
          <span class="text-sm text-gray-500">
            {{ completedCount }}/{{ totalCount }} terminés
          </span>
          
          <!-- Bouton refresh manuel -->
          <button 
            @click="refreshStatus"
            :disabled="isRefreshing"
            class="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
            title="Actualiser"
          >
            <LucideRefreshCw :class="{ 'animate-spin': isRefreshing }" class="w-4 h-4" />
          </button>

          <!-- Bouton d'export JSON -->
          <button
            @click="exportFlow"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200 shadow-sm"
          >
            <LucideDownload class="w-4 h-4" />
            <span class="text-sm">Exporter JSON</span>
          </button>
        </div>
      </div>
  
      <!-- Barre de progression globale -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ progressPercentage }}%          </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>
  
      <!-- Légende -->
      <div class="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-gray-400 rounded"></div>
            <span class="text-xs text-gray-600 dark:text-gray-400">En attente</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-orange-500 rounded animate-pulse"></div>
            <span class="text-xs text-gray-600 dark:text-gray-400">Actif</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 bg-green-500 rounded"></div>
            <span class="text-xs text-gray-600 dark:text-gray-400">Terminé</span>
          </div>
        </div>
        
      
      </div>
      
      <!-- Conteneur du flow avec contrôles -->
      <div class="relative">
        <div class="flow-container" style="height: 300px; width: 100%;">
          <VueFlow 
            ref="vueFlowRef"
            v-if="flowNodes.length > 0"
            :nodes="flowNodes"
            :edges="flowEdges"
            :node-types="nodeTypes"
            :fit-view-on-init="true"
            :nodes-draggable="true"
            :nodes-connectable="false"
            :elements-selectable="false"
            :zoom-on-scroll="true"
            :pan-on-scroll="false"
            @nodes-initialized="onNodesInitialized"
          >
            <!-- Nœuds personnalisés -->
            <template #node-custom="{ data }">
              <div 
                :class="getNodeClass(data.executionStatus)"
                class="px-3 py-2 rounded-lg text-sm font-medium text-center min-w-[120px] border-2 border-white shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <div class="flex items-center justify-center space-x-1">
                  <component 
                    :is="getNodeIcon(data.executionStatus)" 
                    class="w-3 h-3" 
                  />
                  <span>{{ data.label }}</span>
                </div>
              </div>
            </template>


        

            
  
            <!-- Panel avec contrôles -->
            <Panel position="top-right" class="flex items-center space-x-2">
              <!-- Bouton capture -->
              <button
                @click="takeScreenshot"
                :disabled="isCapturing"
                class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                title="Capturer en JPG"
              >
                <LucideCamera :class="{ 'animate-pulse': isCapturing }" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
  
              <!-- Bouton centrer -->
              <button
                @click="centerFlow"
                class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                title="Centrer la vue"
              >
                <LucideExpand class="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
  
              <!-- Bouton plein écran -->
              <button
                @click="toggleFullscreen"
                class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                title="Plein écran"
              >
                <LucideMaximize2 v-if="!isFullscreen" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <LucideMinimize2 v-else class="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
  
              <!-- Contrôles de zoom -->
              <div class="flex items-center space-x-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                <button
                  @click="zoomOut"
                  class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Zoom arrière"
                >
                  <LucideMinus class="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
                <div class="px-2 text-xs text-gray-600 dark:text-gray-400 border-x border-gray-300 dark:border-gray-600">
                  {{ Math.round(zoomLevel * 100) }}%
                </div>
                <button
                  @click="zoomIn"
                  class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Zoom avant"
                >
                  <LucidePlus class="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </Panel>
          </VueFlow>
          
          <!-- Fallback si pas de nœuds -->
          <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
            <LucideWorkflow class="w-12 h-12 mb-2 opacity-40" />
            <p>Aucun flow de progression disponible</p>
          </div>
        </div>
  
        <!-- Overlay plein écran -->
        <div 
          v-if="isFullscreen"
          class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          @click="toggleFullscreen"
        >
          <div class="w-full h-full p-4">
            <div class="w-full h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <VueFlow 
                :nodes="flowNodes"
                :edges="flowEdges"
                :node-types="nodeTypes"
                :fit-view-on-init="true"
              >
                <template #node-custom="{ data }">
                  <div 
                    :class="getNodeClass(data.executionStatus)"
                    class="px-4 py-3 rounded-lg text-base font-medium text-center min-w-[140px] border-2 border-white shadow-lg"
                  >
                    <div class="flex items-center justify-center space-x-2">
                      <component 
                        :is="getNodeIcon(data.executionStatus)" 
                        class="w-4 h-4" 
                      />
                      <span>{{ data.label }}</span>
                    </div>
                  </div>
                </template>
              </VueFlow>
            </div>
          </div>
        </div>
      </div>

      <!-- Info auto-refresh -->
      <div v-if="autoRefreshInterval > 0" class="mt-4 text-center">
        <div class="text-sm text-gray-500">
          Prochain refresh dans {{ nextRefreshIn }}s
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
  import { VueFlow, Panel, useVueFlow } from '@vue-flow/core';
  import { 
    LucideRefreshCw, LucideCamera, LucideExpand, LucideMaximize2, 
    LucideMinimize2, LucidePlus, LucideMinus, LucideWorkflow,
    LucideDownload, LucideCheck, LucidePlay, LucideClock
  } from 'lucide-vue-next';
  import { useFlowExecution } from '@/composables/contract/useFlowExecution';
  import { toJpeg, toPng } from 'html-to-image';
  import '@vue-flow/core/dist/style.css';
  import toast from '@/composables/Toast/useToast';
  
  const props = defineProps({
    contractName: String,
    contractId: String,
    flowData: Object
  });
  
  const { updateFlowExecutionStatuses } = useFlowExecution(props.contractId);
  const { fitView, zoomTo } = useVueFlow();
  
  // Refs
  const vueFlowRef = ref();
  const isRefreshing = ref(false);
  const currentFlowData = ref(props.flowData);
  const isFullscreen = ref(false);
  const isOnline = ref(navigator.onLine);
  const autoRefreshInterval = ref(0);
  const autoRefreshTimer = ref(null);
  const nextRefreshIn = ref(0);
  const refreshCountdown = ref(null);
  const lastUpdate = ref(new Date());
  const zoomLevel = ref(1);
  const isCapturing = ref(false);
  
  // Types de nœuds personnalisés
  const nodeTypes = {
    custom: 'custom'
  };
  
  // Surveillance du statut en ligne
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine;
  };
  
  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  });
  
  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
    clearAutoRefresh();
  });
  
  // Formatage des nœuds
  const flowNodes = computed(() => {
    if (!currentFlowData.value?.states) return [];
    
    return currentFlowData.value.states.map((state, index) => ({
      id: state.id,
      type: 'custom',
      position: state.position || { x: index * 200, y: 50 },
      data: {
        label: state.label,
        executionStatus: state.executionStatus || 'pending'
      },
      draggable: true,
      selectable: false,
      connectable: false
    }));
  });
  
  // Formatage des edges
  const flowEdges = computed(() => {
  if (!currentFlowData.value?.transitions) return [];

  return currentFlowData.value.transitions.map(transition => ({
    id: transition.id,
    source: transition.source,
    target: transition.target,
    label: transition.label,
    type: 'smoothstep',
    markerEnd: {
      type: 'arrowclosed',
      width: 20,
      height: 20,
      color: '#6b7280'
    },
    style: {
      strokeWidth: 2,
      stroke: '#6b7280'
    },
    labelBgStyle: {
      fill: '#fff',
      stroke: '#d1d5db',
      strokeWidth: 1,
      rx: 4
    },
    labelStyle: {
      fill: '#111827',
      fontSize: 11,
      fontWeight: 500
    }
  }));
});

  // Calculs de progression
  const completedCount = computed(() =>
    flowNodes.value.filter(n => n.data.executionStatus === 'completed').length
  );
  
  const totalCount = computed(() => flowNodes.value.length);
  
  const progressPercentage = computed(() => {
    if (totalCount.value === 0) return 0;
    return Math.round((completedCount.value / totalCount.value) * 100);
  });
  

  
  // Styles des nœuds
  const getNodeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white ring-2 ring-green-200';
      case 'active':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white animate-pulse ring-2 ring-orange-200';
      case 'pending':
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white ring-2 ring-gray-200';
    }
  };
  
  // Icônes des nœuds
  const getNodeIcon = (status) => {
    switch (status) {
      case 'completed':
        return LucideCheck;
      case 'active':
        return LucidePlay;
      case 'pending':
      default:
        return LucideClock;
    }
  };
  
  // Fonctions de contrôle du flow
  const centerFlow = () => {
    fitView({ duration: 500, padding: 0.1 });
  };
  
  const zoomIn = () => {
  const currentZoom = vueFlowRef.value?.viewport?.zoom || 1;
  const newZoom = Math.min(currentZoom + 0.1, 1); 
  zoomTo(newZoom, { duration: 200 });
  zoomLevel.value = newZoom;
};

const zoomOut = () => {
  const currentZoom = vueFlowRef.value?.viewport?.zoom || 1;
  const newZoom = Math.max(currentZoom - 0.1, 0.1); 
  zoomTo(newZoom, { duration: 200 });
  zoomLevel.value = newZoom;
};

  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value;
  };
  
  const onNodesInitialized = () => {
  nextTick(() => {
    zoomLevel.value = vueFlowRef.value?.viewport?.zoom || 1;
  });
};

  
  // Capture d'écran avec html-to-image (comme Vue Flow)
  const takeScreenshot = async () => {
    if (!vueFlowRef.value?.$el) {
      toast.error('Impossible de capturer le flow');
      return;
    }

    isCapturing.value = true;
    
    try {
      const fileName = `flow-${props.contractName || 'contract'}-${Date.now()}`;
      
      // Utiliser toJpeg comme dans l'exemple Vue Flow
      const dataUrl = await toJpeg(vueFlowRef.value.$el, {
        quality: 0.95,
        backgroundColor: '#000',
        pixelRatio: 2,
        cacheBust: true
      });
      
      // Télécharger automatiquement
      const link = document.createElement('a');
      link.download = `${fileName}.jpg`;
      link.href = dataUrl;
      link.click();
      
      toast.success('Capture JPG réussie !');
      
    } catch (error) {
      console.error('Erreur capture JPG:', error);
      
      // Fallback en PNG
      try {
        const fileName = `flow-${props.contractName || 'contract'}-${Date.now()}`;
        
        const dataUrl = await toPng(vueFlowRef.value.$el, {
          backgroundColor: '#ffffff',
          pixelRatio: 2,
          cacheBust: true
        });
        
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = dataUrl;
        link.click();
        
        toast.success('Capture PNG réussie !');
        
      } catch (pngError) {
        console.error('Erreur capture PNG:', pngError);
        toast.error('Capture impossible');
      }
    } finally {
      isCapturing.value = false;
    }
  };
  
  // Auto-refresh
  const setupAutoRefresh = () => {
    clearAutoRefresh();
    
    if (autoRefreshInterval.value > 0) {
      nextRefreshIn.value = autoRefreshInterval.value;
      
      // Timer principal
      autoRefreshTimer.value = setInterval(() => {
        refreshStatus();
      }, autoRefreshInterval.value * 1000);
      
      // Countdown
      refreshCountdown.value = setInterval(() => {
        nextRefreshIn.value--;
        if (nextRefreshIn.value <= 0) {
          nextRefreshIn.value = autoRefreshInterval.value;
        }
      }, 1000);
    }
  };
  
  const clearAutoRefresh = () => {
    if (autoRefreshTimer.value) {
      clearInterval(autoRefreshTimer.value);
      autoRefreshTimer.value = null;
    }
    if (refreshCountdown.value) {
      clearInterval(refreshCountdown.value);
      refreshCountdown.value = null;
    }
  };
  
  // Refresh manuel
  const refreshStatus = async () => {
    if (!isOnline.value) {
      toast.error('Aucune connexion Internet');
      return;
    }
  
    isRefreshing.value = true;
    try {
      if (currentFlowData.value) {
        const updated = await updateFlowExecutionStatuses(
          props.contractId,
          currentFlowData.value
        );
        
        const oldCompleted = completedCount.value;
        currentFlowData.value = updated;
        const newCompleted = completedCount.value;
        
        if (newCompleted > oldCompleted) {
          const newlyCompleted = newCompleted - oldCompleted;
          toast.success(`${newlyCompleted} automate(s) terminé(s) !`);
        }
        
        lastUpdate.value = new Date();
      }
    } catch (error) {
      console.error('Erreur refresh:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      isRefreshing.value = false;
    }
  };
  
  // Export JSON
  const exportFlow = () => {
    const data = {
      flowData: currentFlowData.value,
      metadata: {
        contractName: props.contractName,
        contractId: props.contractId,
        exportDate: new Date().toISOString(),
        progress: {
          completed: completedCount.value,
          total: totalCount.value,
          percentage: progressPercentage.value
        }
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flow-${props.contractName || 'contract'}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Flow exporté en JSON !');
  };
  
  // Watchers
  watch(() => props.flowData, (newFlowData) => {
    if (newFlowData) {
      currentFlowData.value = newFlowData;
    }
  }, { immediate: true });
  
  watch(autoRefreshInterval, setupAutoRefresh);
  
  onMounted(() => {
    if (currentFlowData.value) {
      refreshStatus();
    }
  });
  
  onUnmounted(() => {
    clearAutoRefresh();
  });

  defineExpose({
    refreshStatus
  });

  </script>
  
  <style scoped>
  .flow-container {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    position: relative;
  }
  
  .dark .flow-container {
    border-color: #374151;
  }
  
  :deep(.vue-flow__node) {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
  }
  
  :deep(.vue-flow__edge-path) {
    stroke: #6b7280;
    stroke-width: 2;
  }
  
  :deep(.vue-flow__edge-label) {
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 500;
  }
  
  :deep(.vue-flow__controls) {
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
  }
  
  :deep(.vue-flow__controls button) {
    background: white;
    border: none;
    color: #6b7280;
  }
  
  :deep(.vue-flow__controls button:hover) {
    background: #f3f4f6;
  }
  
  .dark :deep(.vue-flow__edge-label) {
    background: #374151;
    border-color: #4b5563;
    color: white;
  }
  
  .dark :deep(.vue-flow__controls) {
    background: #374151;
    border-color: #4b5563;
  }
  
  .dark :deep(.vue-flow__controls button) {
    background: #374151;
    color: #d1d5db;
  }
  
  .dark :deep(.vue-flow__controls button:hover) {
    background: #4b5563;
  }
  
  /* Animations personnalisées */
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .slide-in {
    animation: slideIn 0.3s ease-out;
  }
  </style>