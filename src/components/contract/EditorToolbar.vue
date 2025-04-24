<template>
    <div class="editor-toolbar flex flex-wrap bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-2">
      <!-- Outils de zoom -->
      <div class="toolbar-group flex items-center mr-4">
        <button 
          @click="$emit('zoom-in')"
          class="toolbar-button p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Zoom +"
        >
          <LucideZoomIn class="w-4 h-4" />
        </button>
        
        <div class="px-2 text-xs text-gray-600 dark:text-gray-400">
          {{ Math.round(zoomLevel * 100) }}%
        </div>
        
        <button 
          @click="$emit('zoom-out')"
          class="toolbar-button p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Zoom -"
        >
          <LucideZoomOut class="w-4 h-4" />
        </button>
        
        <button 
          @click="$emit('zoom-reset')"
          class="toolbar-button p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ml-1"
          title="Réinitialiser le zoom"
        >
          <LucideMaximize2 class="w-4 h-4" />
        </button>
      </div>
      
      <div class="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
      
      <!-- Outils de navigation -->
      <div class="toolbar-group flex items-center mr-4">
        <button 
          @click="$emit('center-graph')"
          class="toolbar-button p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Centrer le graphe"
        >
          <LucideCrosshair class="w-4 h-4" />
        </button>
        
        <button 
          @click="$emit('toggle-minimap')"
          class="toolbar-button p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ml-1"
          :class="{
  'bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-200': showMinimap
}"

          title="Afficher/masquer la minimap"
        >
          <LucideMap class="w-4 h-4" />
        </button>
        
        <button 
          @click="$emit('toggle-grid')"
          class="toolbar-button p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ml-1"
          :class="{
  'bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-200': snapToGrid
}"
          title="Activer/désactiver la grille"
        >
          <LucideGrid class="w-4 h-4" />
        </button>
      </div>
      
      <div class="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
      
      <!-- Outils d'édition -->
      <div class="toolbar-group flex items-center mr-4">
        <button 
          @click="$emit('add-initial-state')"
          class="toolbar-button p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-green-600 dark:text-green-400"
          title="Ajouter un état initial"
        >
          <div class="flex items-center">
            <LucideCirclePlus class="w-4 h-4" />
            <span class="ml-1 text-xs">Initial</span>
          </div>
        </button>
        
        <button 
          @click="$emit('add-state')"
          class="toolbar-button p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ml-1"
          title="Ajouter un état"
        >
          <div class="flex items-center">
            <LucideCirclePlus class="w-4 h-4" />
            <span class="ml-1 text-xs">État</span>
          </div>
        </button>
        
        <button 
          @click="$emit('add-final-state')"
          class="toolbar-button p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 ml-1"
          title="Ajouter un état final"
        >
          <div class="flex items-center">
            <LucideCirclePlus class="w-4 h-4" />
            <span class="ml-1 text-xs">Final</span>
          </div>
        </button>
      </div>
      
      <div class="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
      
      <!-- Modes -->
      <div class="toolbar-group flex items-center">
        <button 
          @click="$emit('toggle-edit-mode')"
          class="toolbar-button p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          :class="{
  'bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-200': !isSimulating
}"
          title="Mode édition"
        >
          <LucidePencil class="w-4 h-4" />
        </button>
        
        <button 
          @click="$emit('toggle-simulation')"
          class="toolbar-button p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ml-1"
          :class="{
  'bg-yellow-100 dark:bg-yellow-500/30 text-yellow-700 dark:text-yellow-100': isSimulating
}"
          title="Mode simulation"
        >
          <LucidePresentation class="w-4 h-4" />
        </button>
        
        <button 
          @click="$emit('toggle-fullscreen')"
          class="toolbar-button p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ml-1"
          :class="{
  'bg-purple-100 dark:bg-purple-500/30 text-purple-700 dark:text-purple-100': isFullScreen
}"
          title="Plein écran"
        >
          <LucideMaximize v-if="!isFullScreen" class="w-4 h-4" />
          <LucideMinimize v-else class="w-4 h-4" />
        </button>

<button
  @click="$emit('toggle-conditions')" 
  :title="showConditions ? 'Masquer les conditions' : 'Afficher les conditions'"
  class="p-2 rounded-md transition-all duration-200 relative group flex items-center justify-center"
  :class="showConditions 
    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40' 
    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'"
>
  <div class="relative">
    <Eye v-if="showConditions" class="w-4 h-4" />
    <EyeOff v-else class="w-4 h-4" />
    
  </div>
  <span 
    class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs font-medium text-white bg-gray-800 dark:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
  >
    {{ showConditions ? 'Masquer les conditions' : 'Afficher les conditions' }}
  </span>
</button>


      </div>
      
      <!-- Boutons d'annulation / refaire -->
      <div class="ml-auto flex items-center">
        <button 
          @click="$emit('undo')"
          :disabled="!canUndo"
          class="toolbar-button p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Annuler"
        >
          <LucideUndo2 class="w-4 h-4" />
        </button>
        
        <button 
          @click="$emit('redo')"
          :disabled="!canRedo"
          class="toolbar-button p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ml-1 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Rétablir"
        >
          <LucideRedo2 class="w-4 h-4" />
        </button>


      </div>
    </div>
  </template>
  
  <script setup>
  import {
    LucideZoomIn,
    LucideZoomOut,
    LucideMaximize2,
    LucideCrosshair,
    LucideMap,
    LucideGrid,
    LucideCirclePlus,
    LucidePencil,
    LucidePresentation,
    LucideMaximize,
    LucideMinimize,
    LucideUndo2,
    LucideRedo2,
    Eye,
    EyeOff,
    LucideList
  } from 'lucide-vue-next';
  
  defineProps({
    zoomLevel: {
      type: Number,
      default: 1
    },
    showMinimap: {
      type: Boolean,
      default: true
    },
    snapToGrid: {
      type: Boolean,
      default: true
    },
    isSimulating: {
      type: Boolean,
      default: false
    },
    isFullScreen: {
      type: Boolean,
      default: false
    },
    canUndo: {
      type: Boolean,
      default: false
    },
    canRedo: {
      type: Boolean,
      default: false
    },
    showConditions: {
    type: Boolean,
    default: true
  }
  });
  
  defineEmits([
    'zoom-in',
    'zoom-out',
    'zoom-reset',
    'center-graph',
    'toggle-minimap',
    'toggle-grid',
    'add-initial-state',
    'add-state',
    'add-final-state',
    'toggle-edit-mode',
    'toggle-simulation',
    'toggle-fullscreen',
    'undo',
    'redo',
    'toggle-conditions'

  ]);
  </script>