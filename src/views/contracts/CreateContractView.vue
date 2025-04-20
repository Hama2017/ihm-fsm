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
            Éditeur<span v-if="automateManager.activeAutomateName()"> : {{ automateManager.activeAutomateName() }}</span>
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
              v-model:nodes="currentNodes"
              :edges="currentEdges"
              :selectedState="activeStateId"
              @add-state="stateManager.openAddStateModal"
              @edit-state="stateManager.openEditStateModal"
              @remove-state="stateManager.openRemoveStateModal"
              @select-state="stateManager.selectState"
              @open-add-modal="stateManager.openAddStateModal"
              @open-edit-modal="stateManager.openEditStateModal"
              @open-remove-modal="stateManager.openRemoveStateModal"
            />
          </div>
          
          <!-- Onglet Fonctions -->
          <div v-if="editorControls.rightPanelTab === 'functions'" class="h-full">
            <FunctionList
              :edges="currentEdges"
              :nodes="currentNodes"
              :availableFunctions="availableFunctions"
              :activeTransition="activeTransitionId"
              @select-transition="transitionManager.selectTransition"
              @add-transition="transitionManager.addTransition"
              @edit-transition="transitionManager.editTransition"
              @remove-transition="transitionManager.removeTransition"
              @reverse-transition="transitionManager.invertTransition"
            />
          </div>
          
          <!-- Onglet Analyse -->
          <div v-if="editorControls.rightPanelTab === 'analyzer'" class="h-full">
            <AutomatonAnalyzer
              :nodes="currentNodes"
              :edges="currentEdges"
              :validationErrors="validation.validationErrors"
              :cyclePath="validation.cyclePath"
              @analyze="validation.validateAutomate"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modals -->
    <!-- Modal pour la simulation -->
    <Modal
      v-model="simulation.showSimulationModal"
      title="Simulation de l'automate"
      confirm-text="Lancer la simulation"
      @confirm="simulation.launchSimulation"
    >
      <p class="text-gray-700 dark:text-gray-300">
        Voulez-vous lancer la simulation de déploiement de cet automate ?
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Cette simulation vous permettra de visualiser l'ordre de déploiement des états selon leur dépendance.
      </p>
    </Modal>
    
    <!-- Modal récapitulatif de déploiement -->
    <DeploymentSummaryPanel
      v-if="simulation.showDeploymentSummaryModal"
      :deployedOrder="simulation.deploymentResult"
      :nodes="currentNodes"
      @close="simulation.closeDeploymentSummaryModal"
    />
    
    <!-- Modal d'ajout d'état -->
    <Modal
      v-model="stateManager.showAddStateModal"
      title="Ajouter un état"
      confirm-text="Ajouter"
      @confirm="stateManager.confirmAddState"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'état</label>
          <input
            type="text"
            v-model="stateManager.newStateName"
            placeholder="Saisir le nom de l'état..."
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'état</label>
          <select
            v-model="stateManager.newStateType"
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="standard">État standard</option>
            <option value="initial">État initial</option>
            <option value="final">État final</option>
          </select>
        </div>
        
        <p v-if="stateManager.addStateError" class="text-sm text-red-600 dark:text-red-400 mt-2">
          {{ stateManager.addStateError }}
        </p>
      </div>
    </Modal>
    
    <!-- Modal d'édition d'état -->
    <Modal
      v-model="stateManager.showEditStateModal"
      title="Modifier l'état"
      confirm-text="Enregistrer"
      @confirm="stateManager.confirmEditState"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'état</label>
          <input
            type="text"
            v-model="stateManager.editStateName"
            placeholder="Saisir le nom de l'état..."
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <p v-if="stateManager.editStateError" class="text-sm text-red-600 dark:text-red-400 mt-2">
          {{ stateManager.editStateError }}
        </p>
      </div>
    </Modal>
    
    <!-- Modal de suppression d'état -->
    <Modal
      v-model="stateManager.showRemoveStateModal"
      title="Supprimer l'état ?"
      confirm-text="Supprimer"
      variant="danger"
      @confirm="stateManager.confirmRemoveState"
    >
      <p class="text-gray-700 dark:text-gray-300">
        Êtes-vous sûr de vouloir supprimer cet état ?
      </p>
      <div v-if="stateManager.stateUsedInEdges" class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm rounded-md">
        <p class="flex items-center">
          <LucideAlertTriangle class="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Attention : Cet état est utilisé dans des transitions. Les supprimer également ?</span>
        </p>
      </div>
    </Modal>
    
    <!-- Modal de suppression de transition -->
    <Modal
      v-model="transitionManager.showRemoveTransitionModal"
      title="Supprimer la transition ?"
      confirm-text="Supprimer"
      variant="danger"
      @confirm="transitionManager.confirmRemoveTransition"
    >
      <p class="text-gray-700 dark:text-gray-300">
        Êtes-vous sûr de vouloir supprimer cette transition ? Cette action est irréversible.
      </p>
    </Modal>
    
    <!-- Modal d'inversion de transition -->
    <Modal
      v-model="transitionManager.showInvertTransitionModal"
      title="Inverser la transition"
      confirm-text="Inverser"
      variant="warning"
      @confirm="transitionManager.confirmInvertTransition"
    >
      <div class="space-y-4">
        <p class="text-gray-700 dark:text-gray-300">
          Voulez-vous inverser le sens de la transition ?
        </p>
        <div class="flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
          <span class="font-medium text-gray-700 dark:text-gray-300">{{ getNodeName(transitionManager.invertingTransition.source) }}</span>
          <LucideArrowRight class="mx-2 text-blue-500" />
          <span class="font-medium text-gray-700 dark:text-gray-300">{{ getNodeName(transitionManager.invertingTransition.target) }}</span>
        </div>
        <div class="flex items-center justify-center">
          <LucideArrowDown class="my-2 text-yellow-500" />
        </div>
        <div class="flex items-center justify-center space-x-2 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <span class="font-medium text-gray-700 dark:text-gray-300">{{ getNodeName(transitionManager.invertingTransition.target) }}</span>
          <LucideArrowRight class="mx-2 text-blue-500" />
          <span class="font-medium text-gray-700 dark:text-gray-300">{{ getNodeName(transitionManager.invertingTransition.source) }}</span>
        </div>
      </div>
    </Modal>
    
    <!-- Modal de mise à jour des connexions -->
    <Modal
      v-model="transitionManager.showEdgeUpdateModal"
      title="Modifier la transition"
      @confirm="transitionManager.confirmEdgeUpdate"
    >
      <div class="space-y-3">
        <div class="flex items-center">
          <span class="font-medium w-32 text-gray-700 dark:text-gray-300">Nouvelle origine:</span>
          <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
            {{ transitionManager.edgeUpdateSourceName }}
          </span>
        </div>
        <div class="flex items-center">
          <span class="font-medium w-32 text-gray-700 dark:text-gray-300">Nouvelle destination:</span>
          <span class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
            {{ transitionManager.edgeUpdateTargetName }}
          </span>
        </div>
      </div>
    </Modal>
    
    <!-- Modal de gestion des automates -->
    <Modal
      v-model="automateManager.showAutomateModal"
      title="Gestion de l'automate"
      confirm-text="Enregistrer"
      @confirm="automateManager.confirmAutomateEdit"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nom de l'automate
          </label>
          <input
            type="text"
            v-model="automateManager.editingAutomateName"
            placeholder="Saisir le nom de l'automate..."
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <p v-if="automateManager.automateModalError" class="text-sm text-red-600 dark:text-red-400 mt-2">
          {{ automateManager.automateModalError }}
        </p>
      </div>
    </Modal>
    
    <!-- Modal d'ajout de transition -->
    <Modal
      v-model="transitionManager.showAddTransitionModal"
      title="Ajouter une transition"
      confirm-text="Ajouter"
      @confirm="transitionManager.confirmAddTransition"
    >
      <div class="space-y-4">
        <!-- Source -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            État source
          </label>
          <select 
            v-model="transitionManager.editingTransition.source"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Sélectionner un état source</option>
            <option v-for="node in currentNodes" :key="node.id" :value="node.id">
              {{ node.data.label }}
            </option>
          </select>
        </div>
        
        <!-- Destination -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            État destination
          </label>
          <select 
            v-model="transitionManager.editingTransition.target"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Sélectionner un état destination</option>
            <option v-for="node in currentNodes" :key="node.id" :value="node.id">
              {{ node.data.label }}
            </option>
          </select>
        </div>
        
        <!-- Fonction -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fonction
          </label>
          <select 
            v-model="transitionManager.editingTransition.function"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Sélectionner une fonction</option>
            <option v-for="func in availableFunctions" :key="func.value" :value="func.value">
              {{ func.label }}
            </option>
          </select>
        </div>
        
        <p v-if="transitionManager.editTransitionError" class="text-sm text-red-600 dark:text-red-400 mt-2">
          {{ transitionManager.editTransitionError }}
        </p>
      </div>
    </Modal>
    
    <!-- Modal d'édition de transition -->
    <Modal
      v-model="transitionManager.showEditTransitionModal"
      title="Modifier la transition"
      confirm-text="Enregistrer"
      @confirm="transitionManager.confirmEditTransition"
    >
      <div class="space-y-4">
        <!-- Source -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            État source
          </label>
          <select 
            v-model="transitionManager.editingTransition.source"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option v-for="node in currentNodes" :key="node.id" :value="node.id">
              {{ node.data.label }}
            </option>
          </select>
        </div>
        
        <!-- Destination -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            État destination
          </label>
          <select 
            v-model="transitionManager.editingTransition.target"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option v-for="node in currentNodes" :key="node.id" :value="node.id">
              {{ node.data.label }}
            </option>
          </select>
        </div>
        
        <!-- Fonction -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fonction
          </label>
          <select 
            v-model="transitionManager.editingTransition.function"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Sélectionner une fonction</option>
            <option v-for="func in availableFunctions" :key="func.value" :value="func.value">
              {{ func.label }}
            </option>
          </select>
        </div>
        
        <p v-if="transitionManager.editTransitionError" class="text-sm text-red-600 dark:text-red-400 mt-2">
          {{ transitionManager.editTransitionError }}
        </p>
      </div>
    </Modal>
    
    <!-- Modal d'édition de transition -->
    <Modal
      v-model="transitionManager.showEditTransitionModal"
      title="Modifier la transition"
      confirm-text="Enregistrer"
      @confirm="transitionManager.confirmEditTransition"
    >
      <div class="space-y-4">
        <!-- Source -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            État source
          </label>
          <select 
            v-model="transitionManager.editingTransition.source"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option v-for="node in currentNodes" :key="node.id" :value="node.id">
              {{ node.data.label }}
            </option>
          </select>
        </div>
        
        <!-- Destination -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            État destination
          </label>
          <select 
            v-model="transitionManager.editingTransition.target"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option v-for="node in currentNodes" :key="node.id" :value="node.id">
              {{ node.data.label }}
            </option>
          </select>
        </div>
        
        <!-- Fonction -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fonction
          </label>
          <select 
            v-model="transitionManager.editingTransition.function"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option v-for="func in availableFunctions" :key="func.value" :value="func.value">
              {{ func.label }}
            </option>
          </select>
        </div>
        
        <p v-if="transitionManager.editTransitionError" class="text-sm text-red-600 dark:text-red-400 mt-2">
          {{ transitionManager.editTransitionError }}
        </p>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { VueFlow, useVueFlow, MarkerType } from '@vue-flow/core';
import { useThemeStore } from '@/stores/theme';
import { useContractStore } from '@/stores/contractStore';

import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';


// Composants
import Modal from '@/components/ui/UiModal.vue';
import TransitionModal from '@/components/ui/UiTransitionModal.vue';
import AutomateList from '@/components/fsm/AutomateList.vue';
import StateList from '@/components/fsm/StateList.vue';
import FunctionList from '@/components/fsm/FunctionList.vue';
import EditorToolbar from '@/components/contract/EditorToolbar.vue';
import AutomatonAnalyzer from '@/components/contract/AutomatonAnalyzer.vue';
import DeploymentSummaryPanel from '@/components/contract/DeploymentSummaryPanel.vue';

// Icônes
import {
  LucideUndo2,
  LucideRedo2,
  LucideSave,
  LucideLoader,
  LucideRocket,
  LucideFileWarning,
  LucidePencil,
  LucideTrash2,
  LucideCheckSquare,
  LucideAlertTriangle,
  LucideRefreshCcw,
  LucideX,
  LucideCheck,
  LucideArrowDownUp,
  LucideArrowRight,
  LucideArrowDown,
  LucideChevronsDown,
  LucideChevronsRight
} from 'lucide-vue-next';

// Composables
import useNodeStyles from '@/composables/contract/useNodeStyles';
import useStateManagement from '@/composables/contract/useStateManagement';
import useTransitionManagement from '@/composables/contract/useTransitionManagement';
import useAutomateManagement from '@/composables/contract/useAutomateManagement';
import useHistoryManager from '@/composables/contract/useHistoryManager';
import useEditorControls from '@/composables/contract/useEditorControls';
import useSimulation from '@/composables/contract/useSimulation';
import useValidation from '@/composables/contract/useValidation';
import useContractActions from '@/composables/contract/useContractActions';

// Router
const router = useRouter();

// Theme
const themeStore = useThemeStore();
const { darkMode } = storeToRefs(themeStore);
const isDarkMode = darkMode;

// Contract Store
const contractStore = useContractStore();

// État du contrat
const contractName = ref('');
const contractStatus = ref('Brouillon');
const isSaved = ref(false);
const contractAutomates = ref([
  {
    id: '01',
    name: 'Processus d\'approbation',
    states: [
      { 
        id: 'state-1', 
        label: 'Soumission', 
        position: { x: 100, y: 150 },
        type: 'initial'
      },
      { 
        id: 'state-2', 
        label: 'Validation', 
        position: { x: 300, y: 150 },
        type: 'standard'
      },
      { 
        id: 'state-3', 
        label: 'Approuvé', 
        position: { x: 500, y: 100 },
        type: 'final'
      },
      { 
        id: 'state-4', 
        label: 'Rejeté', 
        position: { x: 500, y: 200 },
        type: 'final'
      }
    ],
    transitions: [
      { 
        id: 'edge-1', 
        source: 'state-1', 
        target: 'state-2', 
        label: 'valider', 
        markerEnd: MarkerType.ArrowClosed
      },
      { 
        id: 'edge-2', 
        source: 'state-2', 
        target: 'state-3', 
        label: 'approuver', 
        markerEnd: MarkerType.ArrowClosed
      },
      { 
        id: 'edge-3', 
        source: 'state-2', 
        target: 'state-4', 
        label: 'rejeter', 
        markerEnd: MarkerType.ArrowClosed
      }
    ]
  }
]);
const activeAutomateId = ref('01');
const currentNodes = ref([]);
const currentEdges = ref([]);
const activeStateId = ref(null);
const activeTransitionId = ref(null);
const isFullScreen = ref(false);

// Liste des fonctions disponibles (transitions)
const availableFunctions = ref([
  { value: 'valider', label: 'Valider' },
  { value: 'refuser', label: 'Refuser' },
  { value: 'reporter', label: 'Reporter' },
  { value: 'annuler', label: 'Annuler' },
  { value: 'terminer', label: 'Terminer' },
  { value: 'suspendre', label: 'Suspendre' },
  { value: 'reprendre', label: 'Reprendre' },
  { value: 'commenter', label: 'Commenter' },
  { value: 'approuver', label: 'Approuver' },
  { value: 'rejeter', label: 'Rejeter' }
]);

// Initialisation des composables
// 1. Styles des noeuds et arêtes
const nodeStyles = useNodeStyles({ isDarkMode });

// 2. Historique des actions
const historyManager = useHistoryManager({
  nodes: currentNodes,
  edges: currentEdges,
  activeStateId,
  activeTransitionId,
  updateNodeStyles: nodeStyles.updateNodeStyles,
  updateEdgeStyles: nodeStyles.updateEdgeStyles
});

// 3. Validation de l'automate
const validation = useValidation({
  currentNodes,
  currentEdges
});

// 4. Gestion des états
const stateManager = useStateManagement({
  nodes: currentNodes,
  edges: currentEdges,
  activeStateId,
  saveToHistory: historyManager.saveToHistory,
  validateAutomate: validation.validateAutomate,
  getBaseNodeStyle: nodeStyles.getBaseNodeStyle,
  getSelectedNodeStyle: nodeStyles.getSelectedNodeStyle,
  getNodeConfig: getNodeConfig
});

// 5. Gestion des transitions
const transitionManager = useTransitionManagement({
  nodes: currentNodes,
  edges: currentEdges,
  activeTransitionId,
  saveToHistory: historyManager.saveToHistory,
  validateAutomate: validation.validateAutomate,
  detectCycle: validation.detectCycle,
  getBaseEdgeStyle: nodeStyles.getBaseEdgeStyle,
  getSelectedEdgeStyle: nodeStyles.getSelectedEdgeStyle
});

// 6. Contrôles de l'éditeur
const editorControls = useEditorControls();

// 7. Simulation de l'automate
const simulation = useSimulation(
  currentNodes, 
  currentEdges, 
  nodeStyles.getBaseEdgeStyle,
  stateManager.updateNodeStyles
);

// 8. Actions du contrat
const contractActions = useContractActions({
  contractName,
  contractStatus,
  contractAutomates,
  activeAutomateId,
  isSaved,
  hasValidationErrors: validation.hasValidationErrors,
  saveCurrentAutomateState: saveCurrentAutomateState,
  validateAutomate: validation.validateAutomate
});

// 9. Gestion des automates
const automateManager = useAutomateManagement({
  contractAutomates,
  activeAutomateId,
  currentNodes,
  currentEdges,
  activeStateId,
  activeTransitionId,
  historyStack: historyManager.historyStack,
  historyIndex: historyManager.historyIndex,
  canUndo: historyManager.canUndo,
  canRedo: historyManager.canRedo,
  updateNodeStyles: stateManager.updateNodeStyles,
  updateEdgeStyles: transitionManager.updateEdgeStyles,
  validateAutomate: validation.validateAutomate,
  getNodeConfig,
  getBaseNodeStyle: nodeStyles.getBaseNodeStyle,
  getBaseEdgeStyle: nodeStyles.getBaseEdgeStyle
});

// Fonction pour basculer en mode plein écran
const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value;
  // Ajuster la vue après le passage en plein écran
  setTimeout(() => {
    editorControls.centerGraph();
  }, 100);
};

// Fonction pour obtenir le nom d'un nœud par son ID
const getNodeName = (nodeId) => {
  const node = currentNodes.value.find(n => n.id === nodeId);
  return node ? node.data.label : nodeId;
};

// Configuration pour les nœuds
function getNodeConfig(type) {
  const baseConfig = {
    sourcePosition: 'bottom',
    targetPosition: 'top',
  };
  
  switch (type) {
    case 'initial':
      return {
        ...baseConfig,
        type: 'default',
        sourcePosition: 'bottom',
        targetPosition: null // Initial nodes don't have target handles
      };
    case 'final':
      return {
        ...baseConfig,
        type: 'default',
        sourcePosition: null, // Final nodes don't have source handles
        targetPosition: 'top',
      };
    default:
      return {
        ...baseConfig,
        type: 'default',
      };
  }
}

// Sauvegarde l'état de l'automate actif
function saveCurrentAutomateState() {
  if (!activeAutomateId.value) return;
  
  const automate = contractAutomates.value.find(a => a.id === activeAutomateId.value);
  
  if (!automate) return;
  
  // Convertir les nœuds en états
  automate.states = currentNodes.value.map(node => {
    // Déterminer le type de nœud
    let type = 'standard';
    if (!currentEdges.value.some(e => e.target === node.id)) type = 'initial';
    if (!currentEdges.value.some(e => e.source === node.id)) type = 'final';
    
    return {
      id: node.id,
      label: node.data.label,
      position: { x: node.position.x, y: node.position.y },
      type,
      sourcePosition: node.sourcePosition,
      targetPosition: node.targetPosition,
    };
  });
  
  // Sauvegarder les transitions
  automate.transitions = currentEdges.value.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    markerEnd: edge.markerEnd
  }));
}

// Initialisation
onMounted(() => {
  // Charger l'automate initial
  automateManager.loadAutomateState(activeAutomateId.value);
  
  // Initialiser l'historique
  historyManager.saveToHistory();

  // Valider l'automate après le chargement
  validation.validateAutomate();

  // Centrer le graphe
  setTimeout(() => {
    editorControls.centerGraph();
  }, 100);
});

// Observer les changements dans currentNodes et currentEdges pour valider l'automate
watch([currentNodes, currentEdges], () => {
  validation.validateAutomate();
  isSaved.value = false;
}, { deep: true });
</script>


<style scoped>
/* Animations pour les transitions actives en mode simulation */
@keyframes pulse-line {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.animated-edge {
  stroke: #facc15; /* jaune vif */
  stroke-width: 3px;
  stroke-dasharray: 10;
  animation: pulse-line 1s ease forwards;
}

.ring-highlight {
  transition: all 0.3s ease;
  box-shadow: 0 0 0 4px #fde047; /* ring-yellow-400 */
  background-color: #fef3c7; /* bg-yellow-100 */
}
</style>
