<template>
    <Transition name="fade">
      <div v-if="visible" class="loading-overlay">
        <svg width="105" height="126" viewBox="0 0 105 126" fill="none" xmlns="http://www.w3.org/2000/svg" class="loading-logo mb-6">
          <path d="M52.4167 3L102.833 33V93L52.4167 123L2 93V33L52.4167 3Z" stroke="url(#paint0_linear_75_60)" stroke-width="4" class="svg-elem-1"></path>
          <path d="M66.5333 38H38.3C34.9587 38 32.25 40.6863 32.25 44V82C32.25 85.3137 34.9587 88 38.3 88H66.5333C69.8747 88 72.5833 85.3137 72.5833 82V44C72.5833 40.6863 69.8747 38 66.5333 38Z" fill="#3A82F6" stroke="#3B82F6" stroke-width="1.5" class="svg-elem-2"></path>
          <path d="M38.2998 48H66.5331" stroke="white" stroke-width="2" class="svg-elem-3"></path>
          <path d="M38.2998 56H62.4998" stroke="white" stroke-width="2" class="svg-elem-4"></path>
          <path d="M38.2998 64H58.4665" stroke="white" stroke-width="2" class="svg-elem-5"></path>
          <defs>
            <linearGradient id="paint0_linear_75_60" x1="2" y1="3" x2="10085.3" y2="3" gradientUnits="userSpaceOnUse">
              <stop stop-color="#3B82F6"></stop>
              <stop offset="1" stop-color="#06B6D4"></stop>
            </linearGradient>
          </defs>
        </svg>
        <p class="text-lg font-medium text-gray-800 dark:text-gray-200">{{ message }}</p>
      </div>
    </Transition>
  </template>
  
  <script setup>
  import { onMounted, watch } from 'vue';
  
  // Props
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'Chargement en cours...'
    }
  });
  
  // Fonction pour activer l'animation SVG
  const activateSvgAnimation = () => {
    // Attendre que le DOM soit prêt
    setTimeout(() => {
      const svgLogo = document.querySelector('.loading-logo');
      if (svgLogo) {
        svgLogo.classList.add('active');
        
        // Attendre que l'animation de traçage soit terminée avant de démarrer le pulse
        // La dernière transition dure 1s et commence après 0.48s, donc attendre ~1.5s
        setTimeout(() => {
          svgLogo.classList.add('pulse-ready');
        }, 1500);
      }
    }, 100);
  };
  
  // Démarrer l'animation lorsque le composant devient visible
  watch(() => props.visible, (newValue) => {
    if (newValue) {
      activateSvgAnimation();
    }
  });
  
  // Démarrer l'animation au montage si visible
  onMounted(() => {
    if (props.visible) {
      activateSvgAnimation();
    }
  });
  </script>
  
  <style scoped>
  /* Importer les styles d'animation du SVG */
  @import '../../assets/css/loading-animation.css';
  </style>