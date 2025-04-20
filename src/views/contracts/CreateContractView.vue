<template>
  <div class="h-full flex flex-col">
    <!-- En-tête avec nom du contrat et boutons d'action -->
    <div v-if="!isFullScreen" class="flex items-center justify-between mb-6 px-1">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ contractName.trim() || 'Nouveau contrat' }}
        </h1>
        <!-- Indicateur de statut -->
        <span 
          :class="[
            'px-2 py-0.5 text-xs font-medium rounded-full', 
            contractStatus === 'Brouillon' 
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          ]"
        >
          {{ contractStatus }}
        </span>
        <!-- Indicateur de sauvegarde -->
        <span v-if="isSaved" class="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <LucideCheck class="w-3 h-3 mr-1 text-green-500" />
          Modifications enregistrées
        </span>
        <span v-else class="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <LucideLoader class="w-3 h-3 mr-1 animate-spin" />
          Non enregistré
        </span>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- Boutons d'historique -->
        <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button 
            @click="historyManager.undo" 
            :disabled="!historyManager.canUndo"
            class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Annuler"
          >
            <LucideUndo2 class="w-4 h-4" />
          </button>
          <button 
            @click="historyManager.redo" 
            :disabled="!historyManager.canRedo"
            class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Rétablir"
          >
            <LucideRedo2 class="w-4 h-4" />
          </button>
        </div>
        
        <!-- Boutons principaux -->
        <button 
          @click="contractActions.saveContract"
          :disabled="!contractName.trim() || contractActions.isSaving"
          class="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition duration-200
                 text-white
                 bg-blue-600 hover:bg-blue-700
                 disabled:bg-gray-400 disabled:cursor-not-allowed
                 dark:disabled:bg-gray-700"
        >
          <LucideSave v-if="!contractActions.isSaving" class="h-4 w-4" />
          <LucideLoader v-else class="h-4 w-4 animate-spin" />
          <span>Sauvegarder</span>
        </button>
        
        <button 
          @click="contractActions.deployContract"
          :disabled="validation.hasValidationErrors || contractStatus === 'Actif'"
          class="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition duration-200
                 text-white
                 bg-green-600 hover:bg-green-700
                 disabled:bg-gray-400 disabled:cursor-not-allowed
                 dark:disabled:bg-gray-700"
        >
          <LucideRocket class="h-4 w-4" />
          <span>Déployer</span>
        </button>
      </div>
    </div>
      
    <!-- Champ pour le nom du contrat -->
    <div v-if="!isFullScreen" class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex-grow">
          <label for="contract-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom du contrat
          </label>
          <input 
            id="contract-name"
            type="text" 
            v-model="contractName"
            placeholder="Saisir le nom du contrat..." 
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
          />
        </div>
      </div>
    </div>

    <!-- Contenu principal avec mise en page responsive -->
    <div 
      :class="[
        'grid gap-6 h-[calc(100vh-230px)] transition-all duration-300',
        isFullScreen 
          ? 'grid-cols-1 xl:grid-cols-[1fr_320px]' 
          : 'grid-cols-1 xl:grid-cols-[320px_1fr_320px]'
      ]"
    >
      <!-- Colonne gauche : Liste des automates (collapsible sur mobile) -->
      <div :class="[
        'xl:h-full flex flex-col transition-all duration-300',
        isFullScreen ? 'hidden' : ''
      ]">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Automates</h2>
          <!-- Bouton pour masquer/afficher sur mobile -->
          <button 
            @click="editorControls.toggleLeftPanel" 
            class="xl:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LucideChevronsDown v-if="editorControls.showLeftPanel" class="w-5 h-5" />
            <LucideChevronsRight v-else class="w-5 h-5" />
          </button>
        </div>
        
        <div v-show="editorControls.showLeftPanel || editorControls.isDesktop" class="flex-grow overflow-hidden">
          <AutomateList 
            :automates="contractAutomates"
            :activeAutomate="activeAutomateId"
            @select-automate="automateManager.selectAutomate"
            @add-automate="automateManager.addAutomate"
            @edit-automate="automateManager.editAutomate"
            @remove-automate="automateManager.removeAutomate"
          />
        </div>
      </div>

      <!-- Colonne centrale : Éditeur d'automate avec contrôles améliorés -->
      <div class="xl:h-full flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            Éditeur<span v-if="automateManager.activeAutomateName"> : {{ automateManager.activeAutomateName }}</span>
          </h2>
        </div>
        
        <!-- Barre d'outils de l'éditeur -->
        <EditorToolbar 
          v-if="activeAutomateId"
          :zoom-level="editorControls.zoomLevel"
          :show-minimap="editorControls.showMinimap"
          :snap-to-grid="editorControls.snapToGrid"
          :is-simulating="simulation.isSimulating"
          :is-full-screen="isFullScreen"
          :can-undo="historyManager.canUndo"
          :can-redo="historyManager.canRedo"
          @zoom-in="editorControls.zoomIn"
          @zoom-out="editorControls.zoomOut"
          @zoom-reset="editorControls.resetZoom"
          @center-graph="editorControls.centerGraph"
          @toggle-minimap="editorControls.toggleMinimap"
          @toggle-grid="editorControls.toggleGrid"
          @add-initial-state="stateManager.addInitialState"
          @add-state="stateManager.addStandardState"
          @add-final-state="stateManager.addFinalState"
          @toggle-edit-mode="simulation.isSimulating ? simulation.toggleSimulation() : null"
          @toggle-simulation="simulation.toggleSimulation"
          @toggle-fullscreen="toggleFullScreen"
          @undo="historyManager.undo"
          @redo="historyManager.redo"
        />
        
        <div 
          :class="[
            'flex-grow bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-inner relative transition-all', 
            isFullScreen ? 'fixed inset-4 z-50' : 'h-full'
          ]"
        >
          <!-- Message si aucun automate n'est sélectionné -->
          <div v-if="!activeAutomateId" class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div class="text-center p-8">
              <LucideFileWarning class="w-12 h-12 mx-auto mb-4" />
              <p>Aucun automate sélectionné.</p>
              <p class="mt-2">Veuillez créer ou sélectionner un automate dans la liste.</p>
            </div>
          </div>
          
          <!-- Éditeur VueFlow avec menu contextuel intégré -->
          <VueFlow 
            v-if="activeAutomateId"
            v-model:nodes="currentNodes" 
            v-model:edges="currentEdges"
            class="h-full w-full"
            @connect="transitionManager.handleConnectNodes"
            @edgeUpdate="transitionManager.handleEdgeUpdate"
            @edgeClick="transitionManager.onEdgeClick"
            @nodeContextMenu="stateManager.onNodeRightClick"
            @edgeContextMenu="transitionManager.onEdgeContextMenu"
            :snapToGrid="editorControls.snapToGrid"
            :snapGrid="[15, 15]"
            :disabled="simulation.isSimulating"
          >
            <MiniMap v-if="editorControls.showMinimap" pannable zoomable position="top-right" />
            <Background :pattern-color="isDarkMode ? '#374151' : '#E5E7EB'" :gap="15" size="1" />
            
            <!-- Indication mode simulation -->
            <template v-if="simulation.isSimulating" #node-default="props">
              <div
                @click="simulation.simulateTransition(props.node)"
                :class="[
                  'p-2 rounded-md min-w-[100px] text-center',
                  simulation.simulationCurrentState === props.node.id ? 'ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 font-bold' : '',
                  simulation.simulationVisitedStates.includes(props.node.id) ? 'bg-green-50 dark:bg-green-900/30' : ''
                ]"
              >
                {{ props.node.data.label }}
              </div>
            </template>
          </VueFlow>

          <!-- Menu contextuel pour le clic droit sur un nœud -->
          <div
            v-if="stateManager.contextMenu.visible"
            :style="{ top: `${stateManager.contextMenu.y}px`, left: `${stateManager.contextMenu.x}px` }"
            class="fixed z-50 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 rounded-lg text-sm overflow-hidden min-w-[180px]"
          >
            <div class="py-2 px-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-200">
              {{ stateManager.getNodeLabelById(stateManager.contextMenu.targetId) }}
            </div>
            <div class="py-1">
              <button 
                @click="stateManager.editStateFromContext"
                class="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <LucidePencil class="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" />
                Modifier
              </button>
              <button 
                @click="stateManager.selectStateFromContext"
                class="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <LucideCheckSquare class="w-4 h-4 mr-3 text-indigo-600 dark:text-indigo-400" />
                {{ activeStateId === stateManager.contextMenu.targetId ? 'Désélectionner' : 'Sélectionner' }}
              </button>
              <div class="border-t border-gray-200 dark:border-gray-600 my-1"></div>
              <button 
                @click="stateManager.deleteStateFromContext"
                class="flex items-center w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LucideTrash2 class="w-4 h-4 mr-3" />
                Supprimer
              </button>
            </div>
          </div>
                    
          <!-- Menu contextuel pour le clic droit sur une transition -->
          <div
            v-if="transitionManager.edgeContextMenu.visible"
            :style="{ top: `${transitionManager.edgeContextMenu.y}px`, left: `${transitionManager.edgeContextMenu.x}px` }"
            class="fixed z-50 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 rounded-lg text-sm overflow-hidden min-w-[180px]"
          >
            <div class="py-2 px-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-200">
              {{ transitionManager.getEdgeLabelById(transitionManager.edgeContextMenu.targetId) }}
            </div>
            <div class="py-1">
              <button 
                @click="transitionManager.editTransitionFromContext"
                class="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <LucidePencil class="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" />
                Modifier
              </button>
              
              <button 
                @click="transitionManager.selectTransitionFromContext"
                class="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <LucideCheckSquare class="w-4 h-4 mr-3 text-indigo-600 dark:text-indigo-400" />
                {{ activeTransitionId === transitionManager.edgeContextMenu.targetId ? 'Désélectionner' : 'Sélectionner' }}
              </button>
              
              <button 
                @click="transitionManager.invertTransitionFromContext"
                class="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300"
              >
                <LucideArrowDownUp class="w-4 h-4 mr-3 text-green-600 dark:text-green-400" />
                Inverser
              </button>
              
              <div class="border-t border-gray-200 dark:border-gray-600 my-1"></div>
              
              <button 
                @click="transitionManager.deleteTransitionFromContext"
                class="flex items-center w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LucideTrash2 class="w-4 h-4 mr-3" />
                Supprimer
              </button>
            </div>
          </div>

          <!-- Barre d'état avec les erreurs -->
          <div v-if="validation.hasValidationErrors" class="absolute bottom-0 left-0 right-0 bg-yellow-50 dark:bg-yellow-900/20 p-2 border-t border-yellow-200 dark:border-yellow-700">
            <div class="flex items-center text-sm text-yellow-800 dark:text-yellow-300">
              <LucideAlertTriangle class="w-4 h-4 mr-2" />
              <span>{{ validation.validationErrorMessage }}</span>
            </div>
          </div>
               
          <!-- Bouton déployer (uniquement visible quand pas en plein écran) -->
          <button
            v-if="!isFullScreen && activeAutomateId && !simulation.isSimulating"
            @click="contractActions.deployContract"
            :disabled="validation.hasValidationErrors || contractStatus === 'Actif'"
            class="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-full font-medium flex items-center shadow-lg"
          >
            <LucideRocket class="w-4 h-4" />
            <span class="ml-2">Déployer</span>
          </button>
          
          <!-- Boutons de la simulation -->
          <div v-if="simulation.isSimulating" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-700 rounded-full shadow-lg p-1 flex items-center">
            <button 
              @click="simulation.resetSimulation" 
              class="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
              title="Réinitialiser"
            >
              <LucideRefreshCcw class="w-4 h-4" />
            </button>
            <span class="px-3 text-sm text-gray-600 dark:text-gray-300">Cliquez sur les états pour simuler le flux</span>
            <button 
              @click="simulation.toggleSimulation" 
              class="p-2 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
              title="Quitter la simulation"
            >
              <LucideX class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Colonne droite : onglets pour États, Fonctions et Aide -->
      <div class="xl:h-full flex flex-col" v-if="activeAutomateId">
        <div class="flex border-b border-gray-200 dark:border-gray-700 mb-2">
          <button 
            @click="editorControls.setRightPanelTab('states')" 
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none"
            :class="editorControls.rightPanelTab === 'states' 
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'"
          >
            États
          </button>
          <button 
            @click="editorControls.setRightPanelTab('functions')" 
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none"
            :class="editorControls.rightPanelTab === 'functions' 
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'"
          >
            Fonctions
          </button>
          <button 
            @click="editorControls.setRightPanelTab('analyzer')" 
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none"
            :class="editorControls.rightPanelTab === 'analyzer' 
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'"
          >
            Analyse
          </button>
        </div>
        
        <!-- Contenu des onglets -->
        <div class="flex-grow overflow-hidden">
          <!-- Onglet États -->
          <div v-if="editorControls.rightPanelTab === 'states'" class="h-full">
            <StateList