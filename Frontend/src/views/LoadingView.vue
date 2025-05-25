<template>
    <div 
      class="h-screen flex items-center justify-center overflow-hidden transition-colors duration-300"
      :class="darkMode ? 'bg-loading-dark' : 'bg-loading-light'"
    >
      <div class="splash-container text-center">
        <svg viewBox="0 0 500 60">
          <g class="path">
            <text 
              x="0" 
              y="50" 
              font-size="40" 
              font-family="Orbitron"
              :class="darkMode ? 'text-stroke-light' : 'text-stroke-dark'"
            >
              {{ mainTitle }}
            </text>
          </g>
        </svg>
        <div class="loading-bar w-80 h-2 rounded-full overflow-hidden mx-auto my-5"
             :class="darkMode ? 'bg-white bg-opacity-10' : 'bg-gray-700 bg-opacity-10'">
          <div class="loading-bar-fill h-full rounded-full"></div>
        </div>
        <div class="status-text text-base mt-4 opacity-0 animation-fade-in-text"
             :class="darkMode ? 'text-white' : 'text-gray-800'">
          {{ statusText }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { useRouter } from 'vue-router';
  import { useThemeStore } from '../stores/theme';
  import { storeToRefs } from 'pinia';
  
  const router = useRouter();
  const themeStore = useThemeStore();
  const { darkMode } = storeToRefs(themeStore);
  
  // Paramètres depuis sessionStorage
  const getStoredValue = (key, defaultValue) => {
    try {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('Error parsing stored value:', error);
      return defaultValue;
    }
  };
  
  // État pour le texte de statut
  const statusText = ref('Initialisation...');
  const mainTitle = ref(getStoredValue('loading_title', 'Smart Legal Contract'));
  const messages = ref(getStoredValue('loading_messages', [
    'Blockchain connectée...',
    'Déploiement du contrat...',
    'Prêt à être utilisé !'
  ]));
  
  let currentMessage = 0;
  let statusInterval = null;
  
  // Fonction pour mettre à jour les messages de statut
  const updateStatus = () => {
    if (currentMessage < messages.value.length) {
      statusText.value = messages.value[currentMessage];
      currentMessage++;
    } else {
      clearInterval(statusInterval);
      
      // Rediriger vers la route spécifiée ou dashboard par défaut
      setTimeout(() => {
        const returnTo = sessionStorage.getItem('loading_return_to') || 'dashboard';
        
        // Nettoyer le stockage de session
        sessionStorage.removeItem('loading_return_to');
        sessionStorage.removeItem('loading_force_delay');
        sessionStorage.removeItem('loading_title');
        sessionStorage.removeItem('loading_messages');
        
        router.push({ name: returnTo });
      }, 1000);
    }
  };
  
  // Initialiser le cycle de messages
  onMounted(() => {
    // Vérifier s'il y a un délai forcé
    const forceDelay = parseInt(sessionStorage.getItem('loading_force_delay') || '0');
    
    if (forceDelay > 0) {
      // Si on a un délai forcé, on accélère les messages pour qu'ils s'affichent tous
      // mais on attend le délai complet avant de continuer
      const messageInterval = Math.min(forceDelay / messages.value.length, 1000);
      statusInterval = setInterval(updateStatus, messageInterval);
      
      // Remplacer la redirection de fin d'animation par un timeout basé sur le délai forcé
      setTimeout(() => {
        clearInterval(statusInterval);
        const returnTo = sessionStorage.getItem('loading_return_to') || 'dashboard';
        
        // Nettoyer le stockage de session
        sessionStorage.removeItem('loading_return_to');
        sessionStorage.removeItem('loading_force_delay');
        sessionStorage.removeItem('loading_title');
        sessionStorage.removeItem('loading_messages');
        
        router.push({ name: returnTo });
      }, forceDelay);
    } else {
      // Comportement normal - démarrer la séquence de mise à jour des statuts
      statusInterval = setInterval(updateStatus, 2000);
    }
  });
  
  // Nettoyer l'intervalle à la destruction du composant
  onBeforeUnmount(() => {
    if (statusInterval) {
      clearInterval(statusInterval);
    }
  });
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap');
  
  .bg-loading-dark {
    background: radial-gradient(circle at center, #0a2745, #04122a);
    color: #fff;
  }
  
  .bg-loading-light {
    background: radial-gradient(circle at center, #e0f2fe, #bae6fd);
    color: #0f172a;
  }
  
  .splash-container {
    animation: fadeIn 1.5s ease-in;
  }
  
  .text-stroke-light {
    fill: transparent;
    stroke: #00aaff;
    stroke-width: 2;
    stroke-dasharray: 400;
    stroke-dashoffset: 400;
    animation: draw 4s ease forwards, fillLight 1s ease forwards 3.5s;
  }
  
  .text-stroke-dark {
    fill: transparent;
    stroke: #0284c7;
    stroke-width: 2;
    stroke-dasharray: 400;
    stroke-dashoffset: 400;
    animation: draw 4s ease forwards, fillDark 1s ease forwards 3.5s;
  }
  
  .loading-bar-fill {
    background: linear-gradient(90deg, #0095ff, #0061ff);
    width: 0%;
    animation: loading 5s linear forwards;
  }
  
  .animation-fade-in-text {
    animation: fadeInText 2s ease-in forwards;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes loading {
    from { width: 0%; }
    to { width: 100%; }
  }
  
  @keyframes fadeInText {
    to { opacity: 1; }
  }
  
  @keyframes draw {
    to { stroke-dashoffset: 0; }
  }
  
  @keyframes fillLight {
    to { fill: #00aaff; }
  }
  
  @keyframes fillDark {
    to { fill: #0284c7; }
  }
  </style>