<template>
    <div class="flex flex-col items-center justify-center p-3 pb-6">
      <div class="relative flex items-center justify-center mb-4">
        <!-- Animation de chargement pendant le déploiement -->
        <DotLottieVue
          v-if="step < 3"
          style="height: 250px; width: 250px"
          autoplay
          loop
          src="https://lottie.host/83a880c6-ca74-4778-846b-dafcbf336bd8/DJPDOTVKkn.lottie"
        />
        
        <!-- Animation de succès une fois le déploiement terminé -->
        <DotLottieVue
          v-else
          style="height: 250px; width: 250px"
          autoplay
          loop
          src="https://lottie.host/1d102e55-a095-4368-9701-0b5b50df0b73/6b7M8Le0Sf.lottie"
        />
      </div>
      
      <!-- Texte d'état -->
      <h3 class="text-xl font-bold text-center mb-4">{{ animationTexts[step] }}</h3>
      
      <!-- Barre de progression -->
      <div class="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
        <div 
          class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          :style="`width: ${progress}%`"
        ></div>
      </div>
      
      <!-- Détails -->
      <p class="text-gray-600 dark:text-gray-400 text-center">
        {{ step === 3 ? 'Contrat déployé avec succès!' : 'Veuillez patienter pendant le déploiement de votre contrat...' }}
      </p>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  import { DotLottieVue } from '@lottiefiles/dotlottie-vue';
  
  const props = defineProps({
    step: {
      type: Number,
      default: 0
    },
    progress: {
      type: Number,
      default: 0
    },
    animationTexts: {
      type: Array,
      default: () => [
        "Préparation du déploiement...",
        "Lancement du déploiement...",
        "Déploiement des contrats intelligents...",
        "Déploiement terminé avec succès!"
      ]
    }
  });
  
  const emit = defineEmits(['complete']);
  </script>