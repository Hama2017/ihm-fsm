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
            @click="undo" 
            :disabled="!canUndo"
            class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Annuler"
          >
            <LucideUndo2 class="w-4 h-4" />
          </button>
          <button 
            @click="redo" 
            :disabled="!canRedo"
            class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Rétablir"
          >
            <LucideRedo2 class="w-4 h-4" />
          </button>
        </div>
        
        <!-- Boutons principaux -->
        <button 
          @click="saveContract"
          :disabled="!contractName.trim() || isSaving"
          class="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition duration-200
                 text-white
                 bg-blue-600 hover:bg-blue-700
                 disabled:bg-gray-400 disabled:cursor-not-allowed
                 dark:disabled:bg-gray-700"
        >
          <LucideSave v-if="!isSaving" class="h-4 w-4" />
          <LucideLoader v-else class="h-4 w-4 animate-spin" />
          <span>Sauvegarder</span>
        </button>
        
        <button 
          @click="deployContract"
          :disabled="hasValidationErrors || contractStatus === 'Actif'"
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
          <!-- Bouton pour masquer/afficher sur mobile -->
          <button 
            @click="toggleLeftPanel" 
            class="xl:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LucideChevronsDown v-if="showLeftPanel" class="w-5 h-5" />
            <LucideChevronsRight v-else class="w-5 h-5" />
          </button>
        </div>
        
        <div v-show="showLeftPanel || isDesktop" class="flex-grow overflow-hidden">
          <AutomateList 
            :automates="contractAutomates"
            :activeAutomate="activeAutomateId"
            @select-automate="selectAutomate"
            @add-automate="addAutomate"
            @edit-automate="editAutomate"
            @remove-automate="removeAutomate"
          />
        </div>
   

      </div>





      <!-- Colonne centrale : Éditeur d'automate avec contrôles améliorés -->
      <div class="xl:h-full flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white w-full text-center">
            Automate <span v-if="activeAutomateName()"> : {{ activeAutomateName() }}</span>
          </h2>
        </div>
        
       <!--  createContractView.vue -->
<EditorToolbar 
  v-if="activeAutomateId"
  :zoom-level="zoomLevel"
  :show-minimap="showMinimap"
  :snap-to-grid="snapToGrid"
  :is-simulating="isSimulating"
  :is-full-screen="isFullScreen"
  :can-undo="canUndo"
  :can-redo="canRedo"
  :show-conditions="showConditionsOnGraph"
  @zoom-in="zoomIn"
  @zoom-out="zoomOut"
  @zoom-reset="resetZoom"
  @center-graph="centerGraph"
  @toggle-minimap="toggleMinimap"
  @toggle-grid="toggleGrid"
  @add-initial-state="addInitialState"
  @add-state="addStandardState"
  @add-final-state="addFinalState"
  @toggle-edit-mode="isSimulating ? toggleSimulation() : null"
  @toggle-simulation="toggleSimulation"
  @toggle-fullscreen="toggleFullScreen"
  @toggle-conditions="toggleConditionsDisplay"
  @undo="undo"
  @redo="redo"
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
            @connect="onNodeConnect"
            @edgeUpdate="handleEdgeUpdate"
            @edgeClick="onEdgeClick"
            @nodeContextMenu="onNodeRightClick"
            @edgeContextMenu="onEdgeContextMenu"
            :snapToGrid="snapToGrid"
            :snapGrid="[15, 15]"
            :disabled="isSimulating"
          >
            <MiniMap v-if="showMinimap" pannable zoomable position="top-right" />
            <Background :pattern-color="isDarkMode ? '#374151' : '#E5E7EB'" :gap="15" size="1" />
            
            <!-- Indication mode simulation -->
            <template v-if="isSimulating" #node-default="props">
              <div
                @click="simulateTransition(props.node)"
                :class="[
                  'p-2 rounded-md min-w-[100px] text-center',
                  simulationCurrentState === props.node.id ? 'ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 font-bold' : '',
                  simulationVisitedStates.includes(props.node.id) ? 'bg-green-50 dark:bg-green-900/30' : ''
                ]"
              >
                {{ props.node.data.label }}
              </div>
            </template>


              <!-- NOUVEAU: Template personnalisé pour les edges montrant les conditions -->
  <template #edge-default="{ id, sourceX, sourceY, targetX, targetY, label, markerEnd, style }">
    <CustomEdge 
      :id="id"
      :sourceX="sourceX"
      :sourceY="sourceY" 
      :targetX="targetX" 
      :targetY="targetY"
      :label="label"
      :markerEnd="markerEnd"
      :style="style"
      :edge="currentEdges.find(e => e.id === id)"
      :showConditions="showConditionsOnGraph"
      :packetCondition="packetCondition"
    />
  </template>

          </VueFlow>

          <!-- Menu contextuel pour le clic droit sur un nœud -->
          <div
            v-if="contextMenu.visible"
            :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
            class="fixed z-50 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 rounded-lg text-sm overflow-hidden min-w-[180px]"
          >
            <div class="py-2 px-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-200">
              {{ getNodeLabelById(contextMenu.targetId) }}
            </div>
            <div class="py-1">
              <button 
                @click="editStateFromContext"
                class="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <LucidePencil class="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" />
                Modifier
              </button>
              <button 
                @click="selectStateFromContext"
                class="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <LucideCheckSquare class="w-4 h-4 mr-3 text-indigo-600 dark:text-indigo-400" />
                {{ activeStateId === contextMenu.targetId ? 'Désélectionner' : 'Sélectionner' }}
              </button>
              <div class="border-t border-gray-200 dark:border-gray-600 my-1"></div>
              <button 
                @click="deleteStateFromContext"
                class="flex items-center w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LucideTrash2 class="w-4 h-4 mr-3" />
                Supprimer
              </button>
            </div>
          </div>
                    
          <!-- Menu contextuel pour le clic droit sur une transition -->
          <div
            v-if="edgeContextMenu.visible"
            :style="{ top: `${edgeContextMenu.y}px`, left: `${edgeContextMenu.x}px` }"
            class="fixed z-50 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 rounded-lg text-sm overflow-hidden min-w-[180px]"
          >
            <div class="py-2 px-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-200">
              {{ getEdgeLabelById(edgeContextMenu.targetId) }}
            </div>
            <div class="py-1">
              <button 
                @click="editTransitionFromContext"
                class="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <LucidePencil class="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" />
                Modifier
              </button>
              
              <button 
                @click="selectTransitionFromContext"
                class="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <LucideCheckSquare class="w-4 h-4 mr-3 text-indigo-600 dark:text-indigo-400" />
                {{ activeTransitionId === edgeContextMenu.targetId ? 'Désélectionner' : 'Sélectionner' }}
              </button>
              
              <button 
                @click="invertTransitionFromContext"
                class="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300"
              >
                <LucideArrowDownUp class="w-4 h-4 mr-3 text-green-600 dark:text-green-400" />
                Inverser
              </button>
              
              <div class="border-t border-gray-200 dark:border-gray-600 my-1"></div>
              
              <button 
                @click="deleteTransitionFromContext"
                class="flex items-center w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LucideTrash2 class="w-4 h-4 mr-3" />
                Supprimer
              </button>
            </div>
          </div>

          <!-- Barre d'état avec les erreurs -->
          <div v-if="hasValidationErrors" class="absolute bottom-0 left-0 right-0 bg-yellow-50 dark:bg-yellow-900/20 p-2 border-t border-yellow-200 dark:border-yellow-700">
            <div class="flex items-center text-sm text-yellow-800 dark:text-yellow-300">
              <LucideAlertTriangle class="w-4 h-4 mr-2" />
              <span>{{ validationErrorMessage }}</span>
            </div>
          </div>
               
     
          <!-- Message Simulation en cours -->
          <div v-if="isSimulating" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-700 rounded-full shadow-lg p-1 flex items-center">
            
            <LucideLoader class="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Simulation en cours</span> 

          </div>

        </div>
      </div>

      <!-- Colonne droite : onglets pour États, Fonctions et Aide -->
      <div class="xl:h-full flex flex-col" v-if="activeAutomateId">
    <SlidableTabs v-model="rightPanelTab" :tabs="rightPanelTabs" >
      <!-- Chaque onglet a un slot correspondant à son ID -->
      <template #states>
        <div class="h-full">
          <StateList
            v-model:nodes="currentNodes"
            :edges="currentEdges"
            :selectedState="activeStateId"
            @add-state="openAddStateModal"
            @edit-state="openEditStateModal"
            @remove-state="openRemoveStateModal"
            @select-state="selectState"
            @open-add-modal="openAddStateModal"
            @open-edit-modal="openEditStateModal"
            @open-remove-modal="openRemoveStateModal"
          />
        </div>
      </template>
      
      <template #declencheurs>
        <div class="h-full">
          <FunctionList
  :edges="currentEdges"
  :nodes="currentNodes"
  :availableFunctions="availableFunctions"
  :packetCondition="packetCondition"
  :activeTransition="activeTransitionId"
  :contractAutomates="contractAutomates"
  :activeAutomateId="activeAutomateId"
  @select-transition="selectTransition"
  @add-transition="addTransition"
  @edit-transition="editTransition"
  @remove-transition="removeTransition"
  @reverse-transition="openInvertTransitionModal"
  @update-transition-conditions="updateTransitionConditions"
  @update-transition-automata-dependencies="updateTransitionAutomataDependencies"
/>
        </div>
      </template>
      

      
      <template #guide>
        <div class="h-full">
          <ConditionList :packetCondition="packetCondition" />
        </div>
      </template>

      <template #analyzer>
        <div class="h-full">
          <AutomatonAnalyzer
  :nodes="currentNodes"
  :edges="currentEdges"
  :validationErrors="validationErrors"
  :cyclePath="cyclePath"
  :packetCondition="packetCondition"
  @analyze="validateAutomate"
/>
        </div>
      </template>
    </SlidableTabs>
  </div>
    </div>
    
    <!-- Modals -->
    <!-- Modal pour la simulation -->
    <Modal
      v-model="showSimulationModal"
      title="Simulation de l'automate"
      confirm-text="Lancer la simulation"
      @confirm="launchSimulation"
    >
      <p class="text-gray-700 dark:text-gray-300">
        Voulez-vous lancer la simulation de déploiement de cet automate ?
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Cette simulation vous permettra de visualiser l'ordre de déploiement des états selon leur dépendance.
      </p>
    </Modal>
    
    <!-- Modal récapitulatif de déploiement -->
    <Modal
  v-model="showDeploymentSummaryModal"
  title="Résumé de la simulation"
  confirm-text="Fermer"
  @confirm="closeDeploymentSummaryModal()"
>
  <div class="space-y-3">
    <div class="text-green-700 dark:text-green-400 font-semibold">
      Test de déploiement terminé avec succès 
    </div>
    <div class="text-sm text-gray-700 dark:text-gray-300">
      Ordre de déploiement :
    </div>
    <ul class="list-decimal list-inside space-y-1 text-sm text-gray-800 dark:text-gray-200">
      <li v-for="stateId in deploymentResult" :key="stateId">
        {{ currentNodes.find(n => n.id === stateId)?.data.label || stateId }}
      </li>
    </ul>
  </div>
</Modal>
    
    <!-- Modal d'ajout d'état -->
    <Modal
      v-model="showAddStateModal"
      title="Ajouter un état"
      confirm-text="Ajouter"
      @confirm="confirmAddState"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'état</label>
          <input
            type="text"
            v-model="newStateName"
            placeholder="Saisir le nom de l'état..."
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'état</label>
          <select
            v-model="newStateType"
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="standard">État standard</option>
            <option value="initial">État initial</option>
            <option value="final">État final</option>
          </select>
        </div>
        
        <p v-if="addStateError" class="text-sm text-red-600 dark:text-red-400 mt-2">
          {{ addStateError }}
        </p>
      </div>
    </Modal>
    
    <!-- Modal d'édition d'état -->
    <Modal
      v-model="showEditStateModal"
      title="Modifier l'état"
      confirm-text="Enregistrer"
      @confirm="confirmEditState"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'état</label>
          <input
            type="text"
            v-model="editStateName"
            placeholder="Saisir le nom de l'état..."
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <p v-if="editStateError" class="text-sm text-red-600 dark:text-red-400 mt-2">
          {{ editStateError }}
        </p>
      </div>
    </Modal>
    
    <!-- Modal de suppression d'état -->
    <Modal
      v-model="showRemoveStateModal"
      title="Supprimer l'état ?"
      confirm-text="Supprimer"
      variant="danger"
      @confirm="confirmRemoveState"
    >
      <p class="text-gray-700 dark:text-gray-300">
        Êtes-vous sûr de vouloir supprimer cet état ?
      </p>
      <div v-if="stateUsedInEdges" class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm rounded-md">
        <p class="flex items-center">
          <LucideAlertTriangle class="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Attention : Cet état est utilisé dans des transitions. Les supprimer également ?</span>
        </p>
      </div>
    </Modal>
    
    <!-- Modal de suppression de transition -->
    <Modal
      v-model="showRemoveTransitionModal"
      title="Supprimer la transition ?"
      confirm-text="Supprimer"
      variant="danger"
      @confirm="confirmRemoveTransition"
    >
      <p class="text-gray-700 dark:text-gray-300">
        Êtes-vous sûr de vouloir supprimer cette transition ? Cette action est irréversible.
      </p>
    </Modal>
    
      
    <!-- Modal d'inversion de transition -->
    <Modal
  v-model="showInvertTransitionModal"
  title="Inverser la transition"
  confirm-text="Inverser"
  variant="danger"
  @confirm="confirmInvertTransition"
>
  <div class="space-y-6">
    <p class="text-gray-700 dark:text-gray-300 font-medium text-center">
      Voulez-vous inverser le sens de cette transition ?
    </p>
    
    <!-- Sens actuel -->
    <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
      <div class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-medium">Sens actuel</div>
      <div class="flex items-center justify-center space-x-3 p-3">
        <div class="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg font-medium">
          {{ getNodeLabelById(invertingTransition.source) }}
        </div>
        <LucideArrowRight class="h-6 w-6 text-blue-500 dark:text-blue-400" />
        <div class="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg font-medium">
          {{ getNodeLabelById(invertingTransition.target) }}
        </div>
      </div>
    </div>
    
    <!-- Flèche d'inversion -->
    <div class="flex justify-center items-center">
      <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
        <LucideArrowDownUp class="h-6 w-6 text-amber-600 dark:text-amber-400 transform rotate-180" />
      </div>
    </div>
    
    <!-- Nouveau sens -->
    <div class="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
      <div class="text-xs uppercase tracking-wider text-green-600 dark:text-green-400 mb-2 font-medium">Nouveau sens</div>
      <div class="flex items-center justify-center space-x-3 p-3">
        <div class="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg font-medium">
          {{ getNodeLabelById(invertingTransition.target) }}
        </div>
        <LucideArrowRight class="h-6 w-6 text-green-500 dark:text-green-400" />
        <div class="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg font-medium">
          {{ getNodeLabelById(invertingTransition.source) }}
        </div>
      </div>
    </div>
 
  </div>
</Modal>
    
    <!-- Modal de mise à jour des connexions -->
    <Modal
      v-model="showEdgeUpdateModal"
      title="Modifier la transition"
      @confirm="confirmEdgeUpdate"
    >
      <div class="space-y-3">
        <div class="flex items-center">
          <span class="font-medium w-32 text-gray-700 dark:text-gray-300">Nouvelle origine:</span>
          <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
            {{ edgeUpdateSourceName }}
          </span>
        </div>
        <div class="flex items-center">
          <span class="font-medium w-32 text-gray-700 dark:text-gray-300">Nouvelle destination:</span>
          <span class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
            {{ edgeUpdateTargetName }}
          </span>
        </div>
      </div>
    </Modal>
    
    <!-- Modal de gestion des automates -->
    <Modal
      v-model="showAutomateModal"
      title="Gestion des clauses"
      confirm-text="Enregistrer"
      @confirm="confirmAutomateEdit"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nom de la clause
          </label>
          <input
            type="text"
            v-model="editingAutomateName"
            placeholder="Saisir le nom de la clause..."
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <p v-if="automateModalError" class="text-sm text-red-600 dark:text-red-400 mt-2">
          {{ automateModalError }}
        </p>
      </div>
    </Modal>
    
    <!-- Modal d'ajout de transition -->
    <Modal
      v-model="showAddTransitionModal"
      title="Ajouter une transition"
      confirm-text="Ajouter"
      @confirm="confirmAddTransition"
    >
      <div class="space-y-4">
        <!-- Source -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            État source
          </label>
          <select 
            v-model="editingTransition.source"
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
            v-model="editingTransition.target"
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
            Déclencheur

          </label>
          <select 
            v-model="editingTransition.function"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Sélectionner un déclencheur</option>
            <option v-for="func in availableFunctions" :key="func.value" :value="func.value">
              {{ func.label }}
            </option>
          </select>
        </div>
        
        <p v-if="editTransitionError" class="text-sm text-red-600 dark:text-red-400 mt-2">
          {{ editTransitionError }}
        </p>
      </div>
    </Modal>
    
    <!-- Modal d'édition de transition -->



    <Modal 
  v-model="showEditTransitionModal" 
  title="Modifier le déclencheur" 
  @confirm="confirmEditTransition"
  confirm-text="Enregistrer"
>
  <TransitionForm
    v-model="editingTransition"
    :nodes="currentNodes"
    :availableFunctions="availableFunctions"
    :packetCondition="packetCondition"
    :errorMessage="editTransitionError"
  />
</Modal>








       <!-- Container pour les toasts -->
       <UiToastContainer />
    <!-- Composant TransitionModal pour gérer les transitions -->
 <!-- Composant TransitionModal pour gérer les transitions -->
<TransitionModal 
  ref="transitionModalRef"
  :transitions="availableFunctions"
  :packetCondition="packetCondition"
  @confirm="onTransitionConfirmOnConnect"
/>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { VueFlow, useVueFlow, MarkerType } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import { useThemeStore } from '@/stores/theme';
import { useContractStore } from '@/stores/contractStore';
import UiToastContainer from '@/components/ui/UiToastContainer.vue';
import toast from '@/composables/Toast/useToast';
import CustomEdge from '@/components/contract/CustomEdge.vue';
import TransitionForm from '@/components/contract/TransitionForm.vue';
import ConditionList from '@/components/contract/ConditionList.vue';
import SlidableTabs from '@/components/ui/UiSlidableTabs.vue';
import '@vue-flow/core/dist/style.css' ;
import packageService from '@/services/packageService';


// Composants
import Modal from '@/components/ui/UiModal.vue';
import TransitionModal from '@/components/ui/UiTransitionModal.vue';
import AutomateList from '@/components/contract/AutomateList.vue';
import StateList from '@/components/contract/StateList.vue';
import FunctionList from '@/components/contract/FunctionList.vue';
import EditorToolbar from '@/components/contract/EditorToolbar.vue';
import AutomatonAnalyzer from '@/components/contract/AutomatonAnalyzer.vue';

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


const rightPanelTabs = [
  { id: 'states', label: 'États' },
  { id: 'declencheurs', label: 'Déclencheurs' },
  { id: 'guide', label: 'Guide' },
  { id: 'analyzer', label: 'Analyse' },
];

// Router et route
const router = useRouter();
const route = useRoute();

// Stores 
const themeStore = useThemeStore();
const { darkMode } = storeToRefs(themeStore);
const isDarkMode = darkMode;
const contractStore = useContractStore();

// Référence au composant TransitionModal
const transitionModalRef = ref(null);

// État du contrat
const contractName = ref('');
const contractStatus = ref('Brouillon');
const isSaved = ref(false);






/*

// Packages de conditions disponibles
const packetCondition = ref([
  {
    "id": "package-1",
    "label": "Conditions administratives",
    "functions": [
      {
        "id": "condition-a1",
        "label": "Signature utilisateur",
        "description": "Vérifie que l'utilisateur a signé le document."
      },
      {
        "id": "condition-a2",
        "label": "Date d'échéance",
        "description": "Vérifie que la date limite n'est pas dépassée."
      },
      {
        "id": "condition-a3",
        "label": "Validation manager",
        "description": "Vérifie que le manager a validé la demande."
      }
    ]
  },
  {
    "id": "package-2",
    "label": "Conditions financières",
    "functions": [
      {
        "id": "condition-b1",
        "label": "Montant approuvé",
        "description": "Vérifie que le montant est inférieur au seuil autorisé."
      },
      {
        "id": "condition-b2",
        "label": "Budget disponible",
        "description": "Vérifie que le budget alloué est suffisant."
      }
    ]
  },
  {
    "id": "package-3",
    "label": "Conditions techniques",
    "functions": [
      {
        "id": "condition-c1",
        "label": "Conformité technique",
        "description": "Vérifie que les spécifications techniques sont respectées."
      },
      {
        "id": "condition-c2",
        "label": "Tests validés",
        "description": "Vérifie que tous les tests ont été passés avec succès."
      }
    ]
  }
]);
*/
const packetCondition = ref([]);


onMounted(() => {
  packageService.getAllPackages()
    .then((apiPackages) => {
      const internalPackages = apiPackages.map(apiPackage => 
        packageService.convertToInternalFormat(apiPackage)
      );
      
      console.log('Packages récupérés et convertis avec succès:', internalPackages);
      packetCondition.value = internalPackages;
    })
    .catch((error) => {
      console.error('Erreur lors de la récupération des packages:', error);
    });
});

// État des noeuds et transitions
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
        markerEnd: MarkerType.ArrowClosed,
        conditions: ['condition-a1', 'condition-a1'], // IDs des conditions associées
        automataDependencies: null
      },
      { 
        id: 'edge-2', 
        source: 'state-2', 
        target: 'state-3', 
        label: 'approuver', 
        markerEnd: MarkerType.ArrowClosed,
        conditions: ['condition-b2', 'condition-b1'], // IDs des conditions associées
        automataDependencies: null
      },
      { 
        id: 'edge-3', 
        source: 'state-2', 
        target: 'state-4', 
        label: 'rejeter', 
        markerEnd: MarkerType.ArrowClosed,
        conditions: ['condition-a1', 'condition-a1'], // IDs des conditions associées
        automataDependencies: null
      }
    ]
  }
]);
const activeAutomateId = ref('01');
const currentNodes = ref([]);
const currentEdges = ref([]);
const activeStateId = ref(null);
const activeTransitionId = ref(null);

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

// Import et destructuration des composables
import useGraphStyles from '@/composables/contract/useGraphStyles';
import useState from '@/composables/contract/useState';
import useTransition from '@/composables/contract/useTransition';
import useAutomate from '@/composables/contract/useAutomate';
import useHistory from '@/composables/contract/useHistory';
import useEditorToolbar from '@/composables/contract/useEditorToolbar';
import useSimulation from '@/composables/contract/useSimulation';
import useValidation from '@/composables/contract/useValidation';
import useContractActions from '@/composables/contract/useContractActions';

//  Styles des noeuds
const { 
  getBaseNodeStyle, 
  getSelectedNodeStyle, 
  getBaseEdgeStyle,
  getSelectedEdgeStyle
} = useGraphStyles({ isDarkMode });

//  Obtenir les fonctions VueFlow
const { findNode, onNodeClick, addSelectedNodes, nodesSelectionActive } = useVueFlow();

// Fonction auxiliaire pour obtenir la configuration des noeuds
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
        targetPosition: null
      };
    case 'final':
      return {
        ...baseConfig,
        type: 'default',
        sourcePosition: null,
        targetPosition: 'top',
      };
    default:
      return {
        ...baseConfig,
        type: 'default',
      };
  }
}

// Gestion de validation
const {
  validateAutomate,
  detectCycle,
  validationErrors,
  cyclePath,
  hasValidationErrors,
  validationErrorMessage
} = useValidation({
  currentNodes,
  currentEdges
});

//  Gestion d'historique
const {
  historyStack, 
  historyIndex,
  canUndo,
  canRedo,
  saveToHistory,
  resetHistory,
  undo,
  redo
} = useHistory({
  nodes: currentNodes,
  edges: currentEdges,
  activeStateId,
  activeTransitionId,
  updateNodeStyles: (id) => updateNodeStyles(id),
  updateEdgeStyles: (id) => updateEdgeStyles(id)
});

// Gestion des états
const {
  contextMenu,
  showAddStateModal,
  showEditStateModal,
  showRemoveStateModal,
  newStateName,
  newStateType,
  editStateName,
  editStateId,
  removeStateId,
  addStateError,
  editStateError,
  stateUsedInEdges,
  updateNodeStyles,
  openAddStateModal,
  openEditStateModal,
  openRemoveStateModal,
  addState,
  editState,
  removeState,
  selectState,
  confirmAddState,
  confirmEditState,
  confirmRemoveState,
  addInitialState,
  addStandardState,
  addFinalState,
  onNodeRightClick,
  getNodeLabelById,
  selectStateFromContext,
  editStateFromContext,
  deleteStateFromContext
} = useState({
  nodes: currentNodes,
  edges: currentEdges,
  activeStateId,
  saveToHistory,
  validateAutomate,
  getBaseNodeStyle,
  getSelectedNodeStyle,
  getNodeConfig
});

// Gestion des transitions
const {
  edgeContextMenu,
  showAddTransitionModal,
  showEditTransitionModal,
  showRemoveTransitionModal,
  showInvertTransitionModal,
  showEdgeUpdateModal,
  editingTransition,
  invertingTransition,
  removeTransitionId,
  editTransitionError,
  edgeUpdateData,
  edgeUpdateSourceName,
  edgeUpdateTargetName,
  updateEdgeStyles,
  handleConnectNodes,
  onEdgeClick,
  handleEdgeUpdate,
  confirmEdgeUpdate,
  addTransition,
  editTransition,
  removeTransition,
  invertTransition,
  selectTransition,
  confirmAddTransition,
  confirmEditTransition,
  confirmRemoveTransition,
  confirmInvertTransition,
  onEdgeContextMenu,
  getEdgeLabelById,
  selectTransitionFromContext,
  editTransitionFromContext,
  invertTransitionFromContext,
  deleteTransitionFromContext,
  openInvertTransitionModal
} = useTransition({
  nodes: currentNodes,
  edges: currentEdges,
  activeTransitionId,
  saveToHistory,
  validateAutomate,
  detectCycle,
  getBaseEdgeStyle,
  getSelectedEdgeStyle
});

// Gestion de l'éditeur
const {
  zoomLevel,
  showMinimap,
  snapToGrid,
  showLeftPanel,
  isDesktop,
  rightPanelTab,
  centerGraph,
  resetZoom,
  toggleMinimap,
  toggleGrid,
  toggleLeftPanel,
  zoomIn,
  zoomOut,
  setRightPanelTab,
  isFullScreen,
  toggleFullScreen,
} = useEditorToolbar();

// Gestion de la simulation
const {
  isSimulating,
  simulationCurrentState,
  simulationVisitedStates,
  showSimulationModal,
  showDeploymentSummaryModal,
  deploymentResult,
  toggleSimulation,
  resetSimulation,
  simulateTransition,
  launchSimulation,
  closeDeploymentSummaryModal
} = useSimulation(
  currentNodes, 
  currentEdges, 
  darkMode
);

//  Gestion des automates
const {
  showAutomateModal,
  editingAutomateId,
  editingAutomateName,
  automateModalError,
  selectAutomate,
  addAutomate,
  editAutomate,
  removeAutomate,
  confirmAutomateEdit,
  saveCurrentAutomateState,
  loadAutomateState,
  activeAutomateName
} = useAutomate({
  contractAutomates,
  activeAutomateId,
  currentNodes,
  currentEdges,
  activeStateId,
  activeTransitionId,
  historyStack,
  historyIndex,
  canUndo,
  canRedo,
  updateNodeStyles,
  updateEdgeStyles,
  validateAutomate,
  getNodeConfig,
  getBaseNodeStyle,
  getBaseEdgeStyle
});

// Gestion des actions du contrat
const {
  isSaving,
  saveContract,
  deployContract
} = useContractActions({
  contractName,
  contractStatus,
  contractAutomates,
  activeAutomateId,
  isSaved,
  hasValidationErrors,
  saveCurrentAutomateState,
  validateAutomate
});

// Fonction pour obtenir le nom d'un nœud par son ID
const getNodeName = (nodeId) => {
  const node = currentNodes.value.find(n => n.id === nodeId);
  return node ? node.data.label : nodeId;
};

// Chargement du contrat lors de l'initialisation
onMounted(async () => {




  // Vérifier si on est en mode édition (l'URL contient un ID)
  const editMode = route.name === 'edit-contract';
  const contractId = route.params.id;
  
  if (editMode && contractId) {
    console.log('Mode édition activé, chargement du contrat:', contractId);
    
    // Si le contrat n'est pas déjà chargé dans le store, le charger
    if (!contractStore.currentContract || contractStore.currentContract.id !== contractId) {
      const contract = contractStore.getContractById(contractId);
      
      if (contract) {
        // Charger le contrat dans le composant
        contractName.value = contract.name;
        contractStatus.value = contract.status;
        contractAutomates.value = contract.automates.map(automate => ({...automate}));
        
        if (contractAutomates.value.length > 0) {
          // Activer le premier automate ou celui qui était actif précédemment
          const activeAutomate = contractAutomates.value.find(a => a.active) || contractAutomates.value[0];
          activeAutomateId.value = activeAutomate.id;
          loadAutomateState(activeAutomate.id);
        }
        
        // Mettre le contrat comme contrat courant
        contractStore.setCurrentContract(contract);
        
        // Marquer comme sauvegardé initialement
        isSaved.value = true;
      } else {
        console.error("Contrat non trouvé:", contractId);
        toast.error("Impossible de trouver le contrat à éditer");
        // Rediriger vers la liste des contrats après un délai
        setTimeout(() => {
          router.push({ name: 'contracts' });
        }, 2000);
      }
    } else {
      // Le contrat est déjà chargé dans le store, l'utiliser
      const contract = contractStore.currentContract;
      contractName.value = contract.name;
      contractStatus.value = contract.status;
      contractAutomates.value = contract.automates.map(automate => ({...automate}));
      
      if (contractAutomates.value.length > 0) {
        const activeAutomate = contractAutomates.value.find(a => a.active) || contractAutomates.value[0];
        activeAutomateId.value = activeAutomate.id;
        loadAutomateState(activeAutomate.id);
      }
      
      isSaved.value = true;
    }
  } else {
    // Mode création
    console.log('Mode création activé');
    // Réinitialiser les valeurs par défaut au cas où
    contractName.value = '';
    contractStatus.value = 'Brouillon';
    // Charger l'automate initial
    loadAutomateState(activeAutomateId.value);
  }
  
  // Initialiser l'historique
  saveToHistory();

  // Valider l'automate après le chargement
  validateAutomate();

  // Centrer le graphe
  setTimeout(() => {
    centerGraph();
  }, 100);
  
  // Ajout des gestionnaires d'événements pour les menus contextuels
  window.addEventListener('click', () => (contextMenu.value.visible = false));
  window.addEventListener('click', () => (edgeContextMenu.value.visible = false));
});

// Observer les changements de route pour gérer les transitions entre création et édition
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      // Mode édition - charger le contrat
      const contract = contractStore.getContractById(newId);
      if (contract) {
        contractName.value = contract.name;
        contractStatus.value = contract.status;
        contractAutomates.value = contract.automates.map(automate => ({...automate}));
        
        if (contractAutomates.value.length > 0) {
          const activeAutomate = contractAutomates.value.find(a => a.active) || contractAutomates.value[0];
          activeAutomateId.value = activeAutomate.id;
          loadAutomateState(activeAutomate.id);
        }
        
        contractStore.setCurrentContract(contract);
        isSaved.value = true;
      }
    } else {
      // Mode création - réinitialiser
      contractName.value = '';
      contractStatus.value = 'Brouillon';
      // Conserver ou non l'automate par défaut selon votre logique
    }
  }
);

// Observer les changements dans currentNodes et currentEdges pour valider l'automate
watch([currentNodes, currentEdges], () => {
  validateAutomate();
  isSaved.value = false;
}, { deep: true });

// Sélection d'un nœud dans VueFlow
onNodeClick(({ node }) => {
  // Si le nœud cliqué est déjà le nœud actif, le désélectionner
  if (activeStateId.value === node.id) {
    activeStateId.value = null;
    updateNodeStyles(null);
  } else {
    // Sinon, sélectionner le nouveau nœud
    activeStateId.value = node.id;
    updateNodeStyles(node.id);
  }
});

/**
 * Capturé depuis @connect de VueFlow.
 * Valide la connexion et, si OK, ouvre le modal en lui passant source/target.
 */
function onNodeConnect(params) {
  const { source, target } = params;
  const result = handleConnectNodes({ source, target });

  if (!result.success) {
    toast.error(result.message);
    return;
  }

  // ouvre le modal exposé par TransitionModal.vue
  transitionModalRef.value.open(
    result.source,
    result.target,
    result.sourceName,
    result.targetName
  );
}

/**
 * Capturé depuis @confirm du TransitionModal.
 * Ajoute vraiment la transition, affiche un toast et recentre si tout est OK.
 */
function onTransitionConfirmOnConnect({ source, target, transition, conditions }) {
  const { success, message } = addTransition({
    source,
    target,
    label: transition,
    conditions: conditions || [] 
  });

  if (!success) {
    toast.error(message);
  } else {
    toast.success(message);
    centerGraph();
  }
}

// Fonction pour mettre à jour les conditions d'une transition
const updateTransitionConditions = (data) => {
  const { id, conditions } = data;
  
  // Trouver la transition dans currentEdges et mettre à jour ses conditions
  const edgeIndex = currentEdges.value.findIndex(edge => edge.id === id);
  if (edgeIndex !== -1) {
    // Créer une nouvelle référence pour que Vue détecte le changement
    const updatedEdges = [...currentEdges.value];
    updatedEdges[edgeIndex] = {
      ...updatedEdges[edgeIndex],
      conditions
    };
    
    // Mettre à jour currentEdges
    currentEdges.value = updatedEdges;
    
    // Mettre à jour l'historique
    saveToHistory();
    
    // Mettre à jour l'état de sauvegarde
    isSaved.value = false;
    
    toast.success('Conditions mises à jour avec succès');
  }
};

const showConditionsOnGraph = ref(false); 

const toggleConditionsDisplay = () => {
  showConditionsOnGraph.value = !showConditionsOnGraph.value;
};






/**
 * Met à jour les dépendances d'automates pour une transition spécifique
 * 
 * @param {Object} data - Un objet contenant l'ID de la transition et ses nouvelles dépendances d'automates
 * @param {string} data.id - L'identifiant de la transition
 * @param {string[]} data.automataDependencies - Liste des IDs des automates dépendants
 */
 const updateTransitionAutomataDependencies = (data) => {
  // Mettre à jour currentEdges
  const edgeIndex = currentEdges.value.findIndex(edge => edge.id === data.id);
  if (edgeIndex !== -1) {
    const updatedEdges = [...currentEdges.value];
    updatedEdges[edgeIndex] = {
      ...updatedEdges[edgeIndex],
      automataDependencies: data.automataDependencies || null
    };
    currentEdges.value = updatedEdges;
  }

  // Mettre à jour contractAutomates
  const currentAutomateIndex = contractAutomates.value.findIndex(
    automate => automate.id === activeAutomateId.value
  );
  
  if (currentAutomateIndex !== -1) {
    const updatedAutomates = [...contractAutomates.value];
    const transitionIndex = updatedAutomates[currentAutomateIndex].transitions.findIndex(
      transition => transition.id === data.id
    );
    
    if (transitionIndex !== -1) {
      const currentTransition = updatedAutomates[currentAutomateIndex].transitions[transitionIndex];
      
      // Vérifier si la valeur a réellement changé avant de sauvegarder l'historique
      const hasChanged = JSON.stringify(currentTransition.automataDependencies) !== 
                         JSON.stringify(data.automataDependencies || null);
      
      if (hasChanged) {
        updatedAutomates[currentAutomateIndex].transitions[transitionIndex] = {
          ...currentTransition,
          automataDependencies: data.automataDependencies || null
        };
        
        contractAutomates.value = updatedAutomates;
        
        // Sauvegarder l'historique seulement si un changement est intervenu
        saveToHistory();
        
        isSaved.value = false;
        toast.success('Dépendances de clauses mises à jour avec succès');
      }
    }
  }
};
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

