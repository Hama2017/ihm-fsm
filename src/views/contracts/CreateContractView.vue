<template>
  <div class="h-full flex flex-col">
    <!-- En-tête avec nom du contrat et boutons d'action -->
    <div  v-if="!isFullScreen" class="flex items-center justify-between mb-6 px-1">
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
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Automates</h2>
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
      <div   class="xl:h-full flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
  Éditeur<span v-if="activeAutomateName"> : {{ activeAutomateName }}</span>
</h2>
        </div>
        
        <!-- Barre d'outils de l'éditeur -->
        <EditorToolbar 
          v-if="activeAutomateId"
          :zoom-level="zoomLevel"
          :show-minimap="showMinimap"
          :snap-to-grid="snapToGrid"
          :is-simulating="isSimulating"
          :is-full-screen="isFullScreen"
          :can-undo="canUndo"
          :can-redo="canRedo"
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
          
          <!-- Éditeur VueFlow -->
         <!-- Éditeur VueFlow avec menu contextuel intégré -->
         <VueFlow 
  v-if="activeAutomateId"
  v-model:nodes="currentNodes" 
  v-model:edges="currentEdges"
  class="h-full w-full"
  @connect="onConnectNodes"
  @edgeUpdate="onEdgeUpdate"
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
</VueFlow>

          <!-- Menu contextuel clic droit sur un nœud -->
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
     
          
          <!-- Bouton déployer (uniquement visible quand pas en plein écran) -->
          <button
            v-if="!isFullScreen && activeAutomateId && !isSimulating"
            @click="deployContract"
            :disabled="hasValidationErrors || contractStatus === 'Actif'"
            class="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-full font-medium flex items-center shadow-lg"
          >
            <LucideRocket class="w-4 h-4" />
            <span class="ml-2">Déployer</span>
          </button>
          
          <!-- Boutons de la simulation -->
          <div v-if="isSimulating" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-700 rounded-full shadow-lg p-1 flex items-center">
            <button 
              @click="resetSimulation" 
              class="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
              title="Réinitialiser"
            >
              <LucideRefreshCcw class="w-4 h-4" />
            </button>
            <span class="px-3 text-sm text-gray-600 dark:text-gray-300">Cliquez sur les états pour simuler le flux</span>
            <button 
              @click="toggleSimulation" 
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
            @click="rightPanelTab = 'states'" 
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none"
            :class="rightPanelTab === 'states' 
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'"
          >
            États
          </button>
          <button 
            @click="rightPanelTab = 'functions'" 
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none"
            :class="rightPanelTab === 'functions' 
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'"
          >
            Fonctions
          </button>
          <button 
            @click="rightPanelTab = 'analyzer'" 
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none"
            :class="rightPanelTab === 'analyzer' 
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'"
          >
            Analyse
          </button>
       
        </div>
        
        <!-- Contenu des onglets -->
        <div class="flex-grow overflow-hidden">
          <!-- Onglet États -->
          <div v-if="rightPanelTab === 'states'" class="h-full">
            <StateList
  v-model:nodes="currentNodes"
  :edges="currentEdges"
  @add-state="onAddState"
  @edit-state="onEditState"
  @remove-state="onRemoveState"
  @select-state="onSelectState"
  @open-add-modal="openAddStateModal"
  @open-edit-modal="openEditStateModal"
  @open-remove-modal="openRemoveStateModal"
  :selectedState="activeStateId"
/>
          </div>
          
          <!-- Onglet Fonctions -->
          <div v-if="rightPanelTab === 'functions'" class="h-full">
            <FunctionList 
              :edges="currentEdges"
              :nodes="currentNodes"
              :availableFunctions="availableTransitions"
              :activeTransition="activeTransitionId"
              @select-transition="selectTransition"
              @add-transition="onAddTransition"
              @edit-transition="onEditTransition"
              @remove-transition="onRemoveTransition"
            />
          </div>
          
          <!-- Onglet Analyseur -->
          <div v-if="rightPanelTab === 'analyzer'" class="h-full overflow-auto">
            <AutomatonAnalyzer 
              :nodes="currentNodes"
              :edges="currentEdges"
              :validation-errors="validationErrors"
              :cycle-path="cyclePath"
              @analyze="validateAutomate"
            />
          </div>
          
        
        </div>
      </div>
      
      <div v-else class="xl:h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div class="text-center">
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            Sélectionnez un automate pour afficher ses états et fonctions.
          </p>
          <button 
            @click="addAutomate" 
            class="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
          >
            <span class="flex items-center">
              <LucidePlus class="w-4 h-4 mr-2" />
              Créer un automate
            </span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Container pour les toasts -->
    <ToastContainer />
    
    <!-- Modals -->
    <TransitionModal 
      ref="transitionModal"
      :transitions="availableTransitions"
      @confirm="onTransitionConfirm"
    />
    
    <!-- Modal pour l'ajout/édition d'un automate -->
    <Modal
      v-model="showAutomateModal"
      :title="editingAutomateId ? 'Modifier l\'automate' : 'Nouvel automate'"
      confirm-text="Valider"
      @confirm="confirmAutomateEdit"
    >
      <div class="space-y-4">
        <label for="automate-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nom de l'automate
        </label>
        <input 
          id="automate-name"
          v-model="editingAutomateName"
          type="text"
          placeholder="ex: Processus de validation"
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <p v-if="automateModalError" class="text-sm text-red-600 dark:text-red-400">
          {{ automateModalError }}
        </p>
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

    <Modal
  v-model="showSimulationModal"
  confirm-text="Lancer"
  cancel-text="Annuler"
  title="Lancer la simulation"
  @confirm="launchSimulation"
>

  <div class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
      Êtes-vous sûr de vouloir lancer la simulation ?
    </h3>
  
  </div>

</Modal>


<Modal
  v-model="showDeploymentSummaryModal"
  title="Résumé de la simulation"
  confirm-text="Fermer"
  @confirm="closeShowDeploymentSummaryModal()"
>
  <div class="space-y-3">
    <div class="text-green-700 dark:text-green-400 font-semibold">
      Test de déploiement terminé avec succès 
    </div>
    <div class="text-sm text-gray-700 dark:text-gray-300">
      Ordre de déploiement :
    </div>
    <ul class="list-disc list-inside text-sm text-gray-800 dark:text-gray-200">
      <li v-for="stateId in deploymentResult" :key="stateId">
        {{ currentNodes.find(n => n.id === stateId)?.data.label || stateId }}
      </li>
    </ul>
  </div>
</Modal>
  </div>



  
<!-- Ajout des modals déplacés depuis StateList dans la vue parent -->
<Modal
  v-model="showAddStateModal"
  title="Ajouter un état"
  confirm-text="Ajouter"
  @confirm="confirmAddState"
>
  <div class="space-y-4">
    <label for="new-state-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Nom du nouvel état
    </label>
    <input 
      id="new-state-name"
      v-model="newStateName"
      type="text"
      placeholder="ex: EN_COURS"
      class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
    />
    <label for="new-state-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Type d'état
    </label>
    <select 
      id="new-state-type"
      v-model="newStateType"
      class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
    >
      <option value="standard">Standard</option>
      <option value="initial">Initial</option>
      <option value="final">Final</option>
    </select>
    <p v-if="addStateError" class="text-sm text-red-600 dark:text-red-400">
      {{ addStateError }}
    </p>
  </div>
</Modal>

<!-- Modal Modifier État -->
<Modal
  v-model="showEditStateModal"
  title="Modifier un état"
  confirm-text="Modifier"
  @confirm="confirmEditState"
>
  <div class="space-y-4">
    <label for="edit-state-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Nouveau nom
    </label>
    <input 
      id="edit-state-name"
      v-model="editStateName"
      type="text"
      class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
    />
    <p v-if="editStateError" class="text-sm text-red-600 dark:text-red-400">
      {{ editStateError }}
    </p>
  </div>
</Modal>

<!-- Modal Supprimer État -->
<Modal
  v-model="showRemoveStateModal"
  title="Supprimer cet état ?"
  confirm-text="Oui, supprimer"
  variant="danger"
  @confirm="confirmRemoveState"
>
  <div class="space-y-2">
    <p class="text-gray-700 dark:text-gray-300">
      Cette action est irréversible.
    </p>
    <p v-if="stateUsedInEdges" class="text-yellow-600 dark:text-yellow-400 font-medium">
      Cet état est utilisé dans une ou plusieurs transitions qui seront également supprimées.
    </p>
  </div>
</Modal>
<!-- Modal Modifier Transition -->
<Modal
  v-model="showEditTransitionModal"
  title="Modifier la transition"
  confirm-text="Enregistrer"
  @confirm="confirmEditTransition"
>
  <div class="space-y-4">
    <!-- Source -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        État source
      </label>
      <select 
        v-model="editingTransition.source"
        class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
        v-model="editingTransition.target"
        class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
        v-model="editingTransition.function"
        class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option v-for="func in availableTransitions" :key="func.value" :value="func.value">
          {{ func.label }}
        </option>
      </select>
    </div>
    
    <p v-if="editTransitionError" class="text-sm text-red-600 dark:text-red-400 mt-2">
      {{ editTransitionError }}
    </p>
  </div>
</Modal>

<!-- Modal Supprimer Transition -->
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

<!-- Modal Inverser la Transition -->
<!-- Modal Inverser la Transition -->
<Modal
  v-model="showInvertTransitionModal"
  title="Inverser la transition"
  confirm-text="Inverser"
  variant="warning"
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
</template>
  
<script setup>
import { ref, watch, computed, onMounted,onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { VueFlow, useVueFlow, Position, MarkerType } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import { Controls } from '@vue-flow/controls';
import { Background } from '@vue-flow/background';
import { 
  LucideSave, 
  LucideCheck, 
  LucideFileWarning, 
  LucideRocket, 
  LucideMaximize,
  LucideMinimize, 
  LucideUndo2, 
  LucideRedo2,
  LucideMaximize2,
  LucidePresentation,
  LucideLoader,
  LucideAlertTriangle,
  LucidePlus,
  LucideRefreshCcw,
  LucideX,
  LucideChevronsDown,
  LucideChevronsRight,
  LucideSearch,
  LucideZoomIn,
  LucideZoomOut,
  LucideArrowRight,
  LucideArrowDown,
  LucideArrowDownUp,
  LucideSquare,
  LucideCheckSquare,
  LucidePencil,
  LucideTrash2,

} from 'lucide-vue-next';

// Composants existants
import AutomateList from '@/components/fsm/AutomateList.vue';
import StateList from '@/components/fsm/StateList.vue';
import FunctionList from '@/components/fsm/FunctionList.vue';
import Modal from '@/components/ui/UiModal.vue';
import TransitionModal from '@/components/ui/UiTransitionModal.vue';
import ToastContainer from '@/components/ui/ToastContainer.vue';
import toast from '@/components/ui/ToastService';

// Nouveaux composants
import EditorToolbar from '@/components/contract/EditorToolbar.vue';
import AutomatonAnalyzer from '@/components/contract/AutomatonAnalyzer.vue';
import { InitialStateNode, FinalStateNode, StandardStateNode, nodeStyles, getNodeConfig } from '@/components/nodes/CustomNodeComponents.js';

// Imports pour le store
import { useThemeStore } from '@/stores/theme';
import { storeToRefs } from 'pinia';
import { useContractStore } from '@/stores/contractStore';










// Ajout des états réactifs pour les modals déplacés depuis StateList
const showAddStateModal = ref(false)
const showEditStateModal = ref(false)
const showRemoveStateModal = ref(false)
const newStateName = ref('')
const newStateType = ref('standard')
const editStateName = ref('')
const editStateId = ref(null)
const removeStateId = ref(null)
const addStateError = ref('')
const editStateError = ref('')
const stateUsedInEdges = ref(false)

// Nettoyage des champs lors de la fermeture des modals
watch(showAddStateModal, (newVal) => {
  if (!newVal) {
    newStateName.value = ''
    newStateType.value = 'standard'
    addStateError.value = ''
  }
})

watch(showEditStateModal, (newVal) => {
  if (!newVal) {
    editStateId.value = null
    editStateError.value = ''
  }
})

// Fonctions pour vérifier si un nom d'état existe déjà
const stateNameExists = (name, excludeId = null) => {
  return currentNodes.value.some(node => 
    node.data.label.toLowerCase() === name.toLowerCase() && 
    node.id !== excludeId
  )
}

// Gestionnaires pour les modals
const openAddStateModal = () => {
  // Réinitialiser les champs du modal
  newStateName.value = ''
  newStateType.value = 'standard'
  addStateError.value = ''
  
  // Afficher le modal
  showAddStateModal.value = true
}

const openEditStateModal = (id) => {
  try {
    const node = currentNodes.value.find(n => n.id === id)
    if (node) {
      editStateId.value = id
      editStateName.value = node.data.label
      editStateError.value = ''
      showEditStateModal.value = true
    } else {
      console.error('État non trouvé:', id)
      toast.error('État non trouvé')
    }
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du modal d\'édition:', error)
    toast.error('Impossible d\'éditer cet état')
  }
}

const openRemoveStateModal = (id) => {
  try {
    removeStateId.value = id
    stateUsedInEdges.value = checkIfStateUsedInEdges(id)
    showRemoveStateModal.value = true
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du modal de suppression:', error)
    toast.error('Impossible de supprimer cet état')
  }
}

// Vérifier si un état est utilisé dans des transitions
const checkIfStateUsedInEdges = (stateId) => {
  return currentEdges.value.some(edge => edge.source === stateId || edge.target === stateId)
}

// Actions des modals
const confirmAddState = () => {
  try {
    if (!newStateName.value || !newStateName.value.trim()) {
      addStateError.value = 'Le nom de l\'état ne peut pas être vide!'
      return
    }
    if (stateNameExists(newStateName.value)) {
      addStateError.value = 'Un état avec ce nom existe déjà!'
      return
    }
    const newId = `state-${Date.now()}`
    onAddState({ id: newId, libelle: newStateName.value.trim(), type: newStateType.value })
    showAddStateModal.value = false
    toast.success('État ajouté avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'état:', error)
    addStateError.value = 'Une erreur s\'est produite lors de l\'ajout'
  }
}

const confirmEditState = () => {
  try {
    if (!editStateName.value || !editStateName.value.trim()) {
      editStateError.value = 'Le nom de l\'état ne peut pas être vide!'
      return
    }
    if (stateNameExists(editStateName.value, editStateId.value)) {
      editStateError.value = 'Un état avec ce nom existe déjà!'
      return
    }
    onEditState({ id: editStateId.value, libelle: editStateName.value.trim() })
    showEditStateModal.value = false
    toast.success('État modifié avec succès')
  } catch (error) {
    console.error('Erreur lors de la modification de l\'état:', error)
    editStateError.value = 'Une erreur s\'est produite lors de la modification'
  }
}

const confirmRemoveState = () => {
  try {
    onRemoveState(removeStateId.value)
    showRemoveStateModal.value = false
    toast.success('État supprimé avec succès')
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'état:', error)
    toast.error('Erreur lors de la suppression de l\'état')
  }
}

// Fonctions d'édition d'état depuis le menu contextuel
const editStateFromContext = () => {
  openEditStateModal(contextMenu.value.targetId)
  contextMenu.value.visible = false
}

const deleteStateFromContext = () => {
  openRemoveStateModal(contextMenu.value.targetId)
  contextMenu.value.visible = false
}












// Import des styles VueFlow
import '@vue-flow/core/dist/style.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';

const emit = defineEmits(['collapseSideBar']);

const contractStore = useContractStore();

// Router
const router = useRouter();

// Theme store
const themeStore = useThemeStore();
const { darkMode } = storeToRefs(themeStore);

// --- États réactifs ---
const contractName = ref('');
const contractStatus = ref('Brouillon');
const contractAutomates = ref([]);
const activeAutomateId = ref(null);
const activeStateId = ref(null);
const activeTransitionId = ref(null);

// Nœuds et arêtes pour l'automate actif
const currentNodes = ref([]);
const currentEdges = ref([]);

// Références aux modals
const transitionModal = ref(null);
const showAutomateModal = ref(false);
const showEdgeUpdateModal = ref(false);
const editingAutomateId = ref(null);
const editingAutomateName = ref('');
const automateModalError = ref('');

// Variables pour la mise à jour des arêtes
const edgeUpdateData = ref(null);
const edgeUpdateSourceName = ref('');
const edgeUpdateTargetName = ref('');

// --- Nouvelles variables pour les améliorations ---
const isSaved = ref(true);
const isSaving = ref(false);
const canUndo = ref(false);
const canRedo = ref(false);
const historyStack = ref([]);
const historyIndex = ref(-1);
const isFullScreen = ref(false);
const showLeftPanel = ref(true);
const isDesktop = ref(window.innerWidth >= 1280); // xl breakpoint
const rightPanelTab = ref('states');
const zoomLevel = ref(1);
const isSimulating = ref(false);
const simulationCurrentState = ref(null);
const simulationVisitedStates = ref([]);
const newTemplateName = ref('');
const hasValidationErrors = ref(false);
const validationErrorMessage = ref('');
const cyclePath = ref([]);
const validationErrors = ref([]);
const showMinimap = ref(true);
const snapToGrid = ref(true);

// --- Liste des transitions disponibles ---
const availableTransitions = ref([
  { id: 'transition-1', value: 'valider', label: 'Valider' },
  { id: 'transition-2', value: 'refuser', label: 'Refuser' },
  { id: 'transition-3', value: 'reporter', label: 'Reporter' },
  { id: 'transition-4', value: 'annuler', label: 'Annuler' },
  { id: 'transition-5', value: 'terminer', label: 'Terminer' },
  { id: 'transition-6', value: 'suspendre', label: 'Suspendre' },
  { id: 'transition-7', value: 'reprendre', label: 'Reprendre' },
  { id: 'transition-8', value: 'commenter', label: 'Commenter' },
  { id: 'transition-9', value: 'escalader', label: 'Escalader' },
  { id: 'transition-10', value: 'transférer', label: 'Transférer' }
]);

// --- Gestion des événements VueFlow ---
const { onNodeClick, findNode, setSelectedElements, fitView, zoomTo,onViewportChange } = useVueFlow();

// --- Styles des nœuds en fonction du thème ---
const isDarkMode = computed(() => darkMode.value);

// --- Fonction de réactivité pour les appareils mobiles ---
onMounted(() => {
  window.addEventListener('resize', () => {
    isDesktop.value = window.innerWidth >= 1280;
  });
  
  window.addEventListener('click', () => (contextMenu.value.visible = false))


  
  // Injecter les styles pour les nœuds personnalisés
  injectNodeStyles();
  
  // Créer un automate par défaut
  const defaultAutomate = {
    id: '01',
    name: 'AUTOMATE 01',
    states: [
      { 
        id: 'state-1', 
        label: 'État Initial', 
        position: { x: 100, y: 150 }, 
        sourcePosition: Position.Top,
        targetPosition: Position.Bottom 
      },
      { 
        id: 'state-2', 
        label: 'État Final', 
        position: { x: 300, y: 150 }, 
        sourcePosition: Position.Top,
        targetPosition: Position.Bottom
      }
    ],
    transitions: [
      { 
        id: 'edge-1', 
        source: 'state-1', 
        target: 'state-2', 
        label: 'terminer', 
        markerEnd: MarkerType.ArrowClosed
      }
    ]
  };
  
  contractAutomates.value.push(defaultAutomate);
  
  // Sélectionner l'automate par défaut
  selectAutomate('01');
  
  // Observer les changements pour détecter les modifications non sauvegardées
  watch([currentNodes, currentEdges, contractName], () => {
    if (isSaved.value) isSaved.value = false;
  }, { deep: true });
  
  // Observer les changements de zoom
onViewportChange(({ zoom }) => {
  zoomLevel.value = zoom
});
  // Ajouter un gestionnaire pour prévenir la perte de modifications non sauvegardées
  window.addEventListener('beforeunload', (e) => {
    if (!isSaved.value) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
});

// --- Injecter les styles des nœuds personnalisés ---
const injectNodeStyles = () => {
  const styleElement = document.createElement('style');
  styleElement.textContent = nodeStyles;
  document.head.appendChild(styleElement);
};

// --- Gestion de l'historique ---
const saveToHistory = () => {
  // Tronquer l'historique si on est dans un état intermédiaire
  if (historyIndex.value < historyStack.value.length - 1) {
    historyStack.value = historyStack.value.slice(0, historyIndex.value + 1);
  }
  
  // Sauvegarder l'état actuel dans l'historique
  const currentState = {
    nodes: JSON.parse(JSON.stringify(currentNodes.value)),
    edges: JSON.parse(JSON.stringify(currentEdges.value)),
    activeStateId: activeStateId.value,
    activeTransitionId: activeTransitionId.value
  };
  
  historyStack.value.push(currentState);
  historyIndex.value = historyStack.value.length - 1;
  
  // Mettre à jour la possibilité d'annuler/rétablir
  canUndo.value = historyIndex.value > 0;
  canRedo.value = historyIndex.value < historyStack.value.length - 1;
  
  // Indiquer que des modifications ont été apportées
  isSaved.value = false;
};

const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--;
    const previousState = historyStack.value[historyIndex.value];
    
    currentNodes.value = previousState.nodes;
    currentEdges.value = previousState.edges;
    activeStateId.value = previousState.activeStateId;
    activeTransitionId.value = previousState.activeTransitionId;
    
    // Mettre à jour la possibilité d'annuler/rétablir
    canUndo.value = historyIndex.value > 0;
    canRedo.value = historyIndex.value < historyStack.value.length - 1;
    
    updateNodeStyles(activeStateId.value);
    updateEdgeStyles(activeTransitionId.value);
  }
};

const redo = () => {
  if (historyIndex.value < historyStack.value.length - 1) {
    historyIndex.value++;
    const nextState = historyStack.value[historyIndex.value];
    
    currentNodes.value = nextState.nodes;
    currentEdges.value = nextState.edges;
    activeStateId.value = nextState.activeStateId;
    activeTransitionId.value = nextState.activeTransitionId;
    
    // Mettre à jour la possibilité d'annuler/rétablir
    canUndo.value = historyIndex.value > 0;
    canRedo.value = historyIndex.value < historyStack.value.length - 1;
    
    updateNodeStyles(activeStateId.value);
    updateEdgeStyles(activeTransitionId.value);
  }
};

// --- Fonctions pour le contrôle de l'éditeur ---
const centerGraph = () => {
  fitView({ padding: 0.2 });
};

const resetZoom = () => {
  zoomTo(1);
  zoomLevel.value = 1;
};

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value;
  // Ajuster la vue après le passage en plein écran
  setTimeout(() => {
    centerGraph();
  }, 100);
};

const toggleLeftPanel = () => {
  showLeftPanel.value = !showLeftPanel.value;
};

const toggleMinimap = () => {
  showMinimap.value = !showMinimap.value;
};

const toggleGrid = () => {
  snapToGrid.value = !snapToGrid.value;
};

const zoomIn = () => {
  zoomTo(zoomLevel.value + 0.1);

  console.log('Zoom In:', zoomLevel.value);
};

const zoomOut = () => {
  zoomTo(zoomLevel.value * 0.8);
};

// --- Simulation ---
const toggleSimulation = () => {
  if (isSimulating.value) {
    // Arrêter la simulation
    isSimulating.value = false;
    simulationCurrentState.value = null;
    simulationVisitedStates.value = [];
    currentEdges.value.forEach((edge) => {
      edge.style = getBaseEdgeStyle();
    });
    toast.info('Mode simulation désactivé.');
  } else {
    // Ouvrir le modal de confirmation
    showSimulationModal.value = true;
  }
};

const resetSimulation = () => {
  // Trouver un état initial (premier état sans transitions entrantes)
  const incomingTransitions = new Set(currentEdges.value.map(edge => edge.target));
  const potentialInitialStates = currentNodes.value.filter(node => !incomingTransitions.has(node.id));
  
  if (potentialInitialStates.length > 0) {
    simulationCurrentState.value = potentialInitialStates[0].id;
  } else if (currentNodes.value.length > 0) {
    // Fallback: utiliser le premier état
    simulationCurrentState.value = currentNodes.value[0].id;
  } else {
    simulationCurrentState.value = null;
  }
  
  simulationVisitedStates.value = simulationCurrentState.value ? [simulationCurrentState.value] : [];
};

const simulateTransition = (node) => {
  if (!isSimulating.value || !simulationCurrentState.value) return;
  
  // Vérifier si la transition est valide
  const availableTransitions = currentEdges.value.filter(edge => 
    edge.source === simulationCurrentState.value && edge.target === node.id
  );
  
  if (availableTransitions.length > 0) {
    animateTransition(simulationCurrentState.value, node.id);

    simulationCurrentState.value = node.id;
    if (!simulationVisitedStates.value.includes(node.id)) {
      simulationVisitedStates.value.push(node.id);
    }
    toast.success(`Transition vers "${node.data.label}" effectuée`);
  } else if (node.id === simulationCurrentState.value) {
    // L'utilisateur a cliqué sur l'état actuel
    toast.info(`État actuel: "${node.data.label}"`);
  } else {
    // Transition non valide
    toast.error(`Transition vers "${node.data.label}" impossible`);
  }
};




// Styles de base pour les nœuds normaux
const getBaseNodeStyle = () => {
  return {
    padding: '8px 16px',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '9999px',
    transition: 'all 0.2s ease',
    backgroundColor: isDarkMode.value ? '#374151' : '#f3f4f6', // dark:bg-gray-700 : bg-gray-100
    color: isDarkMode.value ? '#d1d5db' : '#1f2937', // dark:text-gray-300 : text-gray-800
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  }
};

// Styles pour les nœuds sélectionnés
const getSelectedNodeStyle = () => {
  return {
    padding: '8px 16px',
    fontSize: '0.875rem',
    fontWeight: '600',
    borderRadius: '9999px',
    transition: 'all 0.2s ease',
    background: 'linear-gradient(to top right, #3b82f6, #1d4ed8)', // from-blue-500 to-blue-700
    color: '#ffffff', // text-white
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-lg
  }
};

// Styles pour les arêtes normales
const getBaseEdgeStyle = () => {
  return {
    stroke: isDarkMode.value ? '#6B7280' : '#9CA3AF', // gray-500 : gray-400
    strokeWidth: 2,
  };
};

// Styles pour les arêtes sélectionnées
const getSelectedEdgeStyle = () => {
  return {
    stroke: '#3B82F6', // blue-500
    strokeWidth: 3,
    animation: 'dash 1s linear infinite',
  };
};

// Mettre à jour les styles des nœuds quand le thème change
watch(isDarkMode, () => {
  updateNodeStyles(activeStateId.value);
  updateEdgeStyles(activeTransitionId.value);
});

// Mise à jour des styles de nœuds
const updateNodeStyles = (selectedId) => {
  currentNodes.value.forEach(node => {
    node.style = node.id === selectedId 
      ? getSelectedNodeStyle() 
      : getBaseNodeStyle();
  });
};

// Mise à jour des styles des arêtes
const updateEdgeStyles = (selectedId) => {
  currentEdges.value.forEach(edge => {
    edge.style = edge.id === selectedId 
      ? getSelectedEdgeStyle() 
      : getBaseEdgeStyle();
  });
};

// Sélection d'un nœud dans VueFlow
onNodeClick(({ node }) => {
  // En mode simulation, gérer la simulation
  if (isSimulating.value) {
    simulateTransition(node);
    return;
  }
  
  // Si le nœud cliqué est déjà le nœud actif, le désélectionner
  if (activeStateId.value === node.id) {
    activeStateId.value = null;
    updateNodeStyles(null);
    setSelectedElements({ nodes: [], edges: [] });
  } else {
    // Sinon, sélectionner le nouveau nœud
    activeStateId.value = node.id;
    updateNodeStyles(node.id);
  }
});

// Détection de cycle
const detectCycle = () => {
  const graph = {};
  currentNodes.value.forEach(n => { graph[n.id] = []; });
  currentEdges.value.forEach(e => { graph[e.source].push(e.target); });

  const visited = new Set();
  const stack = new Set();
  const path = [];

  const dfs = (nodeId) => {
    if (stack.has(nodeId)) {
      // On a trouvé un cycle
      const startIndex = path.indexOf(nodeId);
      cyclePath.value = path.slice(startIndex).map(id =>
        currentNodes.value.find(n => n.id === id)?.data.label || id
      );
      return true;
    }
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    stack.add(nodeId);
    path.push(nodeId);

    for (const neighbor of graph[nodeId]) {
      if (dfs(neighbor)) return true;
    }

    stack.delete(nodeId);
    path.pop();
    return false;
  };

  for (const node of Object.keys(graph)) {
    if (dfs(node)) return true;
  }

  return false;
};

// --- Fonctions pour interagir avec les automates ---
const selectAutomate = (id) => {
  if (activeAutomateId.value === id) {
    // Si on clique sur l'automate déjà actif, on le désélectionne
    activeAutomateId.value = null;
    currentNodes.value = [];
    currentEdges.value = [];
    activeStateId.value = null;
    activeTransitionId.value = null;
    return;
  }
  
  // Si on change d'automate, on sauvegarde l'état actuel si nécessaire
  if (activeAutomateId.value) {
    saveCurrentAutomateState();
  }
  
  // Puis on charge le nouvel automate
  activeAutomateId.value = id;
  loadAutomateState(id);
  
  // Réinitialiser l'état actif
  activeStateId.value = null;
  activeTransitionId.value = null;
  
  // Réinitialiser l'historique pour le nouvel automate
  historyStack.value = [];
  historyIndex.value = -1;
  canUndo.value = false;
  canRedo.value = false;
  
  // Sauvegarder l'état initial dans l'historique
  saveToHistory();
  
  // Valider l'automate
  validateAutomate();
  
  // Centrer le graphe
  setTimeout(() => {
    centerGraph();
  }, 100);
};

const addAutomate = () => {
  // Réinitialiser les champs du modal
  editingAutomateId.value = null;
  editingAutomateName.value = '';
  automateModalError.value = '';
  
  // Afficher le modal
  showAutomateModal.value = true;
};

const editAutomate = (id) => {
  const automate = contractAutomates.value.find(a => a.id === id);
  if (!automate) return;
  
  // Préremplir les champs du modal
  editingAutomateId.value = id;
  editingAutomateName.value = automate.name;
  automateModalError.value = '';
  
  // Afficher le modal
  showAutomateModal.value = true;
};

const removeAutomate = (id) => {
  // Trouver l'index de l'automate à supprimer
  const index = contractAutomates.value.findIndex(a => a.id === id);
  if (index === -1) return;
  
  // Si on supprime l'automate actif, il faut réinitialiser l'affichage
  if (activeAutomateId.value === id) {
    activeAutomateId.value = null;
    currentNodes.value = [];
    currentEdges.value = [];
    activeStateId.value = null;
    activeTransitionId.value = null;
  }
  
  // Supprimer l'automate
  contractAutomates.value.splice(index, 1);
  
  // Si c'était le dernier automate actif, sélectionner le premier disponible
  if (contractAutomates.value.length > 0 && !activeAutomateId.value) {
    selectAutomate(contractAutomates.value[0].id);
  }
  
  toast.success('Automate supprimé avec succès');
};

const confirmAutomateEdit = () => {
  // Validation
  if (!editingAutomateName.value.trim()) {
    automateModalError.value = 'Le nom de l\'automate ne peut pas être vide';
    return;
  }
  
  // Vérifier si le nom existe déjà (sauf pour l'automate en cours d'édition)
  const nameExists = contractAutomates.value.some(a => 
    a.name.toLowerCase() === editingAutomateName.value.trim().toLowerCase() && 
    a.id !== editingAutomateId.value
  );
  
  if (nameExists) {
    automateModalError.value = 'Un automate avec ce nom existe déjà';
    return;
  }
  
  if (editingAutomateId.value) {
    // Modification d'un automate existant
    const automate = contractAutomates.value.find(a => a.id === editingAutomateId.value);
    if (automate) {
      automate.name = editingAutomateName.value.trim();
      toast.success(`Automate "${automate.name}" modifié avec succès`);
    }
  } else {
    // Création d'un nouvel automate
    const newId = generateNewAutomateId();
    const newAutomate = {
      id: newId,
      name: editingAutomateName.value.trim(),
      states: [
        { 
          id: 'state-1', 
          label: 'État Initial', 
          position: { x: 100, y: 150 },
          ...getNodeConfig('initial')
        },
        { 
          id: 'state-2', 
          label: 'État Final', 
          position: { x: 300, y: 150 },
          ...getNodeConfig('final')
        }
      ],
      transitions: [
        { 
          id: 'edge-1', 
          source: 'state-1', 
          target: 'state-2', 
          label: 'terminer', 
          markerEnd: MarkerType.ArrowClosed
        }
      ]
    };
    
    contractAutomates.value.push(newAutomate);
    toast.success(`Automate "${newAutomate.name}" créé avec succès`);
    
    // Sélectionner le nouvel automate
    selectAutomate(newId);
  }
  
  // Fermer le modal
  showAutomateModal.value = false;
};

// Générer un nouvel ID pour un automate
const generateNewAutomateId = () => {
  if (contractAutomates.value.length === 0) {
    return '01';
  }
  
  // Trouver l'ID maximum et incrémenter
  const maxId = Math.max(...contractAutomates.value.map(a => parseInt(a.id)));
  return String(maxId + 1).padStart(2, '0');
};

// --- Fonctions pour interagir avec les états ---
const onAddState = (state) => {
  // Sauvegarder l'état actuel dans l'historique avant d'ajouter un état
  saveToHistory();
  
  // Générer une position aléatoire dans une zone visible
  const randomPosition = {
    x: 50 + Math.random() * 400, // Entre 50 et 450 px
    y: 50 + Math.random() * 300, // Entre 50 et 350 px
  };
  
  // Ajouter le nouvel état comme nœud standard
  currentNodes.value.push({
    id: state.id,
    position: randomPosition,
    data: { label: state.libelle },
    ...getNodeConfig(state.type),
    style: getBaseNodeStyle(),
  });
  
  // Valider l'automate après l'ajout
  validateAutomate();
  
  toast.success('État ajouté avec succès');
};

const onEditState = ({ id, libelle }) => {
  // Sauvegarder l'état actuel dans l'historique avant de modifier un état
  saveToHistory();
  
  const node = currentNodes.value.find(n => n.id === id);
  if (node) {
    node.data.label = libelle;
    
    // Mettre à jour les noms d'états dans le message d'erreur de validation si nécessaire
    if (hasValidationErrors.value) {
      validateAutomate();
    }
    
    toast.success('État modifié avec succès');
  }
};

const onRemoveState = (id) => {
  // Sauvegarder l'état actuel dans l'historique avant de supprimer un état
  saveToHistory();
  
  // Supprimer le nœud
  currentNodes.value = currentNodes.value.filter(n => n.id !== id);
  
  // Si le nœud supprimé était sélectionné, désélectionner
  if (activeStateId.value === id) {
    activeStateId.value = null;
  }
  
  // Supprimer également les connexions associées
  currentEdges.value = currentEdges.value.filter(e => e.source !== id && e.target !== id);
  
  // Valider l'automate après la suppression
  validateAutomate();
  
  toast.success('État supprimé avec succès');
};

const onSelectState = (stateId) => {
  // Si l'état est déjà sélectionné, le désélectionner
  if (activeStateId.value === stateId) {
    // Désélectionner
    activeStateId.value = null;
    updateNodeStyles(null);
    setSelectedElements({ nodes: [], edges: [] });
  } else {
    // Sélectionner le nouvel état
    activeStateId.value = stateId;
    updateNodeStyles(stateId);
    
    // Sélectionner le nœud dans VueFlow si stateId n'est pas null
    if (stateId) {
      const node = findNode(stateId);
      if (node) {
        setSelectedElements({ nodes: [node], edges: [] });
      }
    }
  }
};

// Fonctions pour ajouter différents types d'états
const addInitialState = () => {
  const id = `state-${Date.now()}`;
  const newState = {
    id,
    libelle: 'État Initial'
  };
  
  const config = getNodeConfig('initial');
  
  // Sauvegarder l'état actuel dans l'historique avant d'ajouter un état
  saveToHistory();
  
  // Générer une position
  const position = {
    x: 100,
    y: 100
  };
  
  // Ajouter le nouvel état
  currentNodes.value.push({
    id: newState.id,
    position,
    data: { label: newState.libelle },
    ...config,
    style: getBaseNodeStyle()
  });
  
  validateAutomate();
  toast.success('État initial ajouté');
};

const addStandardState = () => {
  const id = `state-${Date.now()}`;
  const newState = {
    id,
    libelle: 'Nouvel État'
  };
  
  const config = getNodeConfig('standard');
  
  // Sauvegarder l'état actuel dans l'historique avant d'ajouter un état
  saveToHistory();
  
  // Générer une position au centre visible
  const position = {
    x: 250,
    y: 150
  };
  
  // Ajouter le nouvel état
  currentNodes.value.push({
    id: newState.id,
    position,
    data: { label: newState.libelle },
    ...config,
    style: getBaseNodeStyle()
  });
  
  validateAutomate();
  toast.success('État ajouté');
};

const addFinalState = () => {
  const id = `state-${Date.now()}`;
  const newState = {
    id,
    libelle: 'État Final'
  };
  
  const config = getNodeConfig('final');
  
  // Sauvegarder l'état actuel dans l'historique avant d'ajouter un état
  saveToHistory();
  
  // Générer une position
  const position = {
    x: 400,
    y: 100
  };
  
  // Ajouter le nouvel état
  currentNodes.value.push({
    id: newState.id,
    position,
    data: { label: newState.libelle },
    ...config,
    style: getBaseNodeStyle()
  });
  
  validateAutomate();
  toast.success('État final ajouté');
};

// --- Fonctions pour interagir avec les transitions ---
const onConnectNodes = ({ source, target }) => {
  // Éviter les connexions d'un nœud à lui-même
  if (source === target) {
    toast.error('Impossible de connecter un état à lui-même');
    return;
  }
  
  // Vérifier si cette connexion existe déjà
  const connectionExists = currentEdges.value.some(
    edge => edge.source === source && edge.target === target
  );
  
  if (connectionExists) {
    toast.error('Cette transition existe déjà');
    return;
  }
  
  // Récupérer les noms des états source et cible pour le dialogue
  const sourceNode = currentNodes.value.find(node => node.id === source);
  const targetNode = currentNodes.value.find(node => node.id === target);
  const sourceName = sourceNode ? sourceNode.data.label : source;
  const targetName = targetNode ? targetNode.data.label : target;
  
  // Ouvrir le modal de sélection de transition
  transitionModal.value.open(source, target, sourceName, targetName);
};

const onTransitionConfirm = ({ source, target, transition }) => {
  // Sauvegarder l'état actuel dans l'historique avant d'ajouter une transition
  saveToHistory();
  
  const sourceNode = currentNodes.value.find(node => node.id === source);
  const targetNode = currentNodes.value.find(node => node.id === target);
  const sourceName = sourceNode ? sourceNode.data.label : source;
  const targetName = targetNode ? targetNode.data.label : target;
  
  // Générer un ID unique pour la nouvelle transition
  const newEdgeId = `edge-${Date.now()}`;
  
  // Ajouter la nouvelle transition
  const newEdge = {
    id: newEdgeId,
    source,
    target,
    label: transition,
    markerEnd: MarkerType.ArrowClosed,
    style: getBaseEdgeStyle()
  };
  
  currentEdges.value.push(newEdge);
  
  // Vérifier si l'ajout crée un cycle
  if (detectCycle()) {
    toast.error('Impossible de créer une transition : Automate Cyclique');
    // Supprimer la transition ajoutée
    currentEdges.value = currentEdges.value.filter(edge => edge.id !== newEdge.id);
    validateAutomate();
    return;
  }
  
  // Valider l'automate après l'ajout
  validateAutomate();
  
  toast.success(`Transition ajoutée: ${sourceName} → ${targetName}`);
};

const onEdgeUpdate = ({ oldEdge, newConnection }) => {
  // Récupérer les noms des états source et cible pour le dialogue
  const sourceNode = currentNodes.value.find(node => node.id === newConnection.source);
  const targetNode = currentNodes.value.find(node => node.id === newConnection.target);
  const sourceName = sourceNode ? sourceNode.data.label : newConnection.source;
  const targetName = targetNode ? targetNode.data.label : newConnection.target;
  
  // Stocker les données pour la confirmation
  edgeUpdateData.value = { oldEdge, newConnection };
  edgeUpdateSourceName.value = sourceName;
  edgeUpdateTargetName.value = targetName;
  
  // Ouvrir le modal de confirmation
  showEdgeUpdateModal.value = true;
};

const confirmEdgeUpdate = () => {
  // Sauvegarder l'état actuel dans l'historique avant de mettre à jour une arête
  saveToHistory();
  
  const { oldEdge, newConnection } = edgeUpdateData.value;
  
  // Supprimer l'ancienne connexion
  currentEdges.value = currentEdges.value.filter(e => e.id !== oldEdge.id);
  
  // Ajouter la nouvelle connexion avec le même label
  const updatedEdge = {
    ...oldEdge,
    id: `edge-${Date.now()}`,
    source: newConnection.source,
    target: newConnection.target,
  };
  
  currentEdges.value.push(updatedEdge);
  
  // Vérifier si la modification crée un cycle
  if (detectCycle()) {
    toast.error('Impossible de modifier la transition : Automate Cyclique');
    // Restaurer l'ancienne connexion
    currentEdges.value = currentEdges.value.filter(e => e.id !== updatedEdge.id);
    currentEdges.value.push(oldEdge);
    validateAutomate();
    showEdgeUpdateModal.value = false;
    return;
  }
  
  // Valider l'automate après la modification
  validateAutomate();
  
  toast.success('Transition mise à jour');
  
  // Fermer le modal
  showEdgeUpdateModal.value = false;
};

// Gestion du clic sur une arête dans VueFlow
const onEdgeClick = (params) => {
  const { edge } = params;
  
  // Si l'arête cliquée est déjà l'arête active, la désélectionner
  if (activeTransitionId.value === edge.id) {
    activeTransitionId.value = null;
    updateEdgeStyles(null);
    setSelectedElements({ nodes: [], edges: [] });
  } else {
    // Sinon, sélectionner la nouvelle arête
    activeTransitionId.value = edge.id;
    updateEdgeStyles(edge.id);
    setSelectedElements({ nodes: [], edges: [edge] });
  }
};

// --- Nouvelles fonctions pour gérer les transitions depuis FunctionList ---
const selectTransition = (id) => {
  // Si la transition est déjà sélectionnée, la désélectionner
  if (activeTransitionId.value === id) {
    activeTransitionId.value = null;
    updateEdgeStyles(null);
    setSelectedElements({ nodes: [], edges: [] });
  } else {
    // Sinon, sélectionner la nouvelle transition
    activeTransitionId.value = id;
    updateEdgeStyles(id);
    
    // Sélectionner l'arête dans VueFlow si id n'est pas null
    if (id) {
      const edge = currentEdges.value.find(e => e.id === id);
      if (edge) {
        setSelectedElements({ nodes: [], edges: [edge] });
      }
    }
  }
};

// Fonction pour ajouter une transition depuis FunctionList
const onAddTransition = (transition) => {
  try {
    // Sauvegarder l'état actuel dans l'historique avant d'ajouter une transition
    saveToHistory();
    
    // Vérification que les données nécessaires sont présentes
    if (!transition.source || !transition.target || !transition.label) {
      toast.error('Données de transition incomplètes');
      return;
    }
    
    // Verifier si c'est une transition avec lui même
    if (transition.source === transition.target) {
      toast.error('Impossible de créer une transition sur le même état');
      return;
    }
    
    // Vérifier si une transition avec le même source et target existe déjà
    const existingTransition = currentEdges.value.find(
      edge => edge.source === transition.source && edge.target === transition.target
    );
    
    if (existingTransition) {
      toast.error('Cette transition existe déjà');
      return;
    }
    
    // Ajouter la nouvelle transition au graphe
    const newTransition = {
      id: transition.id || `edge-${Date.now()}`,
      source: transition.source,
      target: transition.target,
      label: transition.label,
      markerEnd: MarkerType.ArrowClosed,
      style: getBaseEdgeStyle()
    };
    
    currentEdges.value.push(newTransition);
    
    // Vérifier si l'ajout crée un cycle
    if (detectCycle()) {
      toast.error('Impossible de créer une transition : Automate Cyclique');
      
      // Supprimer la transition ajoutée
      currentEdges.value = currentEdges.value.filter(edge => edge.id !== newTransition.id);
      validateAutomate();
      return;
    }
    
    // Valider l'automate après l'ajout
    validateAutomate();
    
    toast.success('Transition ajoutée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la transition:', error);
    toast.error('Erreur lors de l\'ajout de la transition');
  }
};

// Fonction pour modifier une transition depuis FunctionList
const onEditTransition = (transition) => {
  try {
    // Sauvegarder l'état actuel dans l'historique avant de modifier une transition
    saveToHistory();
    
    // Trouver la transition à modifier
    const index = currentEdges.value.findIndex(edge => edge.id === transition.id);
    if (index === -1) {
      toast.error('Transition non trouvée');
      return;
    }
    
    // Vérifier si la modification crée un doublon
    const isDuplicate = currentEdges.value.some(
      edge => edge.source === transition.source && 
             edge.target === transition.target && 
             edge.id !== transition.id
    );
    
    if (isDuplicate) {
      toast.error('Cette transition existe déjà');
      return;
    }
    
    // Sauvegarder l'ancienne transition pour la restaurer en cas de cycle
    const oldTransition = { ...currentEdges.value[index] };
    
    // Mise à jour de la transition
    currentEdges.value[index] = {
      ...currentEdges.value[index],
      id: transition.id,
      source: transition.source,
      target: transition.target,
      label: transition.label
    };
    
    // Force la réactivité en créant un nouveau tableau
    currentEdges.value = [...currentEdges.value];
    
    // Vérifier si la modification crée un cycle
    if (detectCycle()) {
      toast.error('Impossible de modifier la transition : Automate Cyclique');
      
      // Restaurer l'ancienne transition
      currentEdges.value[index] = oldTransition;
      currentEdges.value = [...currentEdges.value];
      validateAutomate();
      return;
    }
    
    // Valider l'automate après la modification
    validateAutomate();
    
    toast.success('Transition modifiée avec succès');
  } catch (error) {
    console.error('Erreur lors de la modification de la transition:', error);
    toast.error('Erreur lors de la modification de la transition');
  }
};

// Fonction pour supprimer une transition depuis FunctionList
const onRemoveTransition = (id) => {
  try {
    // Sauvegarder l'état actuel dans l'historique avant de supprimer une transition
    saveToHistory();
    
    // Vérifier si l'ID est valide
    if (!id) {
      toast.error('ID de transition invalide');
      return;
    }
    
    // Trouver l'index de la transition à supprimer
    const index = currentEdges.value.findIndex(edge => edge.id === id);
    if (index === -1) {
      toast.error('Transition non trouvée');
      return;
    }
    
    // Supprimer la transition
    currentEdges.value.splice(index, 1);
    
    // Si c'était la transition active, la désélectionner
    if (activeTransitionId.value === id) {
      activeTransitionId.value = null;
    }
    
    // Valider l'automate après la suppression
    validateAutomate();
    
    toast.success('Transition supprimée avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de la transition:', error);
    toast.error('Erreur lors de la suppression de la transition');
  }
};

// --- Fonctions pour sauvegarder/charger l'état des automates ---
const loadAutomateState = (automateId) => {
  const automate = contractAutomates.value.find(a => a.id === automateId);
  
  if (!automate) {
    currentNodes.value = [];
    currentEdges.value = [];
    return;
  }
  
  // Convertir les états en nœuds pour VueFlow
  currentNodes.value = automate.states.map(state => {
    // Déterminer le type de nœud en fonction des connexions
    let nodeType = 'standard';
    if (automate.transitions.some(t => t.target === state.id) && 
        !automate.transitions.some(t => t.source === state.id)) {
      nodeType = 'final';
    } else if (!automate.transitions.some(t => t.target === state.id) && 
               automate.transitions.some(t => t.source === state.id)) {
      nodeType = 'initial';
    }
    
    const config = getNodeConfig(nodeType);
    
    return {
      id: state.id,
      position: state.position || { x: 50 + Math.random() * 400, y: 50 + Math.random() * 300 },
      data: { label: state.label },
      ...config,
      style: getBaseNodeStyle(),
    };
  });
  
  // Charger les transitions
  currentEdges.value = automate.transitions.map(transition => ({
    ...transition,
    id: transition.id,
    source: transition.source,
    target: transition.target,
    label: transition.label,
    markerEnd: MarkerType.ArrowClosed,
    style: getBaseEdgeStyle(),
  }));
  
  // Mettre à jour les styles si une transition est active
  updateEdgeStyles(activeTransitionId.value);
  
  // Valider l'automate après le chargement
  validateAutomate();
};

const saveCurrentAutomateState = () => {
  if (!activeAutomateId.value) return;
  
  const automate = contractAutomates.value.find(a => a.id === activeAutomateId.value);
  
  if (!automate) return;
  
  // Convertir les nœuds en états
  automate.states = currentNodes.value.map(node => {
    // Déterminer le type de nœud
    let type = 'standard';
    if (node.type === 'initialState') type = 'initial';
    if (node.type === 'finalState') type = 'final';
    
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
  
  // Marquer comme sauvegardé
  isSaved.value = true;
};

// --- Fonction pour sauvegarder le contrat complet
const saveContract = () => {
  // Indiquer que la sauvegarde est en cours
  isSaving.value = true;

  // Validation
  if (!contractName.value.trim()) {
    toast.error('Veuillez saisir un nom de contrat');
    isSaving.value = false;
    return;
  }
  
  if (contractAutomates.value.length === 0) {
    toast.error('Veuillez créer au moins un automate');
    isSaving.value = false;
    return;
  }
  
  // Sauvegarder l'automate courant si nécessaire
  if (activeAutomateId.value) {
    saveCurrentAutomateState();
  }

  // Construire l'objet contrat selon la structure spécifiée
  const contract = {
    id: generateContractId(),
    name: contractName.value.trim(),
    status: contractStatus.value,
    automates: contractAutomates.value.map(automate => ({
      id: automate.id,
      name: automate.name,
      active: automate.id === activeAutomateId.value,
      states: automate.states,
      transitions: automate.transitions
    }))
  };
  
  // Sauvegarder dans le store
  contractStore.addContract(contract);
  
  // Simuler un délai de sauvegarde
  setTimeout(() => {
    // Afficher l'objet en console
    console.log('Contrat sauvegardé:', JSON.stringify(contract, null, 2));
    
    // Afficher un toast de succès
    toast.success('Contrat sauvegardé avec succès!');
    
    // Fin de la sauvegarde
    isSaving.value = false;
    isSaved.value = true;
    
    // Naviguer vers la liste des contrats après un court délai
    setTimeout(() => {
      router.push({ name: 'contracts' });
    }, 1000);
  }, 800);
};

// Générer un ID de contrat
const generateContractId = () => {
  // Ici on pourrait récupérer le dernier ID utilisé depuis une API
  // Pour cet exemple, on génère simplement un ID formaté avec des zéros
  return '00' + Math.floor(Math.random() * 100).toString().padStart(2, '0');
};

// Fonction pour déployer le contrat
const deployContract = () => {
  // Valider l'automate avant le déploiement
  if (!validateAutomate()) {
    toast.error('Impossible de déployer le contrat. Veuillez corriger les erreurs.');
    return;
  }
  
  // Changer le statut du contrat
  contractStatus.value = 'Actif';
  
  // Sauvegarder le contrat avec le nouveau statut
  saveContract();
  
  toast.success('Contrat déployé avec succès!');
};

// Validation de l'automate
const validateAutomate = () => {
  const errors = [];
  
  // 1. Vérifier s'il y a un cycle
  if (detectCycle()) {
    errors.push(`Cycle détecté: ${cyclePath.value.join(' -> ')}`);
  }
  
  // 2. Vérifier si tous les états ont au moins une connexion
  const isolatedNodes = currentNodes.value.filter(node => {
    const hasIncoming = currentEdges.value.some(edge => edge.target === node.id);
    const hasOutgoing = currentEdges.value.some(edge => edge.source === node.id);
    return !hasIncoming && !hasOutgoing;
  });
  
  if (isolatedNodes.length > 0) {
    const isolatedNodeNames = isolatedNodes.map(node => node.data.label).join(', ');
    errors.push(`États isolés détectés: ${isolatedNodeNames}`);
  }
  
  // 3. Vérifier s'il y a au moins un état final (sans transitions sortantes)
  const finalStates = currentNodes.value.filter(node => 
    !currentEdges.value.some(edge => edge.source === node.id)
  );
  
  if (finalStates.length === 0 && currentNodes.value.length > 0) {
    errors.push('Aucun état final détecté (état sans transitions sortantes)');
  }
  
  // Mettre à jour les erreurs de validation
  validationErrors.value = errors;
  
  // Mettre à jour l'état de validation
  hasValidationErrors.value = errors.length > 0;
  validationErrorMessage.value = errors.join(' | ');
  
  return errors.length === 0;
};


const animateTransition = (sourceId, targetId) => {
  const animatedEdge = {
    id: `animated-${Date.now()}`,
    source: sourceId,
    target: targetId,
    animated: true,
    markerEnd: MarkerType.ArrowClosed,
    style: {
      stroke: '#facc15', // jaune
      strokeWidth: 3,
      strokeDasharray: '10',
      animation: 'pulse-line 1s ease forwards'
    },
    class: 'animated-edge',
  };

  currentEdges.value.push(animatedEdge);

  setTimeout(() => {
    // Supprimer l'edge animée après 1.2s
    currentEdges.value = currentEdges.value.filter(e => e.id !== animatedEdge.id);
  }, 1200);
};


// --- Déploiement automatique par ordre topologique ---
const simulateDeployment = async () => {

  showSimulationModal.value = false;
  if (!currentNodes.value.length || !currentEdges.value.length) return;

  isSimulating.value = true;
  simulationVisitedStates.value = [];
  simulationCurrentState.value = null;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Construire le graphe des dépendances (entrantes)
  const graph = {};
  const indegree = {};
  currentNodes.value.forEach((node) => {
    graph[node.id] = [];
    indegree[node.id] = 0;
  });

  currentEdges.value.forEach((edge) => {
    graph[edge.source].push(edge.target);
    indegree[edge.target]++;
  });

  // Trouver les nœuds sans dépendances (degré d'entrée = 0)
  const queue = Object.keys(indegree).filter((id) => indegree[id] === 0);
  const deployed = new Set();
  const deploymentOrder = [];

  while (queue.length > 0) {
    const current = queue.shift();
    simulationCurrentState.value = current;
    simulationVisitedStates.value.push(current);
    deploymentOrder.push(current);

    // Colorer le nœud comme déployé
    updateNodeStyles(current);

    // Animer les transitions sortantes
    const outgoing = currentEdges.value.filter((e) => e.source === current);
    for (const edge of outgoing) {
      edge.style = {
        ...getBaseEdgeStyle(),
        stroke: '#10b981', // vert
        strokeWidth: 3,
      };
    }

    await delay(600); // Attendre avant de continuer

    for (const target of graph[current]) {
      indegree[target]--;
      if (indegree[target] === 0 && !deployed.has(target)) {
        queue.push(target);
      }
    }

    deployed.add(current);
  }

  simulationCurrentState.value = null;
  toast.success('Simulation du Déploiement terminée');
  isSimulating.value = false;

  // Afficher le résumé de la simulation
  deploymentResult.value = deploymentOrder;
  showDeploymentSummaryModal.value = true;
};


// Modal de résumé de la simulation
const showDeploymentSummaryModal = ref(false);
const deploymentResult = ref([]);
const showSimulationModal = ref(false);

// Confirmation pour lancer la simulation après le modal
const launchSimulation = () => {
  simulateDeployment();
};

const closeShowDeploymentSummaryModal = () => {
  showDeploymentSummaryModal.value = false;
  deploymentResult.value = [];
  isSimulating.value = false;
  // renitialiser les styles des nœuds et arêtes
  currentNodes.value.forEach(node => {
    node.style = getBaseNodeStyle();
  });
  currentEdges.value.forEach(edge => {
    edge.style = getBaseEdgeStyle();
  });
};

const activeAutomateName = computed(() => {
  const automate = contractAutomates.value.find(a => a.id === activeAutomateId.value);
  return automate?.name || '';
});



watch(() => isFullScreen.value, (newValue) => {
  emit('collapseSideBar', newValue);
});

// État réactif pour le menu contextuel
const contextMenu = ref({ 
  visible: false, 
  x: 0, 
  y: 0, 
  targetId: null 
})

// Gestionnaire pour le clic droit sur un nœud dans VueFlow
const onNodeRightClick = ({ event, node }) => {
  event.preventDefault()
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    targetId: node.id
  }
}

// Récupérer le libellé d'un nœud par son ID
const getNodeLabelById = (nodeId) => {
  const node = currentNodes.value.find(n => n.id === nodeId)
  return node ? node.data.label : 'État'
}

// Sélectionner un état depuis le menu contextuel
const selectStateFromContext = () => {
  const nodeId = contextMenu.value.targetId
  if (nodeId) {
    if (activeStateId.value === nodeId) {
      // Désélectionner si déjà actif
      activeStateId.value = null
      updateNodeStyles(null)
      setSelectedElements({ nodes: [], edges: [] })
    } else {
      // Sinon sélectionner
      activeStateId.value = nodeId
      updateNodeStyles(nodeId)
      const node = findNode(nodeId)
      if (node) {
        setSelectedElements({ nodes: [node], edges: [] })
      }
    }
  }
  contextMenu.value.visible = false
}

// Fermer le menu contextuel lors d'un clic en dehors
onMounted(() => {
  window.addEventListener('click', () => {
    contextMenu.value.visible = false
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('click', () => {
    contextMenu.value.visible = false
  })
})



// État réactif pour le menu contextuel des transitions
const edgeContextMenu = ref({ 
  visible: false, 
  x: 0, 
  y: 0, 
  targetId: null 
});

// Gestionnaire pour le clic droit sur une transition dans VueFlow
const onEdgeContextMenu = ({ event, edge }) => {
  event.preventDefault();
  event.stopPropagation(); // Empêcher la propagation pour éviter que le clic soit capturé par d'autres gestionnaires
  edgeContextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    targetId: edge.id
  };
  console.log('Menu contextuel ouvert pour la transition:', edge.id);
};

// Récupérer le libellé d'une transition par son ID
const getEdgeLabelById = (edgeId) => {
  const edge = currentEdges.value.find(e => e.id === edgeId);
  return edge ? edge.label : 'Transition';
};

// Sélectionner une transition depuis le menu contextuel
const selectTransitionFromContext = () => {
  const edgeId = edgeContextMenu.value.targetId;
  if (edgeId) {
    // Si la transition est déjà sélectionnée, la désélectionner
    if (activeTransitionId.value === edgeId) {
      activeTransitionId.value = null;
      updateEdgeStyles(null);
      setSelectedElements({ nodes: [], edges: [] });
    } else {
      // Sinon, sélectionner la nouvelle transition
      activeTransitionId.value = edgeId;
      updateEdgeStyles(edgeId);
      const edge = currentEdges.value.find(e => e.id === edgeId);
      if (edge) {
        setSelectedElements({ nodes: [], edges: [edge] });
      }
    }
  }
  edgeContextMenu.value.visible = false;
};

// Modifier une transition depuis le menu contextuel
const editTransitionFromContext = () => {
  const edgeId = edgeContextMenu.value.targetId;
  if (edgeId) {
    const edge = currentEdges.value.find(e => e.id === edgeId);
    if (edge) {
      // Ouvrir le modal d'édition de transition
      // Cette partie dépend de votre implémentation pour ouvrir le modal d'édition
      // Vous devez adapter cette partie selon votre code
      openEditTransitionModal(edge);
    }
  }
  edgeContextMenu.value.visible = false;
};

// Supprimer une transition depuis le menu contextuel
const deleteTransitionFromContext = () => {
  const edgeId = edgeContextMenu.value.targetId;
  if (edgeId) {
    // Ouvrir le modal de confirmation de suppression
    openRemoveTransitionModal(edgeId);
  }
  edgeContextMenu.value.visible = false;
};

// Inverser une transition depuis le menu contextuel
const invertTransitionFromContext = () => {
  const edgeId = edgeContextMenu.value.targetId;
  if (edgeId) {
    const edge = currentEdges.value.find(e => e.id === edgeId);
    if (edge) {
      // Ouvrir le modal de confirmation d'inversion
      openInvertTransitionModal(edge);
    }
  }
  edgeContextMenu.value.visible = false;
};

// Ajouter ces gestionnaires d'événements pour fermer le menu contextuel des transitions
onMounted(() => {
  // Ajout d'un gestionnaire global pour fermer le menu contextuel lors d'un clic en dehors
  const handleClickOutside = () => {
    edgeContextMenu.value.visible = false;
  };
  
  window.addEventListener('click', handleClickOutside);
  
  // Conserver la référence pour le nettoyage
  window._handleEdgeClickOutside = handleClickOutside;
});

onBeforeUnmount(() => {
  // Nettoyer l'écouteur d'événements
  if (window._handleEdgeClickOutside) {
    window.removeEventListener('click', window._handleEdgeClickOutside);
    delete window._handleEdgeClickOutside;
  }
});


// Méthodes d'aide pour ouvrir les modals de transition

// Ouvrir le modal d'édition de transition
const openEditTransitionModal = (edge) => {
  // Initialiser les données de la transition à éditer
  editingTransition.value = {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    function: edge.label // Supposons que le label est la fonction
  };
  editTransitionError.value = '';
  showEditTransitionModal.value = true;
};

// Ouvrir le modal de suppression de transition
const openRemoveTransitionModal = (edgeId) => {
  removeTransitionId.value = edgeId;
  showRemoveTransitionModal.value = true;
};

// Ouvrir le modal d'inversion de transition
const openInvertTransitionModal = (edge) => {
  invertingTransition.value = {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label
  };
  showInvertTransitionModal.value = true;
};

// États réactifs pour les modals de transition
const showEditTransitionModal = ref(false);
const showRemoveTransitionModal = ref(false);
const showInvertTransitionModal = ref(false);
const editingTransition = ref({ id: '', source: '', target: '', function: '' });
const invertingTransition = ref({ id: '', source: '', target: '', label: '' });
const removeTransitionId = ref(null);
const editTransitionError = ref('');

// Méthodes de confirmation pour les modals de transition

// Confirmer l'édition d'une transition
const confirmEditTransition = () => {
  try {
    // Vérifier si tous les champs sont remplis
    if (!editingTransition.value.source || !editingTransition.value.target || !editingTransition.value.function) {
      editTransitionError.value = 'Tous les champs sont requis';
      return;
    }
    
    // Vérifier si cette connexion existe déjà (sauf pour la transition en cours d'édition)
    const duplicateExists = currentEdges.value.some(
      edge => edge.source === editingTransition.value.source && 
             edge.target === editingTransition.value.target && 
             edge.id !== editingTransition.value.id
    );
    
    if (duplicateExists) {
      editTransitionError.value = 'Cette transition existe déjà';
      return;
    }
    
    // Mettre à jour la transition
    onEditTransition({
      id: editingTransition.value.id,
      source: editingTransition.value.source,
      target: editingTransition.value.target,
      label: editingTransition.value.function
    });
    
    // Fermer le modal
    showEditTransitionModal.value = false;
  } catch (error) {
    console.error('Erreur lors de la modification de la transition:', error);
    editTransitionError.value = 'Une erreur s\'est produite';
  }
};

// Confirmer la suppression d'une transition
const confirmRemoveTransition = () => {
  try {
    if (!removeTransitionId.value) {
      toast.error('ID de transition manquant');
      return;
    }
    
    // Supprimer la transition
    onRemoveTransition(removeTransitionId.value);
    
    // Fermer le modal
    showRemoveTransitionModal.value = false;
    removeTransitionId.value = null;
  } catch (error) {
    console.error('Erreur lors de la suppression de la transition:', error);
    toast.error('Erreur lors de la suppression');
  }
};

// Confirmer l'inversion d'une transition
const confirmInvertTransition = () => {
  try {
    if (!invertingTransition.value.id) {
      toast.error('Données de transition incomplètes');
      return;
    }
    
    // Sauvegarder l'état actuel dans l'historique avant de modifier une transition
    saveToHistory();
    
    // Vérifier si la connexion inversée existe déjà
    const connectionExists = currentEdges.value.some(
      edge => edge.source === invertingTransition.value.target && 
             edge.target === invertingTransition.value.source
    );
    
    if (connectionExists) {
      toast.error('Une transition dans ce sens existe déjà');
      return;
    }
    
    // Copie des edges actuelles
    const updatedEdges = [...currentEdges.value];
    
    // Trouver l'index de la transition à modifier
    const index = updatedEdges.findIndex(edge => edge.id === invertingTransition.value.id);
    if (index === -1) {
      toast.error('Transition non trouvée');
      return;
    }
    
    // Créer une nouvelle edge avec source et target inversés, mais conserver l'id et les autres propriétés
    const invertedEdge = {
      ...updatedEdges[index],
      id: updatedEdges[index].id, // Conserver le même ID
      source: invertingTransition.value.target,
      target: invertingTransition.value.source
    };
    
    // Remplacer l'ancienne edge par la nouvelle
    updatedEdges[index] = invertedEdge;
    
    // Mettre à jour le tableau complet (pour garantir la réactivité)
    currentEdges.value = updatedEdges;
    
    // Vérifier si l'inversion crée un cycle
    if (detectCycle()) {
      toast.error('Impossible d\'inverser la transition : créerait un automate cyclique');
      
      // Restaurer l'ancienne transition (retour à l'état avant la modification)
      currentEdges.value = historyStack.value[historyIndex.value].edges;
      validateAutomate();
      showInvertTransitionModal.value = false;
      return;
    }
    
    // Valider l'automate après la modification
    validateAutomate();
    
    // Si la transition était sélectionnée, on la maintient sélectionnée
    if (activeTransitionId.value === invertingTransition.value.id) {
      updateEdgeStyles(activeTransitionId.value);
    }
    
    // Fermer le modal
    showInvertTransitionModal.value = false;
    toast.success('Transition inversée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'inversion de la transition:', error);
    toast.error('Erreur lors de l\'inversion');
  }
};

</script>