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
      </div>
    </Modal>
  </template>
  
  <script setup>
  import { ref, defineExpose, computed, watch } from 'vue';
  import Modal from './UiModal.vue';
  
  const props = defineProps({
    transitions: {
      type: Array,
      default: () => []
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
  
  // Réinitialiser le formulaire lorsque le modal s'ouvre/ferme
  watch(isOpen, (newValue) => {
    if (newValue === false) {
      resetForm();
    }
  });
  
  // Méthodes
  const resetForm = () => {
    selectedTransition.value = '';
    validationError.value = '';
  };
  
  const open = (source, target, sourceLabel, targetLabel) => {
    sourceId.value = source;
    targetId.value = target;
    sourceName.value = sourceLabel;
    targetName.value = targetLabel;
    isOpen.value = true;
  };
  
  const confirmTransition = () => {
    // Validation
    if (!selectedTransition.value) {
      validationError.value = 'Veuillez sélectionner une transition';
      return;
    }
  
    // Émettre l'événement avec les données
    emits('confirm', {
      source: sourceId.value,
      target: targetId.value,
      transition: selectedTransition.value
    });
  
    // Fermer le modal après confirmation
    isOpen.value = false;
  };
  
  // Exposer les méthodes
  defineExpose({
    open
  });
  </script>