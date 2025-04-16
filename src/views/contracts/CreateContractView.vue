<template>
    <div>

      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ contractName.trim() }}</h1>
        <button 
            @click="saveContract"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition duration-200 float-end"
            :disabled="!contractName.trim()"
          >
            <LucideSave class="h-4 w-4" />
            <span>Sauvegarder</span>
          </button>

 
  </div>
      
      <!-- Champ pour le nom du contrat et bouton de sauvegarde -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
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
      
 
        <div>
          <AutomateEditor />
        </div>
        
    
    </div>
  </template>
  
  <script setup>
  import { ref,   watch,onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useThemeStore } from '../../stores/theme';
  import { storeToRefs } from 'pinia';
  import { LucideSave } from 'lucide-vue-next';
  import AutomateEditor from '../../components/fsm/AutomateEditor.vue';

  // Router
  const router = useRouter();
  
  // Theme store
  const themeStore = useThemeStore();
  const { darkMode } = storeToRefs(themeStore);
  
  // State
  const contractName = ref('');
  const activeAutomate = ref(null);
  
  // Pour stocker les contrats créés
  const contracts = ref([]);
  
  // Récupérer les contrats du localStorage s'ils existent
  onMounted(() => {
    const savedContracts = localStorage.getItem('contracts');
    if (savedContracts) {
      contracts.value = JSON.parse(savedContracts);
    }
  });
  
  // Méthodes
  const saveContract = () => {
    // Créer un nouvel ID de contrat (simple incrément)
    const newId = contracts.value.length > 0 
      ? String(parseInt(contracts.value[contracts.value.length - 1].id) + 1).padStart(4, '0')
      : '0001';
    
    // Créer l'objet contrat selon la structure spécifiée
    const newContract = {
      id: newId,
      name: contractName.value,
      createdAt: new Date().toISOString(), // Ajouter la date de création
      status: 'Brouillon',
      automates: [
        {
          id: "01",
          name: "AUTOMATE 01",
          active: true,
          states: [
            { id: "state-1", label: "État Initial" },
            { id: "state-2", label: "État Final" }
          ],
          transitions: [
            { id: "transition-1", source: "state-1", target: "state-2", label: "terminer" }
          ]
        }
      ]
    };
    
    // Ajouter le nouveau contrat à la liste
    contracts.value.push(newContract);
    
    // Sauvegarder la liste mise à jour dans localStorage
    localStorage.setItem('contracts', JSON.stringify(contracts.value));
    
    // Afficher le contrat en console (pour débogage)
    console.log('Contrat sauvegardé:', JSON.stringify(newContract, null, 2));
    
    // Afficher une alerte pour confirmer
    alert(`Contrat "${contractName.value}" créé avec succès!`);
    
    // Rediriger vers la liste des contrats
    router.push({ name: 'contracts' });
  };
  </script>