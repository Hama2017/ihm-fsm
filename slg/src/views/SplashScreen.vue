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
            Smart Legal Contract
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const router = useRouter();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const { darkMode } = storeToRefs(themeStore);
const { user } = storeToRefs(authStore);

// État pour le texte de statut
const statusText = ref('Initialisation...');
const messages = ref([
  'Initialisation de l\'application...',
  'Chargement des modules...',
  user.value 
    ? `Bienvenue ${user.value.firstName} ${user.value.lastName} !` 
    : 'Bienvenue !'
]);

// Message personnalisé pour l'utilisateur connecté
const welcomeMessage = computed(() => {
  return user.value 
    ? `Bienvenue ${user.value.firstName} ${user.value.lastName} !` 
    : 'Bienvenue !';
});

let currentMessage = 0;
let statusInterval = null;

// Fonction pour mettre à jour les messages de statut
const updateStatus = () => {
  if (currentMessage < messages.value.length - 1) {
    statusText.value = messages.value[currentMessage];
    currentMessage++;
  } else {
    // Pour le dernier message, utiliser le message personnalisé calculé
    statusText.value = welcomeMessage.value;
    clearInterval(statusInterval);
    
    // Marquer comme vu pour les prochaines visites
    localStorage.setItem('splash_screen_seen', 'true');
    
    // Rediriger vers le dashboard après l'animation complète
    setTimeout(() => {
      router.push({ name: 'dashboard' });
    }, 1500);
  }
};

// Initialiser le cycle de messages
onMounted(() => {
  // Démarrer la séquence de mise à jour des statuts
  statusInterval = setInterval(updateStatus, 1500);
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