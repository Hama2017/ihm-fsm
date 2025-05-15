<!-- SlidableTabs.vue -->
<template>
  <div class="slidable-tabs relative">
    <!-- Flèche de navigation gauche réduite -->
    <button 
      v-if="canScrollLeft"
      @click="scrollLeft"
      class="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-0.5 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors shadow-sm"
    >
      <LucideChevronLeft class="w-4 h-4" />
    </button>
    
    <!-- Conteneur des onglets avec défilement -->
    <div 
      ref="tabsContainer" 
      class="tabs-container overflow-x-auto whitespace-nowrap scrollbar-hide flex border-b border-gray-200 dark:border-gray-700 mb-3"
      @scroll="checkScrollPosition"
    >
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="selectTab(tab.id)" 
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none whitespace-nowrap"
        :class="activeTab === tab.id 
          ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <!-- Flèche de navigation droite réduite -->
    <button 
      v-if="canScrollRight"
      @click="scrollRight"
      class="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-0.5 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors shadow-sm"
    >
      <LucideChevronRight class="w-4 h-4" />
    </button>
  </div>
  
  <!-- Contenu des onglets -->
  <div class="tab-content flex-grow overflow-hidden">
    <slot :name="activeTab" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watchEffect } from 'vue';
import { LucideChevronLeft, LucideChevronRight } from 'lucide-vue-next';

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    // Chaque tab doit avoir { id, label }
  },
  modelValue: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const activeTab = ref(props.modelValue);
const tabsContainer = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

// Scroll vers la gauche
const scrollLeft = () => {
  if (tabsContainer.value) {
    tabsContainer.value.scrollBy({ left: -150, behavior: 'smooth' });
  }
};

// Scroll vers la droite
const scrollRight = () => {
  if (tabsContainer.value) {
    tabsContainer.value.scrollBy({ left: 150, behavior: 'smooth' });
  }
};

// Vérifier si les boutons de défilement doivent être affichés
const checkScrollPosition = () => {
  if (!tabsContainer.value) return;
  
  const { scrollLeft, scrollWidth, clientWidth } = tabsContainer.value;
  
  // Peut défiler vers la gauche si scrollLeft > 0
  canScrollLeft.value = scrollLeft > 0;
  
  // Peut défiler vers la droite si on n'est pas à la fin
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 1; // -1 pour les arrondis
};

// Sélectionner un onglet
const selectTab = (tabId) => {
  activeTab.value = tabId;
  emit('update:modelValue', tabId);
};

// Observer les changements de taille dans le DOM pour mettre à jour l'affichage des flèches
const observeResize = () => {
  if (typeof ResizeObserver === 'undefined' || !tabsContainer.value) return;
  
  const resizeObserver = new ResizeObserver(() => {
    checkScrollPosition();
  });
  
  resizeObserver.observe(tabsContainer.value);
  
  // Retourne une fonction de nettoyage
  return () => {
    if (tabsContainer.value) {
      resizeObserver.unobserve(tabsContainer.value);
    }
  };
};

// Lorsque les onglets actifs changent, défiler pour les rendre visibles si nécessaire
watchEffect(() => {
  if (props.modelValue !== activeTab.value) {
    activeTab.value = props.modelValue;
  }
  
  nextTick(() => {
    if (!tabsContainer.value) return;
    
    // Trouver l'élément d'onglet actif
    const activeTabElement = tabsContainer.value.querySelector(`.border-blue-600, .dark\\:border-blue-400`);
    if (activeTabElement) {
      // Faire défiler pour rendre l'onglet actif visible
      activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
    
    // Vérifier si les boutons de défilement doivent être affichés
    checkScrollPosition();
  });
});

onMounted(() => {
  // Initialiser le défilement et les états des boutons
  nextTick(() => {
    checkScrollPosition();
    observeResize();
  });
});
</script>

<style scoped>
/* Cacher la barre de défilement tout en permettant le défilement */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>