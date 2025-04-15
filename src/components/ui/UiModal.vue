<template>
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="isOpen" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div 
            class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md relative transition-colors duration-300"
            @click.stop
          >
            <button 
              class="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              @click="$emit('close')"
            >
              <LucideX class="w-5 h-5" />
            </button>
            
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">{{ title }}</h2>
            
            <slot>
              <!-- Le contenu de la modale sera injecté ici -->
            </slot>
            
            <div class="flex justify-end gap-2 mt-4">
              <button 
                class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors duration-200"
                @click="$emit('close')"
              >
                {{ cancelText }}
              </button>
              <button 
                class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                @click="onConfirm"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </template>
  
  <script setup>
  import { LucideX } from 'lucide-vue-next';
  import { onMounted, onUnmounted } from 'vue';
  
  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Modal'
    },
    confirmText: {
      type: String,
      default: 'Valider'
    },
    cancelText: {
      type: String,
      default: 'Annuler'
    }
  });
  
  const emit = defineEmits(['close', 'confirm']);
  
  const onConfirm = () => {
    emit('confirm');
    emit('close');
  };
  
  // Fermer la modale avec la touche Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && props.isOpen) {
      emit('close');
    }
  };
  
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
  });
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });
  </script>