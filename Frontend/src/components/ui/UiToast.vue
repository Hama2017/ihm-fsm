<template>
    <Teleport to="body">
      <Transition name="toast-fade">
        <div
          v-if="visible"
          :class="[
            'fixed z-[10000] flex items-center p-4 rounded-lg shadow-lg max-w-xs sm:max-w-sm',
            typeClasses,
            positionClasses
          ]"
        >
          <!-- Icône -->
          <div v-if="showIcon" class="flex-shrink-0 mr-3">
            <svg v-if="type === 'success'" class="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg v-else-if="type === 'error'" class="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <svg v-else-if="type === 'warning'" class="w-6 h-6 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <svg v-else-if="type === 'info'" class="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          <!-- Contenu -->
          <div class="flex-1">
            <p class="text-sm font-medium">{{ message }}</p>
          </div>
          
          <!-- Bouton de fermeture -->
          <button
            v-if="dismissible"
            @click="close"
            class="ml-3 flex-shrink-0 p-1 rounded-full hover:bg-white/10 focus:outline-none"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </Transition>
    </Teleport>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
  
  const props = defineProps({
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'success',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000 // 3 secondes par défaut
    },
    position: {
      type: String,
      default: 'top-right',
      validator: (value) => [
        'top-right', 'top-left', 'top-center',
        'bottom-right', 'bottom-left', 'bottom-center'
      ].includes(value)
    },
    dismissible: {
      type: Boolean,
      default: true
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    visible: {
      type: Boolean,
      default: true
    }
  });
  
  const emit = defineEmits(['close']);
  
  // Timer pour auto-fermeture
  let timer = null;
  
  // Classes en fonction du type
  const typeClasses = computed(() => {
    switch (props.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/80 text-green-800 dark:text-green-100';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/80 text-red-800 dark:text-red-100';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/80 text-yellow-800 dark:text-yellow-100';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/80 text-blue-800 dark:text-blue-100';
      default:
        return 'bg-gray-50 dark:bg-gray-900/80 text-gray-800 dark:text-gray-100';
    }
  });
  
  // Classes en fonction de la position
  const positionClasses = computed(() => {
    switch (props.position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  });
  
  // Démarrer le timer d'auto-fermeture
  const startTimer = () => {
    if (props.duration > 0) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        close();
      }, props.duration);
    }
  };
  
  // Fermer le toast
  const close = () => {
    emit('close');
  };
  
  // Réinitialiser le timer lorsque les props changent
  watch(() => props.visible, (newValue) => {
    if (newValue) {
      startTimer();
    } else {
      clearTimeout(timer);
    }
  });
  
  // Démarrer le timer au montage
  onMounted(() => {
    if (props.visible) {
      startTimer();
    }
  });
  
  // Nettoyer le timer avant de démonter
  onBeforeUnmount(() => {
    clearTimeout(timer);
  });
  </script>
  
  <style scoped>
  .toast-fade-enter-active,
  .toast-fade-leave-active {
    transition: all 0.3s ease;
  }
  
  .toast-fade-enter-from,
  .toast-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }
  </style>