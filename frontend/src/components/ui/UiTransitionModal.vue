<template>
  <Modal 
    v-model="isOpen"
    title="Nouvelle transition"
    @confirm="confirmTransition"
    :confirm-text="'Ajouter'"
  >
    <div class="space-y-4">
      <!-- Source et destination -->
      <div class="text-sm space-y-3">
        <div class="flex items-center">
          <span class="font-medium w-24 text-gray-700 dark:text-gray-300">De:</span>
          <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
            {{ sourceName }}
          </span>
        </div>
        <div class="flex items-center">
          <span class="font-medium w-24 text-gray-700 dark:text-gray-300">Vers:</span>
          <span class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
            {{ targetName }}
          </span>
        </div>
      </div>
      
      <!-- Sélection de transition -->
      <div class="space-y-2">
        <label for="transition-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Sélectionner une transition:
        </label>
        <select 
          id="transition-select"
          v-model="selectedTransition"
          class="block w-full px-3 py-2 text-sm border rounded-md shadow-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                  border-gray-300 bg-white text-gray-900
                  dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="" disabled>Choisir une transition</option>
          <option v-for="transition in transitions" :key="transition.value" :value="transition.value">
            {{ transition.label }}
          </option>
        </select>
        <p v-if="validationError" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ validationError }}
        </p>
      </div>
      
      <!-- NOUVEAU: Section pour les conditions -->
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Conditions associées
          </label>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ selectedConditions.length }} sélectionnée(s)
          </span>
        </div>
        
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg max-h-60 overflow-y-auto">
          <div v-for="(packageC, index) in packetCondition" :key="packageC.id" class="border-b last:border-b-0 border-gray-200 dark:border-gray-700">
            <div 
              class="bg-gray-50 dark:bg-gray-700 px-3 py-2 font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center cursor-pointer"
              @click="togglePackage(index)"
            >
              {{ packageC.label }}
              <div>
                <LucideChevronDown v-if="expandedPackages[index]" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <LucideChevronRight v-else class="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div v-show="expandedPackages[index]" class="p-2 bg-white dark:bg-gray-800">
              <div v-for="condition in packageC.functions" :key="condition.id" class="mb-1 last:mb-0">
                <label class="flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
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
        </div>
        
        <!-- Affichage des conditions sélectionnées -->
        <div v-if="selectedConditions.length > 0" class="mt-2 flex flex-wrap gap-1">
          <div 
            v-for="conditionId in selectedConditions" 
            :key="conditionId"
            class="flex items-center bg-indigo-50 dark:bg-indigo-900/20 text-xs rounded-full overflow-hidden"
          >
            <span class="px-2 py-0.5 text-indigo-700 dark:text-indigo-300">
              {{ getConditionLabel(conditionId) }}
            </span>
            <button 
              @click="removeCondition(conditionId)"
              class="p-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition"
              title="Retirer la condition"
            >
              <LucideX class="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>
<script setup>
import { ref, defineExpose, computed, watch, onMounted } from 'vue';
import Modal from './UiModal.vue';
import { 
  LucideChevronDown,
  LucideChevronRight,
  LucideX 
} from 'lucide-vue-next';

const props = defineProps({
  transitions: {
    type: Array,
    default: () => []
  },
  packetCondition: {
    type: Array,
    default: () => [
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
    ]
  }
});

const emits = defineEmits(['confirm']);

// État du modal
const isOpen = ref(false);
const sourceName = ref('');
const targetName = ref('');
const sourceId = ref('');
const targetId = ref('');
const selectedTransition = ref('');
const validationError = ref('');

// NOUVEAU: État pour les conditions
const selectedConditions = ref([]);
const expandedPackages = ref({});

// Initialiser l'état des packages
onMounted(() => {
  props.packetCondition.forEach((_, index) => {
    expandedPackages.value[index] = false;
  });
});

// Réinitialiser le formulaire lorsque le modal s'ouvre/ferme
watch(isOpen, (newValue) => {
  if (newValue === false) {
    resetForm();
  }
});

// Méthodes
const resetForm = () => {
  selectedTransition.value = '';
  selectedConditions.value = [];
  validationError.value = '';
};

const open = (source, target, sourceLabel, targetLabel) => {
  sourceId.value = source;
  targetId.value = target;
  sourceName.value = sourceLabel;
  targetName.value = targetLabel;
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
};

// NOUVEAU: Fonctions pour la gestion des conditions
const togglePackage = (index) => {
  expandedPackages.value[index] = !expandedPackages.value[index];
};

const removeCondition = (conditionId) => {
  selectedConditions.value = selectedConditions.value.filter(id => id !== conditionId);
};

const getConditionLabel = (conditionId) => {
  for (const pkg of props.packetCondition) {
    const condition = pkg.functions.find(c => c.id === conditionId);
    if (condition) {
      return condition.label;
    }
  }
  return conditionId;
};

const confirmTransition = () => {
  // Validation
  if (!selectedTransition.value) {
    validationError.value = 'Veuillez sélectionner une transition';
    return;
  }

  // Émettre l'événement avec les données ET les conditions sélectionnées
  emits('confirm', {
    source: sourceId.value,
    target: targetId.value,
    //transition: selectedTransition.value,
    conditions: selectedConditions.value
  });
  
  // Fermer le modal après confirmation
  isOpen.value = false;
};

// Exposer les méthodes
defineExpose({
  open,
  close
});
</script>