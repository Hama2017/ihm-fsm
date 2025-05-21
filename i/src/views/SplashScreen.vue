<template>
  <div 
    class="h-screen flex items-center justify-center overflow-hidden transition-colors duration-300"
    :class="darkMode ? 'bg-loading-dark' : 'bg-loading-light'"
  >
    <div class="splash-container text-center">
      <!-- Animation initiale pour "Smart Legal Contract" -->
      <svg v-if="!showUserName" viewBox="0 0 600 60">
        <g class="path">
          <text 
            x="50%" 
            y="50" 
            font-size="40" 
            text-anchor="middle"
            font-family="Orbitron"
            :class="darkMode ? 'text-stroke-light' : 'text-stroke-dark'"
          >
            Smart Legal Contract
          </text>
        </g>
      </svg>
      
      <!-- Animation pour le nom d'utilisateur -->
      <svg v-if="showUserName" viewBox="0 0 800 100">
        <g class="path">
          <text 
            x="50%" 
            y="70" 
            font-size="60" 
            text-anchor="middle"
            font-family="Orbitron"
            :class="darkMode ? 'text-stroke-light' : 'text-stroke-dark'"
          >
            {{ fullName }}
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/AuthStore';
import { storeToRefs } from 'pinia';
import { useI18n } from '@/composables/i18n/useI18n';

const router = useRouter();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const { darkMode } = storeToRefs(themeStore);
const { user } = storeToRefs(authStore);
const { t } = useI18n();

// État pour contrôler l'affichage
const statusText = ref(t('splash.initializing'));
const showUserName = ref(false);

// Nom complet de l'utilisateur
const fullName = user.value 
  ? `${user.value.firstName} ${user.value.lastName}` 
  : t('splash.user');

// Séquence d'animation
onMounted(() => {
  // Étape 1: Message initial
  setTimeout(() => {
    statusText.value = t('splash.loading_modules');
  }, 1500);
  
  // Étape 2: Message de bienvenue
  setTimeout(() => {
    statusText.value = t('splash.welcome');
  }, 3000);
  
  // Étape 3: Transition vers le nom d'utilisateur
  setTimeout(() => {
    showUserName.value = true;
  }, 5000);
  
  // Étape 4: Redirection vers le dashboard
  setTimeout(() => {
    router.push({ name: 'dashboard' });
  }, 10000);
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
  stroke-dasharray: 800;
  stroke-dashoffset: 800;
  animation: draw 4s ease forwards, fillLight 1s ease forwards 3.5s;
}

.text-stroke-dark {
  fill: transparent;
  stroke: #0284c7;
  stroke-width: 2;
  stroke-dasharray: 800;
  stroke-dashoffset: 800;
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