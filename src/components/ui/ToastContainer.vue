<template>
    <div class="toast-container">
      <component
        v-for="toast in toasts"
        :key="toast.id"
        :is="toast.component"
        v-bind="{ ...toast }"
        @close="removeToast(toast.id)"
      />
    </div>
  </template>
  
  <script setup>
  import { useToast } from '@/components/ui/ToastService';
  
  // Récupérer le service de toasts
  const { toasts, remove: removeToast } = useToast();
  </script>