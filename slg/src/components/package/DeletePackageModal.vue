<template>
    <Modal
      :modelValue="modelValue"
      title="Supprimer le package"
      confirm-text="Supprimer"
      variant="danger"
      @update:modelValue="$emit('update:modelValue', $event)"
      @confirm="$emit('confirm')"
    >
      <p class="text-gray-700 dark:text-gray-300">
        Êtes-vous sûr de vouloir supprimer le package <span class="font-medium">{{ packageData?.label }}</span> ?
      </p>
      <p class="mt-2 text-gray-600 dark:text-gray-400 text-sm">
        Cette action est irréversible et supprimera définitivement le package et toutes ses fonctions associées.
      </p>
    </Modal>
  </template>
  
  <script setup>
  import Modal from '@/components/ui/UiModal.vue';
  import {computed} from 'vue';
  // Props
  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true
    },
    package: {
      type: Object,
      default: null
    }
  });
  
  // Emits
  defineEmits(['update:modelValue', 'confirm']);
  
  // Computed
  const packageData = computed(() => props.package);
  </script>