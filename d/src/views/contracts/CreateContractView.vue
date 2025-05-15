<template>
  <div class="h-full flex flex-col">
    <!-- En-tête avec nom du contrat et boutons d'action -->
    <div v-if="!isFullScreen && !isDeploymentView" class="flex items-center justify-between mb-6 px-1">
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
          @click="startDeploymentProcess"
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
    <div v-if="!isFullScreen && !isDeploymentView" class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
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

    <!-- En-tête de déploiement - montré uniquement en mode déploiement -->
    <div v-if="isDeploymentView" class="flex items-center justify-center mb-6 px-1">
      <div class="bg-green-50 dark:bg-green-900/30 px-4 py-3 rounded-lg shadow-sm border border-green-200 dark:border-green-800 flex items-center">
        <LucideRocket class="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
        <h1 class="text-xl font-semibold text-green-800 dark:text-green-300">
          Mode déploiement - Prévisualisation du flux de déploiement
        </h1>
      </div>
    </div>

    <!-- Contenu principal avec mise en page responsive -->
    <div 
      :class="[
        'grid gap-6 h-[calc(100vh-230px)] transition-all duration-300',
        isFullScreen 
          ? 'grid-cols-1 xl:grid-cols-[1fr_320px]' 
          : isDeploymentView
            ? 'grid-cols-1'
            : 'grid-cols-1 xl:grid-cols-[320px_1fr_320px]'
      ]"
    >
      <!-- Colonne gauche : Liste des automates (collapsible sur mobile) -->
      <div :class="[
        'xl:h-full flex flex-col transition-all duration-300',
        isFullScreen || isDeploymentView ? 'hidden' : ''
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
        <div v-if="!isDeploymentView" class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white w-full text-center">
            Automate <span v-if="activeAutomateName()"> : {{ activeAutomateName() }}</span>
          </h2>
        </div>
        
        <!-- Toolbar visible uniquement si pas en mode déploiement -->
        <EditorToolbar 
          v-if="activeAutomateId && !isDeploymentView"
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
          <div v-if="!activeAutomateId && !isDeploymentView" class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div class="text-center p-8">
              <LucideFileWarning class="w-12 h-12 mx-auto mb-4" />
              <p>Aucun automate sélectionné.</p>
              <p class="mt-2">Veuillez créer ou sélectionner un automate dans la liste.</p>
            </div>
          </div>
          
          <!-- Éditeur VueFlow avec menu contextuel intégré -->
          <VueFlow 
  v-if="activeAutomateId || isDeploymentView"
  v-model:nodes="currentNodes" 
  v-model:edges="currentEdges"
  class="h-full w-full"
  @connect="(params) => { if (!isDeploymentView.value) onNodeConnect(params) }"
  @edgeUpdate="(params) => { if (!isDeploymentView.value) handleEdgeUpdate(params) }"
  @edgeClick="(event) => { if (!isDeploymentView.value) onEdgeClick(event) }"
  @nodeContextMenu="(event) => { if (!isDeploymentView.value) onNodeRightClick(event) }"
  @edgeContextMenu="(event) => { if (!isDeploymentView.value) onEdgeContextMenu(event) }"
  :snapToGrid="snapToGrid"
  :snapGrid="[15, 15]"
  :disabled="isSimulating || isDeploymentView"
>

            <MiniMap v-if="showMinimap && !isDeploymentView" pannable zoomable position="top-right" />
            <Background :pattern-color="isDarkMode ? '#374151' : '#E5E7EB'" :gap="15" size="1" />
                  <!-- Indication mode simulation -->
                  <template v-if="isSimulating && !isDeploymentView" #node-default="props">
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
                :contractAutomates="contractAutomates"
              />
            </template>
          </VueFlow>

          <!-- Menu contextuel pour le clic droit sur un nœud (visible seulement si pas en mode déploiement) -->
          <div
            v-if="contextMenu.visible && !isDeploymentView"
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
                    
          <!-- Menu contextuel pour le clic droit sur une transition (visible seulement si pas en mode déploiement) -->
          <div
            v-if="edgeContextMenu.visible && !isDeploymentView"
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

          <!-- Barre d'état avec les erreurs (visible seulement si pas en mode déploiement) -->
          <div v-if="hasValidationErrors && !isDeploymentView" class="absolute bottom-0 left-0 right-0 bg-yellow-50 dark:bg-yellow-900/20 p-2 border-t border-yellow-200 dark:border-yellow-700">
            <div class="flex items-center text-sm text-yellow-800 dark:text-yellow-300">
              <LucideAlertTriangle class="w-4 h-4 mr-2" />
              <span>{{ validationErrorMessage }}</span>
            </div>
          </div>
               
          <!-- Message Simulation en cours (visible seulement si pas en mode déploiement) -->
          <div v-if="isSimulating && !isDeploymentView" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-700 rounded-full shadow-lg p-1 flex items-center">
            <LucideLoader class="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Simulation en cours</span> 
          </div>

          <!-- Boutons de déploiement (visibles uniquement en mode déploiement) -->
          <div v-if="isDeploymentView" class="absolute bottom-4 right-4 flex space-x-3">
            <button 
              @click="cancelDeployment" 
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md flex items-center"
            >
              <LucideX class="w-4 h-4 mr-2" />
              Annuler
            </button>
            <button 
  @click="simulateDeploymentFlow" 
  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md flex items-center
         disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-700 transition duration-200"
>
  <LucidePlayCircle class="w-4 h-4 mr-2" />
  Simuler Déploiement
</button>

            <button 
              @click="confirmDeployment" 
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md flex items-center"
            >
              <LucideRocket class="w-4 h-4 mr-2" />
              Lancer Déploiement
            </button>
          </div>
        </div>
      </div>

      <!-- Colonne droite : onglets pour États, Fonctions et Aide (masquée en mode déploiement) -->
      <div v-if="activeAutomateId && !isDeploymentView" class="xl:h-full flex flex-col">
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
                :contractAutomates="contractAutomates"
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
          <li v-for="stateId in deploymentResult2" :key="stateId">
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



    <!-- Ajouter ce code à la section des modals dans le template -->
<!-- Modal de résultat de déploiement -->
<Modal
  v-model="showDeploymentResultModal"
  title="Résultat du déploiement"
  confirm-text="Fermer"
  size="lg"
>
  <div class="space-y-4">
    <div class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg text-center">
      <LucideCheck class="w-6 h-6 text-green-500 dark:text-green-400 mx-auto mb-2" />
      <p class="text-green-700 dark:text-green-300 font-medium">
        Contrat déployé avec succès sur la blockchain!
      </p>
    </div>
    
    <p class="text-gray-700 dark:text-gray-300">
      Votre contrat intelligent a été correctement déployé sur la blockchain et est maintenant prêt à être utilisé.
      Voici les informations détaillées du déploiement :
    </p>
    
    <DeploymentInfo :deployment-info="deploymentResult" />

    <div class="flex justify-center mt-4">
  <button
    @click="goToContractExecution"
    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center"
  >
    <LucidePlay class="w-4 h-4 mr-2" />
    Interagir avec le contrat
  </button>
</div>
    
    <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Vous pouvez maintenant interagir avec ce contrat depuis l'interface d'administration.
        Utilisez ces informations pour référencer votre contrat dans d'autres applications.
      </p>
    </div>
  </div>
</Modal>

    <!-- Container pour les toasts -->
    <UiToastContainer />
    
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
import '@vue-flow/core/dist/style.css';
import packageService from '@/services/packageService';
import ContractAutomatonService from '@/services/contractAutomaton';
import ContractDeploymentService from '@/services/contractDeploymentService';
import DeploymentInfo from '@/components/contract/DeploymentInfo.vue';

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
  LucideChevronsRight,
  LucidePlayCircle,
  LucidePlay
} from 'lucide-vue-next';

const rightPanelTabs = [
  { id: 'states', label: 'États' },
  { id: 'declencheurs', label: 'Déclencheurs' },
  { id: 'guide', label: 'Guide' },
  { id: 'analyzer', label: 'Analyse' },
];


const goToContractExecution = () => {
  showDeploymentResultModal.value = false;
  // Rediriger vers la page d'exécution du contrat
  router.push({
    name: 'contract-execution',
    params: { id: currentContractId.value || 'temp' }
  });
};

const showDeploymentResultModal = ref(false);
const deploymentResult = ref(null);

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

// État pour le mode de déploiement
const isDeploymentView = ref(false);
const deploymentAutomateId = ref(null);
const originalActiveAutomateId = ref(null);

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
        conditions: [],
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
  deploymentResult2,
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
  deployContract,
  currentContractId,
  currentCreatedAt
} = useContractActions({
  contractName,
  contractStatus,
  contractAutomates,
  activeAutomateId,
  isSaved,
  hasValidationErrors,
  saveCurrentAutomateState,
  validateAutomate,

});

// Nouvelle fonction pour démarrer le processus de déploiement
const startDeploymentProcess = () => {
 /* if (hasValidationErrors) {
    toast.error('Impossible de déployer le contrat. Veuillez corriger les erreurs.');
    return;
  }*/

  // Sauvegarder l'automate actif actuel
  if (activeAutomateId.value) {
    saveCurrentAutomateState();
  }
  
  // Générer l'automate de déploiement
deployContract();
  
  // Stocker l'ID d'automate actif original pour pouvoir le restaurer si annulation
  originalActiveAutomateId.value = activeAutomateId.value;
  
  // Trouver l'ID de l'automate de déploiement
  const deploymentAutomate = contractAutomates.value.find(a => a.id === 'flow-deploiement');
  if (deploymentAutomate) {
    deploymentAutomateId.value = deploymentAutomate.id;
    
    // Basculer vers l'automate de déploiement
    activeAutomateId.value = deploymentAutomate.id;
    loadAutomateState(deploymentAutomate.id);
    
    // Activer le mode vue déploiement
    isDeploymentView.value = true;
    
    // Ajuster la vue pour être sûr de tout voir
    setTimeout(() => {
      centerGraph();
    }, 100);
  }
};

// Fonction pour annuler le déploiement
const cancelDeployment = () => {
  // Supprimer l'automate de déploiement
  const deploymentIndex = contractAutomates.value.findIndex(a => a.id === 'flow-deploiement');
  if (deploymentIndex !== -1) {
    contractAutomates.value.splice(deploymentIndex, 1);
  }
  
  // Revenir à l'automate actif original
  if (originalActiveAutomateId.value) {
    activeAutomateId.value = originalActiveAutomateId.value;
    loadAutomateState(originalActiveAutomateId.value);
  }
  
  // Désactiver le mode vue déploiement
  isDeploymentView.value = false;
  
  toast.info('Déploiement annulé');
};

// Fonction pour confirmer le déploiement
const confirmDeployment = async () => {
  try {
    // Transformer le contrat au format requis
    const transformedContract = transformContractToRequiredFormat();
    
    // Afficher dans la console pour vérification
    console.log('Contrat transformé au format requis:');
    console.log(JSON.stringify(transformedContract, null, 2));
    
    // Afficher un toast de début de déploiement
    toast.info('Déploiement en cours, veuillez patienter...');
    
    // Appeler le service de déploiement
    const result = await ContractDeploymentService.deployContract(transformedContract);
    
    if (result.success) {
      // Déploiement réussi
      console.log('Résultat du déploiement:', result.data);
      
      // Stocker le résultat pour l'affichage dans le modal
      deploymentResult.value = result.data;
      
      // Mettre à jour le statut du contrat
      contractStatus.value = 'Actif';
      
      // Désactiver le mode vue déploiement
      isDeploymentView.value = false;
      
      // Revenir à l'automate actif original
      if (originalActiveAutomateId.value) {
        activeAutomateId.value = originalActiveAutomateId.value;
        loadAutomateState(originalActiveAutomateId.value);
      }
      
      // Mettre à jour le statut de sauvegarde
      isSaved.value = false;
      
      // Sauvegarder le contrat localement avec les informations de déploiement
      saveContract();
      
      // Afficher un message de succès
      toast.success('Contrat déployé avec succès sur la blockchain!');
      
      // Afficher le modal de résultat
      showDeploymentResultModal.value = true;
      
      // Stocker localement les informations de déploiement
      localStorage.setItem(`contract_deployment_${currentContractId.value || 'temp'}`, 
        JSON.stringify(result.data));
      
      return { success: true, data: result.data };
    } else {
      // Gérer l'échec du déploiement
      console.error('Échec du déploiement:', result.error);
      
      // Afficher un message d'erreur
      toast.error(`Échec du déploiement: ${result.error}`);
      
      return { success: false, error: result.error };
    }
  } catch (error) {
    // Gérer les erreurs générales
    console.error('Erreur lors du déploiement:', error);
    toast.error('Une erreur inattendue est survenue pendant le déploiement');
    
    return { success: false, error: error.message };
  }
};

// Fonction pour transformer le contrat au format requis
// Fonction pour normaliser un texte en nom de variable valide
const normalizeVariableName = (text) => {
  if (!text) return 'q0';
  
  // Convertir en minuscules
  let result = text.toLowerCase();
  
  // Supprimer les accents
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Remplacer les espaces et caractères spéciaux par des underscores
  result = result.replace(/[^a-z0-9_]/g, '_');
  
  // S'assurer que le résultat ne commence pas par un chiffre
  if (/^[0-9]/.test(result)) {
    result = 'q' + result;
  }
  
  // Si le résultat est vide (cas rare), utiliser un nom par défaut
  if (!result) {
    return 'q0';
  }
  
  return result;
};

// Fonction pour transformer le contrat au format requis
const transformContractToRequiredFormat = () => {
  try {
    // Structure de sortie
    const transformedContract = {
      name: contractName.value.trim() || "Test",
      automatons: {},
      required_packages: []
    };

    // Map pour suivre l'index des automates
    const automateIndexMap = {};
    let automateCounter = 0;

    // Parcourir chaque automate du contrat pour créer le mapping des index
    contractAutomates.value.forEach(automate => {
      // Ignorer l'automate de déploiement
      if (automate.id === 'flow-deploiement') return;
      
      // Attribuer un index séquentiel à cet automate
      automateIndexMap[automate.id] = automateCounter++;
    });

    // Parcourir chaque automate du contrat
    contractAutomates.value.forEach(automate => {
      // Ignorer l'automate de déploiement
      if (automate.id === 'flow-deploiement') return;
      
      // Obtenir l'index de cet automate
      const automateIndex = automateIndexMap[automate.id];
      
      // Créer un objet pour cet automate
      const automatonObj = {
        states: [],
        transitions: []
      };
      
      // Map pour stocker la correspondance entre libellés originaux et noms normalisés
      const stateNameMap = {};
      
      // Extraire les états et normaliser leurs noms
      automate.states.forEach(state => {
        const normalizedName = normalizeVariableName(state.label);
        stateNameMap[state.id] = normalizedName;
        automatonObj.states.push(normalizedName);
      });
      
      // S'assurer que "completed" est dans les états si ce n'est pas déjà le cas
      if (!automatonObj.states.includes("completed")) {
        const finalState = automate.states.find(s => s.type === 'final');
        if (finalState) {
          // Remplacement du libellé de l'état final par "completed"
          stateNameMap[finalState.id] = "completed";
          const finalStateIndex = automatonObj.states.findIndex(name => name === normalizeVariableName(finalState.label));
          if (finalStateIndex !== -1) {
            automatonObj.states[finalStateIndex] = "completed";
          } else {
            automatonObj.states.push("completed");
          }
        } else {
          // Ajouter "completed" s'il n'y a pas d'état final
          automatonObj.states.push("completed");
        }
      }

      // Extraire et transformer les transitions
      automate.transitions.forEach(transition => {
        if (transition.source && transition.target) {
          let sourceLabel = stateNameMap[transition.source] || normalizeVariableName('state');
          let targetLabel = stateNameMap[transition.target] || normalizeVariableName('state');
          
          // Si la cible est un état final, utiliser "completed"
          const targetState = automate.states.find(s => s.id === transition.target);
          if (targetState && targetState.type === 'final') {
            targetLabel = "completed";
          }
          
          // Créer un objet pour cette transition
          const transitionObj = {
            source: sourceLabel,
            destination: targetLabel,
            trigger: normalizeVariableName(transition.label),
            conditions: []
          };
          
          // Ajouter les conditions standard
          if (Array.isArray(transition.conditions)) {
            transitionObj.conditions = [...transition.conditions];
          }
          
          // Ajouter les dépendances d'automates au format "automata__AutomataX__is_completed"
          if (Array.isArray(transition.automataDependencies) && transition.automataDependencies.length > 0) {
            const automataConditions = transition.automataDependencies.map(depId => {
              const depIndex = automateIndexMap[depId];
              return `automata__Automata${depIndex}__is_completed`;
            });
            transitionObj.conditions = [...transitionObj.conditions, ...automataConditions];
          }
          
          // Ajouter cette transition à l'automate
          automatonObj.transitions.push(transitionObj);
        }
      });
      
      // Ajouter cet automate à la structure de sortie
      transformedContract.automatons[`Automata${automateIndex}`] = automatonObj;
    });
    
    // Collecter les packages utilisés
    const packagesUsed = new Set();
    
    // Parcourir toutes les conditions pour identifier les packages
    contractAutomates.value.forEach(automate => {
      automate.transitions.forEach(transition => {
        if (Array.isArray(transition.conditions)) {
          transition.conditions.forEach(conditionId => {
            // Si la condition est au format package__pX__cY
            if (conditionId.startsWith('package__')) {
              const parts = conditionId.split('__');
              if (parts.length >= 2) {
                packagesUsed.add(parts[1]);
              }
            }
          });
        }
      });
    });
    
    // Si aucun package n'est détecté, ajouter les packages par défaut comme dans l'exemple
    if (packagesUsed.size === 0) {
      packagesUsed.add('p1');
      packagesUsed.add('p2');
    }
    
    // Ajouter les packages utilisés
    transformedContract.required_packages = Array.from(packagesUsed);
    
    return transformedContract;
  } catch (error) {
    console.error('Erreur lors de la transformation du contrat:', error);
    return null;
  }
};

// Fonction pour obtenir le nom d'un nœud par son ID
const getNodeName = (nodeId) => {
  const node = currentNodes.value.find(n => n.id === nodeId);
  return node ? node.data.label : nodeId;
};


// ---- Chargement principal du contrat ----
const loadContract = async (contractId) => {
  try {
    const response = await ContractAutomatonService.getContractAutomaton(contractId);
    const contract = response.data;

    contractName.value = contract.name;
    contractStatus.value = contract.status;
    contractAutomates.value = contract.automates.map(automate => ({ ...automate }));

    currentContractId.value = contract.id;
    currentCreatedAt.value = contract.createdAt;

    if (contractAutomates.value.length > 0) {
      const activeAutomate = contractAutomates.value.find(a => a.active) || contractAutomates.value[0];
      activeAutomateId.value = activeAutomate.id;
      loadAutomateState(activeAutomate.id);
    }

    contractStore.setCurrentContract(contract);
    isSaved.value = true;
  } catch (error) {
    console.error('Erreur lors du chargement du contrat :', error);
    toast.error("Erreur lors du chargement du contrat. Redirection...");
    setTimeout(() => {
      router.push({ name: 'contracts' });
    }, 2000);
  }
};

// ---- Chargement à l'initialisation ----
onMounted(async () => {
  const contractId = route.params.id;
  const isEditMode = route.name === 'edit-contract' && contractId;

  if (isEditMode) {
    console.log('Mode édition activé, contrat:', contractId);
    await loadContract(contractId);
  } else {
    console.log('Mode création activé');
    contractName.value = '';
    contractStatus.value = 'Brouillon';
    loadAutomateState(activeAutomateId.value);
  }

  saveToHistory();
  validateAutomate();

  setTimeout(() => {
    centerGraph();
  }, 100);

  // Écouter les clics globaux pour fermer les menus contextuels
  window.addEventListener('click', () => (contextMenu.value.visible = false));
  window.addEventListener('click', () => (edgeContextMenu.value.visible = false));
});

// ---- Observer les changements de route (au cas où changement d'id sans recharger la page) ----
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      console.log('Changement de contrat détecté:', newId);
      await loadContract(newId);
    } else {
      console.log('Changement vers création');
      contractName.value = '';
      contractStatus.value = 'Brouillon';
      contractAutomates.value = [];
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
  // Ne pas traiter les clics si en mode déploiement
  if (isDeploymentView.value) return;
  
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
 * Ne pas traiter si en mode déploiement
 */
function onNodeConnect(params) {
  if (isDeploymentView.value) return;
  
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
/**
 * Met à jour les dépendances d'automates pour une transition spécifique
 * 
 * @param {Object} data - Un objet contenant l'ID de la transition et ses nouvelles dépendances d'automates
 * @param {string} data.id - L'identifiant de la transition
 * @param {string[]} data.automataDependencies - Liste des IDs des automates dépendants
 */
const updateTransitionAutomataDependencies = (data) => {
  // Trouver l'index de la transition dans la liste des transitions actuelles
  const edgeIndex = currentEdges.value.findIndex(edge => edge.id === data.id);
  
  if (edgeIndex !== -1) {
    // Créer une copie du tableau des transitions pour déclencher la réactivité de Vue
    const updatedEdges = [...currentEdges.value];
    
    // Mettre à jour la transition spécifique avec les nouvelles dépendances
    updatedEdges[edgeIndex] = {
      ...updatedEdges[edgeIndex],
      automataDependencies: data.automataDependencies
    };
    
    // Remplacer le tableau de transitions par la nouvelle version
    currentEdges.value = updatedEdges;
    
    // Sauvegarder l'état actuel dans l'historique pour permettre l'annulation/rétablissement
    saveToHistory();
    
    // Indiquer que le contrat n'est pas sauvegardé
    isSaved.value = false;
    
    // Afficher un message de confirmation
    toast.success('Dépendances de clauses mises à jour avec succès');
  }
};

// Fonction pour simuler le déploiement (utilise la fonction existante de simulation)
const simulateDeploymentFlow = async () => {
  try {
    toast.info('Simulation du déploiement en cours...');
    
    // Utiliser la fonction de simulation existante qui parcourt l'ordre topologique
    await toggleSimulation();
    
    // La fonction simulateDeployment s'occupe déjà d'afficher le modal de résultat
    // et de gérer l'animation de l'automate
  } catch (error) {
    console.error('Erreur lors de la simulation:', error);
    toast.error('Erreur lors de la simulation du déploiement');
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

