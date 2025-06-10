<template>
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Gestion des packages</h1>
      
      <!-- Barre d'outils -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <!-- Recherche -->
          <div class="relative">
            <LucideSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Rechercher un package..."
              class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors duration-300"
            />
          </div>
        </div>
  
        <div class="flex items-center space-x-3">
          <!-- Input file caché pour l'import -->
          <input 
            type="file" 
            ref="fileInput" 
            accept=".json" 
            class="hidden" 
            @change="handleFileUpload" 
          />
          
          <!-- Bouton d'import -->
          <button 
            @click="triggerFileInput"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200 shadow-sm"
          >
            <LucideUpload class="h-4 w-4" />
            <span>Importer</span>
          </button>
          
          <!-- Nouveau package -->
          <button 
            @click="createNewPackage"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-200 shadow-sm"
          >
            <LucideFilePlus class="h-4 w-4" />
            <span>Nouveau package</span>
          </button>
        </div>
      </div>
  
      <!-- Liste des packages existants -->
      <div class="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6" v-if="packages.length && !isEditMode">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Packages disponibles</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fonctions</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="pkg in filteredPackages" :key="pkg.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ pkg.label }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">ID: {{ pkg.id }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-500 dark:text-gray-300">{{ truncateText(pkg.description, 100) }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-500 dark:text-gray-300">{{ pkg.functions.length }} fonction(s)</div>
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                  <button @click="editPackage(pkg)" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3">
                    <LucidePencil class="w-4 h-4 inline" />
                    <span class="sr-only">Modifier</span>
                  </button>
                  <button @click="openDeleteModal(pkg)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 mr-3">
                    <LucideTrash2 class="w-4 h-4 inline" />
                    <span class="sr-only">Supprimer</span>
                  </button>
                  <button @click="exportPackage(pkg)" class="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300">
                    <LucideDownload class="w-4 h-4 inline" />
                    <span class="sr-only">Exporter</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- État vide -->
        <div v-if="filteredPackages.length === 0" class="text-center py-8">
          <LucidePackage class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <p class="mt-2 text-gray-500 dark:text-gray-400">Aucun package ne correspond à votre recherche.</p>
        </div>
      </div>
  
      <!-- Formulaire d'édition/création de package -->
      <div v-if="isEditMode" class="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ isNewPackage ? 'Nouveau package' : 'Modifier le package' }}
          </h2>
          <button @click="cancelEdit" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <LucideX class="w-5 h-5" />
          </button>
        </div>
  
        <form @submit.prevent="savePackage" class="space-y-6">
          <!-- Informations générales -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom (affiché)
              </label>
              <input
                type="text"
                v-model="currentPackage.label"
                required
                placeholder="Nom du package"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Identifiant technique
              </label>
              <input
                type="text"
                v-model="currentPackage.id"
                required
                placeholder="package_id"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Identifiant unique, sans espaces ni caractères spéciaux</p>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              v-model="currentPackage.description"
              rows="3"
              placeholder="Description du package"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            ></textarea>
          </div>
  
          <!-- Onglets pour Fonctions, Variables, Structs -->
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div class="flex border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                v-for="tab in tabs"
                :key="tab.id"
                @click="currentTab = tab.id"
                :class="[
                  'px-4 py-2 text-sm font-medium border-b-2 focus:outline-none transition',
                  currentTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                ]"
              >
                {{ tab.label }}
              </button>
            </div>
  
            <!-- Fonctions -->
            <div v-if="currentTab === 'functions'" class="p-4">
              <div v-for="(func, index) in currentPackage.functions" :key="index" class="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Fonction #{{ index + 1 }}</h3>
                  <button type="button" @click="removeFunction(index)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                    <LucideTrash2 class="w-4 h-4" />
                  </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom (affiché)
                    </label>
                    <input
                      type="text"
                      v-model="func.label"
                      required
                      placeholder="Nom de la fonction"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Identifiant technique
                    </label>
                    <input
                      type="text"
                      v-model="func.id"
                      required
                      placeholder="function_id"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
                
                <div class="mb-4">
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    v-model="func.description"
                    rows="2"
                    placeholder="Description de la fonction"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  ></textarea>
                </div>
                
                <div class="mb-4">
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  </label>
                  <div class="border border-gray-300 dark:border-gray-600 rounded-lg code-editor-container overflow-hidden">
                    <div class="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-1 border-b border-gray-300 dark:border-gray-600">
                      <span class="text-xs text-gray-500 dark:text-gray-400"></span>
                      <div class="flex space-x-2">
                        <button type="button" @click="func.code = ''" class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Effacer</button>
                      </div>
                    </div>
                    <textarea
                      v-model="func.code"
                      rows="8"
                      placeholder="Entrez votre code ici"
                      class="w-full px-3 py-2 font-mono text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                    ></textarea>
                  </div>
                </div>
                
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    :id="`function-default-${index}`"
                    v-model="func.default"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label :for="`function-default-${index}`" class="ml-2 text-xs text-gray-700 dark:text-gray-300">
                    Fonction par défaut
                  </label>
                </div>
              </div>
              
              <button
                type="button"
                @click="addFunction"
                class="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-blue-600 dark:text-blue-400 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <LucidePlus class="w-4 h-4 mr-2" />
                Ajouter une fonction
              </button>
            </div>
  
            <!-- Variables -->
            <div v-if="currentTab === 'variables'" class="p-4">
              <div v-for="(variable, index) in currentPackage.variables" :key="index" class="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Variable #{{ index + 1 }}</h3>
                  <button type="button" @click="removeVariable(index)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                    <LucideTrash2 class="w-4 h-4" />
                  </button>
                </div>
                
                <div class="mb-4">
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    v-model="variable.name"
                    required
                    placeholder="Nom de la variable"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Code
                  </label>
                  <div class="border border-gray-300 dark:border-gray-600 rounded-lg code-editor-container overflow-hidden">
                    <div class="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-1 border-b border-gray-300 dark:border-gray-600">
                      <span class="text-xs text-gray-500 dark:text-gray-400"></span>
                      <div class="flex space-x-2">
                        <button type="button" @click="variable.code = ''" class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Effacer</button>
                      </div>
                    </div>
                    <textarea
                      v-model="variable.code"
                      rows="5"
                      placeholder="// Entrez votre code  ici"
                      class="w-full px-3 py-2 font-mono text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                @click="addVariable"
                class="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-blue-600 dark:text-blue-400 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <LucidePlus class="w-4 h-4 mr-2" />
                Ajouter une variable
              </button>
            </div>
  
            <!-- Structs -->
            <div v-if="currentTab === 'structs'" class="p-4">
              <div v-for="(struct, index) in currentPackage.structs" :key="index" class="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Structure #{{ index + 1 }}</h3>
                  <button type="button" @click="removeStruct(index)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                    <LucideTrash2 class="w-4 h-4" />
                  </button>
                </div>
                
                <div class="mb-4">
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    v-model="struct.name"
                    required
                    placeholder="Nom de la structure"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Code 
                  </label>
                  <div class="border border-gray-300 dark:border-gray-600 rounded-lg code-editor-container overflow-hidden">
                    <div class="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-1 border-b border-gray-300 dark:border-gray-600">
                      <span class="text-xs text-gray-500 dark:text-gray-400"></span>
                      <div class="flex space-x-2">
                        <button type="button" @click="struct.code = ''" class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Effacer</button>
                      </div>
                    </div>
                    <textarea
                      v-model="struct.code"
                      rows="5"
                      placeholder="// Entrez votre code ici"
                      class="w-full px-3 py-2 font-mono text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                @click="addStruct"
                class="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-blue-600 dark:text-blue-400 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <LucidePlus class="w-4 h-4 mr-2" />
                Ajouter une structure
              </button>
            </div>
          </div>
  
          <!-- Boutons d'action -->
          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="cancelEdit"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {{ isNewPackage ? 'Créer le package' : 'Mettre à jour' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  
    <!-- Modal suppression -->
    <Modal
      v-model="showDeleteModal"
      title="Supprimer le package"
      confirm-text="Supprimer"
      variant="danger"
      @confirm="confirmDeletePackage"
    >
      <p class="text-gray-700 dark:text-gray-300">
        Êtes-vous sûr de vouloir supprimer le package <span class="font-medium">{{ packageToDelete?.label }}</span> ?
      </p>
      <p class="mt-2 text-gray-600 dark:text-gray-400 text-sm">
        Cette action est irréversible et supprimera définitivement le package et toutes ses fonctions associées.
      </p>
    </Modal>
  
    <!-- Toast container -->
    <UiToastContainer />
  </template>
  
  <script setup>
  import { ref, computed, reactive, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { useThemeStore } from '@/stores/theme';
  import {
    LucideSearch,
    LucideFilePlus,
    LucidePencil,
    LucideTrash2,
    LucideDownload,
    LucidePackage,
    LucidePlus,
    LucideX,
    LucideUpload
  } from 'lucide-vue-next';
  import Modal from '@/components/ui/UiModal.vue';
  import UiToastContainer from '@/components/ui/UiToastContainer.vue';
  import toast from '@/composables/Toast/useToast';
  
  // Router
  const router = useRouter();
  
  // Theme
  const themeStore = useThemeStore();
  const { darkMode } = storeToRefs(themeStore);
  
  // État local
  const packages = ref([]);
  const searchQuery = ref('');
  const isEditMode = ref(false);
  const isNewPackage = ref(false);
  const currentTab = ref('functions');
  const showDeleteModal = ref(false);
  const packageToDelete = ref(null);
  const fileInput = ref(null);
  
  // Structure par défaut pour un nouveau package
  const defaultPackage = {
    id: '',
    name: '',
    label: '',
    description: '',
    functions: [],
    variables: [],
    structs: []
  };
  
  // Package en cours d'édition
  const currentPackage = reactive({ ...defaultPackage });
  
  // Définition des onglets
  const tabs = [
    { id: 'functions', label: 'Fonctions' },
    { id: 'variables', label: 'Variables' },
    { id: 'structs', label: 'Structures' }
  ];
  
  // Packages filtrés par la recherche
  const filteredPackages = computed(() => {
    if (!searchQuery.value) return packages.value;
    
    const query = searchQuery.value.toLowerCase();
    return packages.value.filter(pkg => 
      pkg.label.toLowerCase().includes(query) || 
      pkg.description.toLowerCase().includes(query) ||
      pkg.id.toLowerCase().includes(query)
    );
  });
  
  // Charger les packages depuis le stockage
  const loadPackages = async () => {
    try {
      // Dans un scénario réel, vous feriez un appel à une API ou liriez un fichier
      // Pour cet exemple, nous simulons un chargement
      const storedPackages = localStorage.getItem('slc_packages');
      if (storedPackages) {
        const parsedPackages = JSON.parse(storedPackages);
        
        // Convertir les packages du format d'export au format interne
        packages.value = parsedPackages.map(pkg => {
          // Convertir les fonctions de l'objet au tableau
          const functionsArray = [];
          if (pkg.functions && typeof pkg.functions === 'object') {
            for (const [funcId, funcDetails] of Object.entries(pkg.functions)) {
              functionsArray.push({
                id: funcId,
                name: funcId,
                label: funcDetails.label || funcId,
                description: funcDetails.description || '',
                code: funcDetails.code || '',
                default: funcDetails.default || false
              });
            }
          }
          
          return {
            id: pkg.name,
            name: pkg.name,
            label: pkg.label,
            description: pkg.description,
            functions: functionsArray,
            variables: pkg.variables || [],
            structs: pkg.structs || []
          };
        });
      }
      
      // Si aucun package n'existe, ajoutons quelques exemples
      if (!packages.value.length) {
        const defaultPackage = {
          name: "payment_service",
          label: "Service de Paiement",
          description: "Gère les opérations de paiement et de vérification financière dans les contrats intelligents.",
          functions: {
            "process_payment": {
              code: "function processPayment(address _from, address _to, uint256 _amount) public {\n  require(_amount > 0, \"Le montant doit être supérieur à zéro\");\n  // Logique de traitement du paiement\n}",
              default: true,
              label: "Traiter Paiement",
              description: "Traite un paiement entre deux parties."
            }
          },
          structs: [
            {
              name: "Payment",
              code: "struct Payment {\n  address sender;\n  address receiver;\n  uint256 amount;\n  uint256 timestamp;\n  bool completed;\n}"
            }
          ],
          variables: [
            {
              name: "paymentStatus",
              code: "mapping(address => bool) public paymentStatus;"
            }
          ]
        };
        
        // Convertir au format interne
        packages.value = [{
          id: defaultPackage.name,
          name: defaultPackage.name,
          label: defaultPackage.label,
          description: defaultPackage.description,
          functions: Object.entries(defaultPackage.functions).map(([id, func]) => ({
            id,
            name: id,
            label: func.label,
            description: func.description,
            code: func.code,
            default: func.default
          })),
          variables: defaultPackage.variables,
          structs: defaultPackage.structs
        }];
        
        // Enregistrer dans localStorage au format exporté
        const packagesToStore = packages.value.map(pkg => {
          const functions = {};
          pkg.functions.forEach(func => {
            functions[func.id] = {
              code: func.code,
              default: func.default,
            label: func.label,
            description: func.description
          };
        });
        
        return {
          name: pkg.name,
          label: pkg.label,
          description: pkg.description,
          functions,
          variables: pkg.variables,
          structs: pkg.structs
        };
      });
      
      localStorage.setItem('slc_packages', JSON.stringify(packagesToStore));
    }
  } catch (error) {
    console.error('Erreur lors du chargement des packages:', error);
    toast.error('Erreur lors du chargement des packages');
  }
};

// Sauvegarder les packages
const savePackages = async () => {
  try {
    // Convertir les packages du format interne au format d'export
    const packagesToStore = packages.value.map(pkg => {
      const functions = {};
      pkg.functions.forEach(func => {
        functions[func.id] = {
          code: func.code,
          default: func.default,
          label: func.label,
          description: func.description
        };
      });
      
      return {
        name: pkg.name,
        label: pkg.label,
        description: pkg.description,
        functions,
        variables: pkg.variables,
        structs: pkg.structs
      };
    });
    
    localStorage.setItem('slc_packages', JSON.stringify(packagesToStore));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des packages:', error);
    toast.error('Erreur lors de la sauvegarde des packages');
    return false;
  }
};

// Créer un nouveau package
const createNewPackage = () => {
  // Réinitialiser le package courant
  Object.assign(currentPackage, defaultPackage);
  currentPackage.id = '';
  currentPackage.name = '';
  currentPackage.label = '';
  currentPackage.description = '';
  currentPackage.functions = [];
  currentPackage.variables = [];
  currentPackage.structs = [];
  
  // Ajouter une fonction vide par défaut
  addFunction();
  
  isNewPackage.value = true;
  isEditMode.value = true;
  currentTab.value = 'functions';
};

// Modifier un package existant
const editPackage = (pkg) => {
  // Copier le package pour l'édition
  Object.assign(currentPackage, JSON.parse(JSON.stringify(pkg)));
  
  isNewPackage.value = false;
  isEditMode.value = true;
  currentTab.value = 'functions';
};

// Annuler l'édition
const cancelEdit = () => {
  isEditMode.value = false;
  // Réinitialiser le package courant
  Object.assign(currentPackage, defaultPackage);
};

// Sauvegarder un package
const savePackage = async () => {
  try {
    // Valider les champs requis
    if (!currentPackage.id || !currentPackage.label) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // S'assurer que l'ID est unique pour les nouveaux packages
    if (isNewPackage.value && packages.value.some(p => p.id === currentPackage.id)) {
      toast.error('Un package avec cet identifiant existe déjà');
      return;
    }

    // Assigner le nom (même valeur que l'id pour la compatibilité)
    currentPackage.name = currentPackage.id;

    // Copie profonde du package en cours d'édition
    const packageToSave = JSON.parse(JSON.stringify(currentPackage));

    if (isNewPackage.value) {
      // Ajouter le nouveau package
      packages.value.push(packageToSave);
      toast.success('Package créé avec succès');
    } else {
      // Mettre à jour le package existant
      const index = packages.value.findIndex(p => p.id === packageToSave.id);
      if (index !== -1) {
        packages.value[index] = packageToSave;
        toast.success('Package mis à jour avec succès');
      }
    }

    // Sauvegarder les changements
    await savePackages();
    
    // Quitter le mode édition
    isEditMode.value = false;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du package:', error);
    toast.error('Erreur lors de la sauvegarde du package');
  }
};

// Ouvrir le modal de suppression
const openDeleteModal = (pkg) => {
  packageToDelete.value = pkg;
  showDeleteModal.value = true;
};

// Confirmer la suppression d'un package
const confirmDeletePackage = async () => {
  if (!packageToDelete.value) return;
  
  try {
    // Supprimer le package
    packages.value = packages.value.filter(p => p.id !== packageToDelete.value.id);
    
    // Sauvegarder les changements
    await savePackages();
    
    toast.success(`Le package "${packageToDelete.value.label}" a été supprimé`);
    
    // Fermer le modal
    showDeleteModal.value = false;
    packageToDelete.value = null;
  } catch (error) {
    console.error('Erreur lors de la suppression du package:', error);
    toast.error('Erreur lors de la suppression du package');
  }
};

// Exporter un package
const exportPackage = (pkg) => {
  try {
    // Créer une copie du package pour la transformation
    const exportData = {
      name: pkg.name,
      label: pkg.label,
      description: pkg.description,
      functions: {},  // Objet au lieu d'un tableau
      structs: pkg.structs,
      variables: pkg.variables
    };
    
    // Transformer le tableau de fonctions en objet
    pkg.functions.forEach(func => {
      // Utiliser l'ID de la fonction comme clé dans l'objet
      exportData.functions[func.id] = {
        code: func.code,
        default: func.default,
        label: func.label,
        description: func.description
      };
    });
    
    // Créer un blob avec le contenu JSON
    const content = JSON.stringify(exportData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    
    // Créer un lien pour télécharger le fichier
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pkg.id}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Nettoyer
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    toast.success(`Package "${pkg.label}" exporté avec succès`);
  } catch (error) {
    console.error('Erreur lors de l\'exportation du package:', error);
    toast.error('Erreur lors de l\'exportation du package');
  }
};

// Déclencher le clic sur l'input file
const triggerFileInput = () => {
  fileInput.value.click();
};

// Fonction d'import de package
const importPackage = async (file) => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          // Lire le contenu JSON du fichier
          const content = event.target.result;
          const importedData = JSON.parse(content);
          
          // Créer une structure pour le package interne
          const internalPackage = {
            id: importedData.name || '',
            name: importedData.name || '',
            label: importedData.label || '',
            description: importedData.description || '',
            functions: [],  // Tableau vide pour les fonctions
            variables: Array.isArray(importedData.variables) ? importedData.variables : [],
            structs: Array.isArray(importedData.structs) ? importedData.structs : []
          };
          
          // Convertir l'objet de fonctions en tableau
          if (importedData.functions && typeof importedData.functions === 'object') {
            for (const [funcId, funcDetails] of Object.entries(importedData.functions)) {
              internalPackage.functions.push({
                id: funcId,
                name: funcId,  // Utiliser l'ID comme nom par défaut
                label: funcDetails.label || funcId,
                description: funcDetails.description || '',
                code: funcDetails.code || '',
                default: funcDetails.default || false
              });
            }
          }
          
          // Résoudre la promesse avec le package au format interne
          resolve(internalPackage);
          toast.success(`Package "${internalPackage.label}" importé avec succès`);
        } catch (error) {
          console.error('Erreur lors du parsing du fichier JSON:', error);
          reject(new Error('Format de fichier invalide. Veuillez sélectionner un fichier JSON valide.'));
          toast.error('Erreur lors de l\'import: format de fichier invalide');
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
        toast.error('Erreur lors de la lecture du fichier');
      };
      
      // Lire le fichier comme texte
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('Erreur lors de l\'import du package:', error);
    toast.error(`Erreur lors de l'import: ${error.message}`);
    throw error;
  }
};

// Gérer le téléchargement de fichier
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  
  if (!file) return;
  
  if (file.type !== 'application/json') {
    toast.error('Veuillez sélectionner un fichier JSON valide');
    return;
  }
  
  try {
    // Importer le package
    const importedPackage = await importPackage(file);
    
    // Vérifier si un package avec le même ID existe déjà
    const existingIndex = packages.value.findIndex(p => p.id === importedPackage.id);
    
    if (existingIndex !== -1) {
      // Vous pourriez demander une confirmation à l'utilisateur ici
      // Pour l'exemple, nous remplaçons simplement le package existant
      packages.value[existingIndex] = importedPackage;
      toast.warning(`Le package "${importedPackage.label}" a été mis à jour`);
    } else {
      // Ajouter le nouveau package
      packages.value.push(importedPackage);
      toast.success(`Le package "${importedPackage.label}" a été importé`);
    }
    
    // Enregistrer les packages mis à jour
    await savePackages();
    
    // Réinitialiser l'input file
    event.target.value = null;
  } catch (error) {
    console.error('Erreur lors de l\'import du package:', error);
    toast.error(`Erreur lors de l'import: ${error.message}`);
  }
};

// Ajouter une fonction
const addFunction = () => {
  currentPackage.functions.push({
    id: '',
    name: '',
    label: '',
    description: '',
    code: '',
    default: false
  });
};

// Supprimer une fonction
const removeFunction = (index) => {
  currentPackage.functions.splice(index, 1);
};

// Ajouter une variable
const addVariable = () => {
  currentPackage.variables.push({
    name: '',
    code: ''
  });
};

// Supprimer une variable
const removeVariable = (index) => {
  currentPackage.variables.splice(index, 1);
};

// Ajouter une struct
const addStruct = () => {
  currentPackage.structs.push({
    name: '',
    code: ''
  });
};

// Supprimer une struct
const removeStruct = (index) => {
  currentPackage.structs.splice(index, 1);
};

// Tronquer un texte
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Charger les packages au montage du composant
loadPackages();

// Surveiller les changements dans le thème
watch(darkMode, () => {
  // Mettre à jour l'apparence des éditeurs de code si nécessaire
  // (Si vous intégrez un vrai éditeur de code comme Monaco, CodeMirror, etc.)
});
</script>

<style scoped>
.code-editor-container {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
}

/* Style pour les champs textarea en mode éditeur de code */
.code-editor-container textarea {
  resize: none;
}

/* Ajout d'un peu de style pour simuler la coloration syntaxique (basique) */
/* Pour une vraie coloration syntaxique, vous devriez utiliser un éditeur dédié comme Monaco ou CodeMirror */
</style>