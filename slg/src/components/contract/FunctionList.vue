<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-5 transition-colors duration-300">
    <!-- En-tête -->
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white tracking-wide">
        Déclencheurs <span class="text-sm text-gray-400">({{ edges.length }})</span>
      </h2>
      <div class="flex items-center space-x-3">
        <!-- Bouton de tri -->
        <button @click="toggleSort" class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
          <LucideArrowDownUp class="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <!-- Bouton d'ajout -->
        <button 
          @click="showAddTransitionModal = true"
          class="bg-blue-500 text-white dark:bg-blue-600 dark:text-white px-3 py-1.5 rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <LucidePlus class="w-3.5 h-3.5" />
          <span class="ml-1.5 text-xs font-medium">Ajouter</span>
        </button>
      </div>
    </div>
    
    <!-- Message si vide -->
    <div v-if="edges.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
      Cliquer sur le bouton <strong>"Ajouter"</strong> pour créer un déclencheur.
    </div>
    
    <!-- Barre de recherche pour filtrer les fonctions -->
    <div v-if="edges.length > 0" class="mb-4">
      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Rechercher un déclencheur..."
          class="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500">
          <LucideSearch class="w-4 h-4" />
        </div>
      </div>
    </div>
    
    <!-- Liste des transitions avec défilement -->
    <div v-if="edges.length > 0" class="max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
      <ul class="space-y-3">
        <li 
          v-for="edge in filteredEdges" 
          :key="edge.id"
          class="relative group mb-4"
        >
          <!-- Carte de transition -->
          <div :class="[
            'flex flex-col border rounded-lg overflow-hidden shadow-sm transition-all duration-200',
            activeTransition === edge.id 
              ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900' 
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
          ]"
             @click="$emit('select-transition', edge.id)">
            <!-- En-tête avec le nom de la fonction -->
            <div :class="[
              'px-4 py-3',
              activeTransition === edge.id 
                ? 'bg-blue-500 dark:bg-blue-600' 
                : 'bg-gray-50 dark:bg-gray-800'
            ]">
              <div class="flex justify-between items-center">
                <span :class="[
                  'font-medium',
                  activeTransition === edge.id 
                    ? 'text-white' 
                    : 'text-gray-800 dark:text-gray-200'
                ]">{{ edge.label }}</span>
              </div>
            </div>
            
            <!-- Corps avec les informations de nœuds -->
            <div class="px-4 py-3 bg-white dark:bg-gray-800">
              <div class="flex items-center justify-center space-x-2 text-sm mb-2">
                <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                  {{ getNodeName(edge.source) }}
                </span>
                <LucideArrowRight class="text-blue-500 dark:text-blue-400" />
                <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                  {{ getNodeName(edge.target) }}
                </span>
              </div>
              
<div class="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
  <!-- Section Conditions -->
  <div class="mb-4">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Conditions :</span>
    </div>
    
    <!-- Liste des conditions si présentes -->
    <div v-if="edge.conditions && edge.conditions.length > 0" class="space-y-2">
      <div 
        v-for="conditionId in edge.conditions" 
        :key="conditionId"
        class="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800/50 group/condition"
      >
        <span class="text-sm text-blue-700 dark:text-blue-300 truncate pr-2">
          {{ getConditionLabel(conditionId) }}
        </span>
        <div class="flex items-center space-x-1 opacity-70 group-hover/condition:opacity-100 transition-opacity">
          <button 
            @click="openConditionInfoModal(conditionId)"
            class="p-1 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 transition-colors"
            title="Voir les détails"
          >
            <LucideInfo class="w-3.5 h-3.5" />
          </button>
          <button 
            @click="removeConditionFromTransition(edge.id, conditionId)"
            class="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 transition-colors"
            title="Retirer la condition"
          >
            <LucideX class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <!-- Bouton pour ajouter plus de conditions quand il y en a déjà -->
      <button 
        @click="openAddConditionModal(edge)"
        class="mt-2 w-full py-1.5 flex items-center justify-center text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
      >
        <LucidePlus class="w-3 h-3 mr-1" />
        Ajouter plus de conditions
      </button>
    </div>
    <!-- Bouton stylisé si aucune condition -->
    <div v-else>
      <button 
        @click="openAddConditionModal(edge)" 
        class="w-full py-2 flex items-center justify-center text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-md border border-dashed border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
      >
        <LucidePlus class="w-4 h-4 mr-2" /> 
        Ajouter des conditions
      </button>
    </div>
  </div>
  
  <!-- Section Dépendances -->
  <div>
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Dépendances de clauses :</span>
    </div>
    
    <!-- Liste des dépendances si présentes -->
    <div v-if="edge.automataDependencies && edge.automataDependencies.length > 0" class="space-y-2">
      <div 
        v-for="dependencyId in edge.automataDependencies" 
        :key="dependencyId"
        class="flex items-center justify-between px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-100 dark:border-purple-800/50 group/dependency"
      >
        <span class="text-sm text-purple-700 dark:text-purple-300 truncate pr-2">
          {{ getAutomataName(dependencyId) }}
        </span>
        <div class="flex items-center space-x-1 opacity-70 group-hover/dependency:opacity-100 transition-opacity">
          <button 
            @click="removeAutomataDependency(edge.id, dependencyId)"
            class="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 transition-colors"
            title="Retirer la dépendance"
          >
            <LucideX class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <!-- Bouton pour ajouter plus de dépendances quand il y en a déjà -->
      <button 
        @click="openAddAutomataDependencyModal(edge)"
        class="mt-2 w-full py-1.5 flex items-center justify-center text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-md border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors"
      >
        <LucidePlus class="w-3 h-3 mr-1" />
        Ajouter plus de dépendances
      </button>
    </div>
    <!-- Bouton stylisé si aucune dépendance -->
    <div v-else>
      <button 
        @click="openAddAutomataDependencyModal(edge)" 
        class="w-full py-2 flex items-center justify-center text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-md border border-dashed border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors"
      >
        <LucideGitBranch class="w-4 h-4 mr-2" /> 
        Dépendance clause
      </button>
    </div>
  </div>
</div>
            </div>
            
            <!-- Boutons d'action -->
            <div class="flex bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 divide-x divide-gray-200 dark:divide-gray-700">
              <!-- Bouton principal -->
              <button
                :class="[
                  'flex-grow py-2.5 px-3 text-sm font-medium transition-colors',
                  activeTransition === edge.id
                    ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                ]"
              >
                {{ activeTransition === edge.id ? 'Désélectionner' : 'Sélectionner' }}
              </button>
              
              <!-- Boutons d'action secondaires -->
              <div class="flex divide-x divide-gray-200 dark:divide-gray-700">
                <!-- Bouton de modification -->
                <button 
                  @click.stop="openEditModal(edge)" 
                  class="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Modifier"
                >
                  <LucidePencil class="w-4 h-4" />
                </button>
                
                <!-- Bouton d'inversion -->
                <button 
                  @click.stop="$emit('reverse-transition', edge)" 
                  class="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Inverser"
                >
                  <LucideArrowDownUp class="w-4 h-4" />
                </button>
                
                <!-- Bouton de suppression -->
                <button 
                  @click.stop="openRemoveModal(edge.id)" 
                  class="px-3 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Supprimer"
                >
                  <LucideTrash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    
    <!-- Message si aucun résultat après filtrage -->
    <div v-if="edges.length > 0 && filteredEdges.length === 0" class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
      Aucun déclencheur ne correspond à votre recherche.
    </div>
    
    <!-- Modal Ajouter Transition -->
    <Modal
      v-model="showAddTransitionModal"
      title="Ajouter un déclencheur"
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
            v-model="newTransition.source"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Sélectionner un état source</option>
            <option v-for="node in nodes" :key="node.id" :value="node.id">
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
            v-model="newTransition.target"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Sélectionner un état destination</option>
            <option v-for="node in nodes" :key="node.id" :value="node.id">
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
            v-model="newTransition.function"
            class="block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Sélectionner un déclencheur</option>
            <option v-for="func in availableFunctions" :key="func.value" :value="func.value">
              {{ func.label }}
            </option>
          </select>
        </div>
        
        <!-- Section pour les conditions -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Conditions associées
            </label>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ newTransition.conditions.length }} sélectionnée(s)
            </span>
          </div>
          
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg max-h-60 overflow-y-auto">
            <div v-for="(packageC, index) in packetCondition" :key="packageC.id" class="border-b last:border-b-0 border-gray-200 dark:border-gray-700">
              <div class="bg-gray-50 dark:bg-gray-700 px-3 py-2 font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center cursor-pointer"
                  @click="toggleNewTransitionPackage(index)">
                {{ packageC.label }}
                <div>
                  <LucideChevronDown v-if="newTransitionExpandedPackages[index]" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <LucideChevronRight v-else class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <div v-show="newTransitionExpandedPackages[index]" class="p-2 bg-white dark:bg-gray-800">
                <div v-for="condition in packageC.functions" :key="condition.id" class="mb-1 last:mb-0">
                  <label class="flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      :value="condition.id" 
                      v-model="newTransition.conditions"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ condition.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Affichage des conditions sélectionnées -->
          <div v-if="newTransition.conditions.length > 0" class="mt-3 space-y-1">
            <div 
              v-for="conditionId in newTransition.conditions" 
              :key="conditionId"
              class="flex items-center justify-between px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800/50"
            >
              <span class="text-sm text-blue-700 dark:text-blue-300 truncate pr-2">
                {{ getConditionLabel(conditionId) }}
              </span>
              <button 
                @click="removeConditionFromNewTransition(conditionId)"
                class="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 transition-colors"
                title="Retirer la condition"
              >
                <LucideX class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        
        <p v-if="modalError" class="text-sm text-red-600 dark:text-red-400 mt-2">
          {{ modalError }}
        </p>
      </div>
    </Modal>
      
    <!-- Modal Modifier Transition -->
    <Modal
      v-model="showEditModal"
      title="Modifier le déclencheur"
      confirm-text="Enregistrer"
      @confirm="confirmEdit"
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
            <option v-for="node in nodes" :key="node.id" :value="node.id">
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
            <option v-for="node in nodes" :key="node.id" :value="node.id">
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
            <option v-for="func in availableFunctions" :key="func.value" :value="func.value">
              {{ func.label }}
            </option>
          </select>
        </div>
        
        <!-- Section pour les conditions -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Conditions associées
            </label>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ editingTransition.conditions.length }} sélectionnée(s)
            </span>
          </div>
          
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg max-h-60 overflow-y-auto">
            <div v-for="(packageC, index) in packetCondition" :key="packageC.id" class="border-b last:border-b-0 border-gray-200 dark:border-gray-700">
              <div class="bg-gray-50 dark:bg-gray-700 px-3 py-2 font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center cursor-pointer"
                  @click="toggleEditingTransitionPackage(index)">
                {{ packageC.label }}
                <div>
                  <LucideChevronDown v-if="editingTransitionExpandedPackages[index]" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <LucideChevronRight v-else class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <div v-show="editingTransitionExpandedPackages[index]" class="p-2 bg-white dark:bg-gray-800">
                <div v-for="condition in packageC.functions" :key="condition.id" class="mb-1 last:mb-0">
                  <label class="flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      :value="condition.id" 
                      v-model="editingTransition.conditions"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ condition.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Affichage des conditions sélectionnées -->
          <div v-if="editingTransition.conditions.length > 0" class="mt-3 space-y-1">
            <div 
              v-for="conditionId in editingTransition.conditions" 
              :key="conditionId"
              class="flex items-center justify-between px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800/50"
            >
              <span class="text-sm text-blue-700 dark:text-blue-300 truncate pr-2">
                {{ getConditionLabel(conditionId) }}
              </span>
              <button 
                @click="removeConditionFromEditingTransition(conditionId)"
                class="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 transition-colors"
                title="Retirer la condition"
              >
                <LucideX class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        
        <p v-if="modalError" class="text-sm text-red-600 dark:text-red-400 mt-2">
          {{ modalError }}
        </p>
      </div>
    </Modal>
    
    <!-- Modal Supprimer Transition -->
    <Modal
      v-model="showRemoveModal"
      title="Supprimer le déclencheur ?"
      confirm-text="Supprimer"
      variant="danger"
      @confirm="confirmRemove"
    >
      <p class="text-gray-700 dark:text-gray-300">
        Êtes-vous sûr de vouloir supprimer ce déclencheur ? Cette action est irréversible.
      </p>
    </Modal>
    

  <!-- Modal Inverser la Transition -->
  <Modal
    v-model="showReverseModal"
    title="Inverser le déclencheur"
    confirm-text="Inverser"
    variant="warning"
    @confirm="confirmReverse"
  >
    <div class="space-y-4">
      <p class="text-gray-700 dark:text-gray-300">
        Voulez-vous inverser le sens du déclencheur ?
      </p>
      <div class="flex items-center justify-center space-x-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ getNodeName(reversingTransition.source) }}</span>
        <LucideArrowRight class="mx-2 text-blue-500" />
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ getNodeName(reversingTransition.target) }}</span>
      </div>
      <div class="flex items-center justify-center">
        <LucideArrowDown class="my-2 text-blue-500" />
      </div>
      <div class="flex items-center justify-center space-x-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ getNodeName(reversingTransition.target) }}</span>
        <LucideArrowRight class="mx-2 text-blue-500" />
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ getNodeName(reversingTransition.source) }}</span>
      </div>
    </div>
  </Modal>
  
  <!-- Modal Détails de la condition -->
  <Modal
    v-model="showConditionInfoModal"
    title="Détails de la condition"
    confirm-text="Fermer"
    @confirm="showConditionInfoModal = false"
  >
    <div v-if="selectedCondition" class="space-y-4">
      <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50">
        <h3 class="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">
          {{ selectedCondition.label }}
        </h3>
        <p class="text-blue-700 dark:text-blue-400">
          {{ selectedCondition.description }}
        </p>
        <div class="mt-3 text-sm text-blue-600 dark:text-blue-500">
          <span class="font-medium">Package :</span> {{ getConditionPackageName(selectedCondition.id) }}
        </div>
      </div>
    </div>
  </Modal>
  
  <!-- Modal Ajouter Conditions -->
  <Modal
    v-model="showAddConditionModal"
    title="Ajouter des conditions"
    confirm-text="Enregistrer"
    @confirm="confirmAddConditions"
  >
    <div class="space-y-4">
      <div v-for="(packageC, index) in packetCondition" :key="packageC.id" class="border rounded-lg overflow-hidden">
        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-2 font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center">
          {{ packageC.label }}
          <button 
            @click="togglePackage(index)" 
            class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <LucideChevronDown 
              v-if="expandedPackages[index]" 
              class="w-4 h-4 text-gray-600 dark:text-gray-400" 
            />
            <LucideChevronRight 
              v-else 
              class="w-4 h-4 text-gray-600 dark:text-gray-400" 
            />
          </button>
        </div>
        <div v-show="expandedPackages[index]" class="p-3 bg-white dark:bg-gray-800">
          <div v-for="condition in packageC.functions" :key="condition.id" class="mb-2 last:mb-0">
            <label class="flex items-center px-3 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
              <input 
                type="checkbox" 
                :value="condition.id" 
                v-model="selectedConditions"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ condition.label }}</span>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Conditions sélectionnées -->
      <div v-if="selectedConditions.length > 0" class="mt-3">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Conditions sélectionnées:
        </div>
        <div class="space-y-2">
          <div 
            v-for="conditionId in selectedConditions" 
            :key="conditionId"
            class="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800/50"
          >
            <span class="text-sm text-blue-700 dark:text-blue-300">
              {{ getConditionLabel(conditionId) }}
            </span>
            <button 
              @click="selectedConditions = selectedConditions.filter(id => id !== conditionId)"
              class="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 transition-colors"
              title="Retirer la condition"
            >
              <LucideX class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      
      <p v-if="conditionModalError" class="text-sm text-red-600 dark:text-red-400 mt-2">
        {{ conditionModalError }}
      </p>
    </div>
  </Modal>

  <!-- Modal de confirmation de suppression de condition -->
  <Modal
    v-model="showConditionRemoveModal"
    title="Supprimer la condition ?"
    confirm-text="Supprimer"
    variant="danger"
    @confirm="confirmRemoveCondition"
  >
    <div class="space-y-3">
      <p class="text-gray-700 dark:text-gray-300">
        Êtes-vous sûr de vouloir supprimer cette condition ?
      </p>
      <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
        <div class="font-medium text-blue-700 dark:text-blue-300">
          {{ removingCondition.conditionLabel }}
        </div>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Cette condition ne sera plus vérifiée lors du déclenchement de la transition.
      </p>
    </div>
  </Modal>

<!-- Modal pour ajouter des dépendances d'automates -->
<Modal
  v-model="showAutomataDependencyModal"
  title="Ajouter une dépendance de clause"
  confirm-text="Ajouter"
  @confirm="confirmAddAutomataDependency"
>
  <div class="space-y-4">
    <p class="text-sm text-gray-700 dark:text-gray-300">
      Sélectionnez une ou plusieurs clauses qui doivent être complétées avant que cette transition puisse être exécutée.
    </p>
    
    <!-- Liste des automates disponibles -->
    <div class="border border-gray-200 dark:border-gray-700 rounded-lg">
      <div v-if="availableAutomates.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
        Aucune autre clause disponible.
      </div>
      <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <div 
          v-for="automate in availableAutomates" 
          :key="automate.id"
          class="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
          @click="toggleSelectedAutomate(automate.id)"
        >
          <div class="flex items-center">
            <input
              type="checkbox"
              :value="automate.id"
              v-model="selectedAutomates"
              class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300 dark:border-gray-600"
              @click.stop
            />
            <div>
              <div class="font-medium text-gray-800 dark:text-gray-200">{{ automate.name }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">ID: {{ automate.id }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Automates sélectionnés -->
    <div v-if="selectedAutomates.length > 0" class="mt-3">
      <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Clauses sélectionnées:
      </div>
      <div class="space-y-2">
        <div 
          v-for="automateId in selectedAutomates" 
          :key="automateId"
          class="flex items-center justify-between px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-100 dark:border-purple-800/50"
        >
          <span class="text-sm text-purple-700 dark:text-purple-300">
            {{ getSelectedAutomateName(automateId) }}
          </span>
          <button 
            @click="selectedAutomates = selectedAutomates.filter(id => id !== automateId)"
            class="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 transition-colors"
            title="Retirer la dépendance"
          >
            <LucideX class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
    
    <p v-if="dependencyModalError" class="text-sm text-red-600 dark:text-red-400 mt-2">
      {{ dependencyModalError }}
    </p>
  </div>
</Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  LucidePlus, 
  LucidePencil, 
  LucideTrash2, 
  LucideArrowDownUp, 
  LucideArrowRight, 
  LucideArrowDown, 
  LucideSearch,
  LucideInfo,
  LucideX,
  LucideChevronDown,
  LucideChevronRight,
  LucideGitBranch
} from 'lucide-vue-next';
import Modal from '@/components/ui/UiModal.vue';
import toast from '@/composables/Toast/useToast';

// Props
const props = defineProps({
  // Les arêtes (transitions) actuelles de l'automate actif
  edges: {
    type: Array,
    default: () => []
  },
  // Nœuds de l'automate actif
  nodes: {
    type: Array,
    default: () => []
  },
  // Transitions disponibles à sélectionner
  availableFunctions: {
    type: Array,
    default: () => []
  },
  // Packages de conditions disponibles
  packetCondition: {
    type: Array,
    default: () => []
  },
  activeTransition: {
    type: String,
    default: null
  },
  contractAutomates: {
    type: Array,
    default: () => []
  },
  activeAutomateId: {
    type: String,
    default: ''
  },
});

// Événements émis
const emit = defineEmits([
  'select-transition', 
  'add-transition', 
  'edit-transition', 
  'remove-transition', 
  'reverse-transition',
  'update-transition-conditions',
  'update-transition-automata-dependencies'
]);

// État des packages d'expansion
const expandedPackages = ref({});

// Initialiser l'état des packages d'expansion (tous ouverts par défaut)
onMounted(() => {
  props.packetCondition.forEach((_, index) => {
    expandedPackages.value[index] = true;
  });
});

// État pour le tri
const sortAsc = ref(true);
// État pour la recherche
const searchQuery = ref('');

// États pour les modaux
const showAddTransitionModal = ref(false);
const showEditModal = ref(false);
const showRemoveModal = ref(false);
const showReverseModal = ref(false);
const showConditionInfoModal = ref(false);
const showAddConditionModal = ref(false);
const modalError = ref('');
const conditionModalError = ref('');
const removeTransitionId = ref(null);
const reversingTransition = ref({
  id: '',
  source: '',
  target: '',
  label: '',
  conditions: []
});
const showConditionRemoveModal = ref(false);
const removingCondition = ref({
  transitionId: '',
  conditionId: '',
  conditionLabel: ''
});

// Transition actuelle dont on modifie les conditions
const editingConditionsForTransition = ref({
  id: '',
  conditions: []
});

// Condition sélectionnée pour l'affichage des détails
const selectedCondition = ref(null);
const selectedConditions = ref([]);

// Nouvelle transition
const newTransition = ref({
  source: '',
  target: '',
  function: '',
  conditions: []
});

// Transition en cours d'édition
const editingTransition = ref({
  id: '',
  source: '',
  target: '',
  function: '',
  conditions: []
});

// Transitions triées - utilise directement props.edges
const sortedEdges = computed(() => {
  // S'assure que chaque edge a un tableau conditions et automataDependencies (pour la rétrocompatibilité)
  const edgesWithConditions = props.edges.map(edge => {
    return {
      ...edge,
      conditions: edge.conditions || [], // Assure un tableau de conditions
      automataDependencies: edge.automataDependencies || null // Assure la propriété automataDependencies
    };
  });
  
  return [...edgesWithConditions].sort((a, b) => {
    const comparison = sortAsc.value
      ? a.label.localeCompare(b.label)
      : b.label.localeCompare(a.label);
    
    // En cas d'égalité de label, on peut ajouter un tri secondaire
    if (comparison === 0) {
      // Tri secondaire basé sur le nombre de dépendances
      const aDependenciesCount = a.automataDependencies ? a.automataDependencies.length : 0;
      const bDependenciesCount = b.automataDependencies ? b.automataDependencies.length : 0;
      
      return sortAsc.value 
        ? aDependenciesCount - bDependenciesCount 
        : bDependenciesCount - aDependenciesCount;
    }
    
    return comparison;
  });
});

// Transitions filtrées par recherche
const filteredEdges = computed(() => {
  if (!searchQuery.value.trim()) return sortedEdges.value;
  
  const query = searchQuery.value.toLowerCase().trim();
  return sortedEdges.value.filter(edge => {
    // Recherche dans le label de la fonction
    if (edge.label.toLowerCase().includes(query)) return true;
    
    // Recherche dans les noms des états source et destination
    const sourceNode = props.nodes.find(n => n.id === edge.source);
    const targetNode = props.nodes.find(n => n.id === edge.target);
    
    const sourceName = sourceNode && sourceNode.data ? sourceNode.data.label.toLowerCase() : '';
    const targetName = targetNode && targetNode.data ? targetNode.data.label.toLowerCase() : '';
    
    // Recherche dans les conditions
    const conditionsMatch = (edge.conditions || []).some(conditionId => {
      const conditionLabel = getConditionLabel(conditionId).toLowerCase();
      return conditionLabel.includes(query);
    });
    
    // Recherche dans les dépendances d'automates
    const automataDependenciesMatch = (edge.automataDependencies || []).some(dependencyId => {
      const automateName = getAutomataName(dependencyId).toLowerCase();
      return automateName.includes(query);
    });
    
    return sourceName.includes(query) || 
           targetName.includes(query) || 
           conditionsMatch ||
           automataDependenciesMatch;
  });
});

// Obtenir le nom d'un nœud à partir de son ID
const getNodeName = (nodeId) => {
  const node = props.nodes.find(n => n.id === nodeId);
  return node && node.data ? node.data.label : nodeId;
};

// Trouver une condition à partir de son ID
const findCondition = (conditionId) => {
  for (const pkg of props.packetCondition) {
    const condition = pkg.functions.find(c => c.id === conditionId);
    if (condition) {
      return condition;
    }
  }
  return null;
};

// Obtenir le label d'une condition à partir de son ID
const getConditionLabel = (conditionId) => {
  const condition = findCondition(conditionId);
  return condition ? condition.label : conditionId;
};

// Obtenir le nom du packageC auquel appartient une condition
const getConditionPackageName = (conditionId) => {
  for (const pkg of props.packetCondition) {
    if (pkg.functions.some(c => c.id === conditionId)) {
      return pkg.label;
    }
  }
  return 'Inconnu';
};

// Inverser l'ordre de tri
const toggleSort = () => {
  sortAsc.value = !sortAsc.value;
};

// Ouvrir le modal d'édition
const openEditModal = (edge) => {
  editingTransition.value = { 
    id: edge.id,
    source: edge.source,
    target: edge.target,
    function: edge.label, // Utilisez le label comme fonction
    conditions: edge.conditions || []
  };
  modalError.value = '';
  showEditModal.value = true;
};

// Ouvrir le modal de suppression
const openRemoveModal = (id) => {
  removeTransitionId.value = id;
  showRemoveModal.value = true;
};

// Ouvrir le modal d'inversion de transition
const openReverseEdgeModal = (edge) => {
  reversingTransition.value = {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    conditions: edge.conditions || []
  };
  showReverseModal.value = true;
};

// Ouvrir le modal d'informations sur une condition
const openConditionInfoModal = (conditionId) => {
  selectedCondition.value = findCondition(conditionId);
  if (selectedCondition.value) {
    showConditionInfoModal.value = true;
  } else {
    toast.error('Condition non trouvée');
  }
};

// Ouvrir le modal d'ajout de conditions
const openAddConditionModal = (edge) => {
  editingConditionsForTransition.value = {
    id: edge.id,
    conditions: edge.conditions || []
  };
  
  // Initialiser les conditions sélectionnées
  selectedConditions.value = [...editingConditionsForTransition.value.conditions];
  
  showAddConditionModal.value = true;
};

// Basculer l'état d'expansion d'un packageC
const togglePackage = (index) => {
  expandedPackages.value[index] = !expandedPackages.value[index];
};

// Ouvrir la modale avant de supprimer une condition
const removeConditionFromTransition = (transitionId, conditionId) => {
  const condition = findCondition(conditionId);
  removingCondition.value = {
    transitionId,
    conditionId,
    conditionLabel: condition ? condition.label : conditionId
  };
  showConditionRemoveModal.value = true;
};

// Confirmer la suppression de la condition
const confirmRemoveCondition = () => {
  try {
    const { transitionId, conditionId } = removingCondition.value;
    const edge = props.edges.find(e => e.id === transitionId);
    
    if (edge && edge.conditions) {
      const updatedConditions = edge.conditions.filter(id => id !== conditionId);
      
      // Émettre un événement pour mettre à jour les conditions
      emit('update-transition-conditions', {
        id: transitionId,
        conditions: updatedConditions
      });
      
      // Fermer la modale
      showConditionRemoveModal.value = false;
      
      toast.success('Condition supprimée avec succès');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la condition:', error);
    toast.error('Erreur lors de la suppression de la condition');
  }
};

// Valider les champs de la nouvelle transition
const validateNewTransition = () => {
  if (!newTransition.value.source) {
    modalError.value = 'L\'état source est requis';
    return false;
  }
  
  if (!newTransition.value.target) {
    modalError.value = 'L\'état destination est requis';
    return false;
  }
  
  if (!newTransition.value.function) {
    modalError.value = 'Le déclencheur est requis';
    return false;
  }
  
  // Vérifier si cette connexion existe déjà
  const connectionExists = props.edges.some(
    edge => edge.source === newTransition.value.source && edge.target === newTransition.value.target
  );
  
  if (connectionExists) {
    modalError.value = 'Ce déclencheur existe déjà';
    return false;
  }
  
  return true;
};

// Confirmer l'ajout d'une transition
const confirmAddTransition = () => {
  try {
    if (!validateNewTransition()) {
      return;
    }
    
    // Récupérer le libellé de la fonction sélectionnée
    const selectedFunction = props.availableFunctions.find(f => f.value === newTransition.value.function);
    if (!selectedFunction) {
      modalError.value = 'Déclencheur invalide';
      return;
    }
    
    // Générer un ID unique pour la nouvelle transition
    const newEdgeId = `edge-${Date.now()}`;
    
    // Émettre l'événement pour ajouter la transition
    emit('add-transition', {
      id: newEdgeId,
      source: newTransition.value.source,
      target: newTransition.value.target,
      label: newTransition.value.function,
      conditions: newTransition.value.conditions
    });
    
    // Fermer le modal et réinitialiser les champs
    showAddTransitionModal.value = false;
    newTransition.value = { source: '', target: '', function: '', conditions: [] };
    modalError.value = '';
    
    toast.success('Déclencheur ajouté avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout du déclencheur:', error);
    modalError.value = 'Une erreur s\'est produite';
  }
};

// Confirmer la modification d'une transition
const confirmEdit = () => {
  try {
    // Vérifier si tous les champs sont remplis
    if (!editingTransition.value.source || !editingTransition.value.target || !editingTransition.value.function) {
      modalError.value = 'Tous les champs sont requis';
      return;
    }
    
    // Vérifier si la connexion existe déjà (en excluant celle en cours d'édition)
    const connectionExists = props.edges.some(
      edge => edge.source === editingTransition.value.source && 
           edge.target === editingTransition.value.target && 
           edge.id !== editingTransition.value.id
    );
    
    if (connectionExists) {
      modalError.value = 'Ce déclencheur existe déjà';
      return;
    }
    
    // Émettre l'événement pour modifier la transition
    emit('edit-transition', {
      id: editingTransition.value.id,
      source: editingTransition.value.source,
      target: editingTransition.value.target,
      label: editingTransition.value.function,
      conditions: editingTransition.value.conditions
    });
    
    // Fermer le modal et réinitialiser les champs
    showEditModal.value = false;
    modalError.value = '';
    
    toast.success('Déclencheur modifié avec succès');
  } catch (error) {
    console.error('Erreur lors de la modification du déclencheur:', error);
    modalError.value = 'Une erreur s\'est produite';
  }
};

// Confirmer la suppression d'une transition
const confirmRemove = () => {
  try {
    emit('remove-transition', removeTransitionId.value);
    showRemoveModal.value = false;
    removeTransitionId.value = null;
    
    toast.success('Déclencheur supprimé avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression du déclencheur:', error);
    toast.error('Erreur lors de la suppression du déclencheur');
  }
};

// Confirmer l'inversion d'une transition
const confirmReverse = () => {
  try {
    // Créer une nouvelle transition avec source/target inversés
    const reversedEdge = {
      id: `edge-reversed-${Date.now()}`, // Nouvel ID pour la transition inversée
      source: reversingTransition.value.target,
      target: reversingTransition.value.source,
      label: reversingTransition.value.label,
      conditions: reversingTransition.value.conditions // Conserver les mêmes conditions
    };
    
    // Émettre l'événement pour ajouter la transition inversée
    emit('add-transition', reversedEdge);
    
    // Fermer le modal
    showReverseModal.value = false;
    
    toast.success('Déclencheur inversé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'inversion du déclencheur:', error);
    toast.error('Erreur lors de l\'inversion du déclencheur');
  }
};

// Confirmer l'ajout de conditions à une transition
const confirmAddConditions = () => {
  try {
    // Mettre à jour les conditions de la transition
    emit('update-transition-conditions', {
      id: editingConditionsForTransition.value.id,
      conditions: selectedConditions.value
    });
    
    // Fermer le modal
    showAddConditionModal.value = false;
    conditionModalError.value = '';
    
    toast.success('Conditions mises à jour avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout des conditions:', error);
    conditionModalError.value = 'Une erreur s\'est produite';
  }
};

// État pour l'expansion des packages dans la modale d'ajout de transition
const newTransitionExpandedPackages = ref({});

// Initialiser l'état des packages d'expansion pour la modale d'ajout
onMounted(() => {
  // Initialisation pour la modale principale
  props.packetCondition.forEach((_, index) => {
    expandedPackages.value[index] = true;
  });
  
  // Initialisation pour la modale d'ajout de transition
  props.packetCondition.forEach((_, index) => {
    newTransitionExpandedPackages.value[index] = false;
  });
});

// Basculer l'état d'expansion d'un package pour la nouvelle transition
const toggleNewTransitionPackage = (index) => {
  newTransitionExpandedPackages.value[index] = !newTransitionExpandedPackages.value[index];
};

// Retirer une condition de la nouvelle transition
const removeConditionFromNewTransition = (conditionId) => {
  newTransition.value.conditions = newTransition.value.conditions.filter(id => id !== conditionId);
};

// État pour l'expansion des packages dans la modale d'édition de transition
const editingTransitionExpandedPackages = ref({});

// Initialiser l'état dans onMounted (à ajouter à la fonction existante)
onMounted(() => {
  // Initialisation pour les autres modales...
  
  // Initialisation pour la modale d'édition de transition
  props.packetCondition.forEach((_, index) => {
    editingTransitionExpandedPackages.value[index] = false;
  });
});

// Basculer l'état d'expansion d'un package pour l'édition de transition
const toggleEditingTransitionPackage = (index) => {
  editingTransitionExpandedPackages.value[index] = !editingTransitionExpandedPackages.value[index];
};

// Retirer une condition de la transition en cours d'édition
const removeConditionFromEditingTransition = (conditionId) => {
  editingTransition.value.conditions = editingTransition.value.conditions.filter(id => id !== conditionId);
};

// Ajouter ces variables d'état pour les dépendances d'automates
const showAutomataDependencyModal = ref(false);
const dependencyModalError = ref('');
const selectedAutomates = ref([]); // Modifié pour utiliser un tableau (checkbox)
const currentEdgeForDependency = ref(null);


// Propriété calculée pour obtenir la liste des automates disponibles
const availableAutomates = computed(() => {
  // Utiliser directement l'ID de l'automate actif passé via les props
  const currentAutomateId = props.activeAutomateId;
  
  // Filtrer les automates du contrat pour exclure l'automate courant
  return props.contractAutomates.filter(automate => automate.id !== currentAutomateId);
});

// Fonction pour ouvrir le modal de dépendance
const openAddAutomataDependencyModal = (edge) => {
  currentEdgeForDependency.value = edge;
  
  // Initialiser les automates sélectionnés avec ceux déjà associés à cette transition
  const currentDependencies = edge.automataDependencies || [];
  selectedAutomates.value = currentDependencies.map(depId => {
    // Extraire l'ID de l'automate depuis le format "Automata[id]"
    return depId.replace('Automata', '');
  });
  
  dependencyModalError.value = '';
  showAutomataDependencyModal.value = true;
};

// Fonction pour basculer un automate dans la sélection
const toggleSelectedAutomate = (automateId) => {
  const index = selectedAutomates.value.indexOf(automateId);
  if (index === -1) {
    selectedAutomates.value.push(automateId);
  } else {
    selectedAutomates.value.splice(index, 1);
  }
};

// Fonction pour obtenir le nom d'un automate sélectionné
const getSelectedAutomateName = (automateId) => {
  const automate = props.contractAutomates.find(a => a.id === automateId);
  return automate ? automate.name : `Automate ${automateId}`;
};

// Fonction pour confirmer l'ajout des dépendances
const confirmAddAutomataDependency = () => {
  try {
    if (selectedAutomates.value.length === 0) {
      dependencyModalError.value = 'Veuillez sélectionner au moins une clause';
      return;
    }
    
    // Créer les dépendances avec le format spécifié
    const dependencyIds = selectedAutomates.value.map(automateId => `Automata${automateId}`);
    
    // Émettre un événement pour mettre à jour les dépendances d'automates
    emit('update-transition-automata-dependencies', {
      id: currentEdgeForDependency.value.id,
      automataDependencies: dependencyIds
    });
    
    // Fermer le modal
    showAutomataDependencyModal.value = false;
    
    console.log(props.contractAutomates);
    // Afficher un message de succès
    toast.success('Dépendances de clauses ajoutées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout des dépendances:', error);
    dependencyModalError.value = 'Une erreur s\'est produite';
  }
};

// Fonction pour obtenir le nom d'un automate à partir de son ID de dépendance
const getAutomataName = (dependencyId) => {
  // Format attendu: "Automata1", nous extrayons le "1"
  const automataId = dependencyId.replace('Automata', '');
  const automate = props.contractAutomates.find(a => a.id === automataId);
  return automate ? automate.name : dependencyId;
};

// Fonction pour supprimer une dépendance d'automate
const removeAutomataDependency = (edgeId, dependencyId) => {
  try {
    // Trouver la transition
    const edge = props.edges.find(e => e.id === edgeId);
    
    if (edge && edge.automataDependencies) {
      // Filtrer pour supprimer la dépendance
      const updatedDependencies = edge.automataDependencies.filter(id => id !== dependencyId);
      
      // Émettre l'événement pour mettre à jour les dépendances
      emit('update-transition-automata-dependencies', {
        id: edgeId,
        automataDependencies: updatedDependencies
      });
      
      toast.success('Dépendance de clause supprimée');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la dépendance:', error);
    toast.error('Erreur lors de la suppression de la dépendance');
  }
};
</script>