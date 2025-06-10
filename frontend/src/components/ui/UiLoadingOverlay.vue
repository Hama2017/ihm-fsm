<script setup>
import { onMounted } from 'vue';

defineProps({
  message: {
    type: String,
    default: 'Chargement en cours...'
  }
});

onMounted(() => {
  const svgLogo = document.querySelector('.loading-logo');
  if (svgLogo) {
    svgLogo.classList.add('active');
    setTimeout(() => {
      svgLogo.classList.add('pulse-ready');
    }, 2500);
  }
});
</script>

<template>
  <div class="loading-overlay">
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
</template>

<style scoped>
/* Style overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

/* Logo SLC */
.loading-logo {
  width: 105px;
  height: 126px;
}

/* SVG Artista Generated Styles - avec transitions douces */
.loading-logo .svg-elem-1 {
  stroke-dashoffset: 356.668212890625px;
  stroke-dasharray: 356.668212890625px;
  transition: stroke-dashoffset 1.5s cubic-bezier(0.34, 0.615, 0.4, 0.985) 0s,
              fill 0.7s cubic-bezier(0.34, 0.615, 0.4, 0.985) 0.8s;
}

.loading-logo.active .svg-elem-1 {
  stroke-dashoffset: 0;
}

.loading-logo .svg-elem-2 {
  stroke-dashoffset: 172.3283233642578px;
  stroke-dasharray: 172.3283233642578px;
  fill: transparent;
  transition: stroke-dashoffset 1.5s cubic-bezier(0.34, 0.615, 0.4, 0.985) 0.3s,
              fill 1s cubic-bezier(0.34, 0.615, 0.4, 0.985) 1.2s;
}

.loading-logo.active .svg-elem-2 {
  stroke-dashoffset: 0;
  fill: rgb(58, 130, 246);
}

.loading-logo .svg-elem-3 {
  stroke-dashoffset: 30.233295440673828px;
  stroke-dasharray: 30.233295440673828px;
  transition: stroke-dashoffset 1.2s cubic-bezier(0.34, 0.615, 0.4, 0.985) 1.5s,
              fill 0.7s cubic-bezier(0.34, 0.615, 0.4, 0.985) 1.6s;
}

.loading-logo.active .svg-elem-3 {
  stroke-dashoffset: 0;
}

.loading-logo .svg-elem-4 {
  stroke-dashoffset: 26.200000762939453px;
  stroke-dasharray: 26.200000762939453px;
  transition: stroke-dashoffset 1.2s cubic-bezier(0.34, 0.615, 0.4, 0.985) 1.7s,
              fill 0.7s cubic-bezier(0.34, 0.615, 0.4, 0.985) 1.8s;
}

.loading-logo.active .svg-elem-4 {
  stroke-dashoffset: 0;
}

.loading-logo .svg-elem-5 {
  stroke-dashoffset: 22.166698455810547px;
  stroke-dasharray: 22.166698455810547px;
  transition: stroke-dashoffset 1.2s cubic-bezier(0.34, 0.615, 0.4, 0.985) 1.9s,
              fill 0.7s cubic-bezier(0.34, 0.615, 0.4, 0.985) 2s;
}

.loading-logo.active .svg-elem-5 {
  stroke-dashoffset: 0;
}

/* Pulse final amélioré */
.loading-logo.active.pulse-ready {
  animation: pulse 3s infinite alternate cubic-bezier(0.34, 0.615, 0.4, 0.985);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.02);
    filter: brightness(1.03);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}
</style>