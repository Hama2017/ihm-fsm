<template>
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="$emit('cancel')">
          <!-- Overlay -->
          <div class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity" @click.self="$emit('cancel')"></div>
          
          <!-- Modal -->
          <div 
            class="relative w-full max-w-md rounded-lg shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden transition-all transform-gpu"
            :class="[size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-lg' : 'max-w-md']"
          >
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center">
                <div v-if="type" class="mr-3">
                  <!-- Icons selon le type -->
                  <div v-if="type === 'success'" class="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <LucideCheck class="w-5 h-5" />
                  </div>
                  <div v-else-if="type === 'warning'" class="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <LucideAlertTriangle class="w-5 h-5" />
                  </div>
                  <div v-else-if="type === 'error'" class="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                    <LucideAlertCircle class="w-5 h-5" />
                  </div>
                  <div v-else-if="type === 'question'" class="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <LucideHelpCircle class="w-5 h-5" />
                  </div>
                  <div v-else class="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <LucideInfo class="w-5 h-5" />
                  </div>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
              </div>
              
              <!-- Bouton de fermeture -->
              <button 
                @click="$emit('cancel')" 
                class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Fermer"
              >
                <LucideX class="w-5 h-5" />
              </button>
            </div>
            
            <!-- Corps -->
            <div class="px-6 py-4">
              <p class="text-gray-700 dark:text-gray-300" v-if="message">{{ message }}</p>
              <slot></slot>
            </div>
            
            <!-- Pied -->
            <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button 
                v-if="showCancel" 
                @click="$emit('cancel')"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm transition-colors"
              >
                {{ cancelText }}
              </button>
              <button 
                @click="$emit('confirm')" 
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-md shadow-sm transition-colors"
                :class="[
                  variant === 'danger' ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600' : 
                  variant === 'success' ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600' :
                  'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                ]"
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
  import { 
    LucideAlertCircle, 
    LucideAlertTriangle, 
    LucideCheck, 
    LucideHelpCircle, 
    LucideInfo, 
    LucideX 
  } from 'lucide-vue-next';
  
  const props = defineProps({
    // Contrôle si le modal est affiché ou non (v-model)
    modelValue: {
      type: Boolean,
      default: false
    },
    // Titre du modal
    title: {
      type: String,
      default: 'Confirmation'
    },
    // Message du modal
    message: {
      type: String,
      default: ''
    },
    // Texte du bouton de confirmation
    confirmText: {
      type: String,
      default: 'Confirmer'
    },
    // Texte du bouton d'annulation
    cancelText: {
      type: String,
      default: 'Annuler'
    },
    // Afficher ou non le bouton d'annulation
    showCancel: {
      type: Boolean,
      default: true
    },
    // Variant du bouton de confirmation
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'danger', 'success'].includes(value)
    },
    // Type de confirmation (pour l'icône)
    type: {
      type: String,
      default: '',
      validator: (value) => ['', 'success', 'warning', 'error', 'info', 'question'].includes(value)
    },
    // Taille du modal
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    }
  });
  
  defineEmits(['update:modelValue', 'confirm', 'cancel']);
  </script>
  
  <style scoped>
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
  }
  </style>