import { ref, onMounted, watch } from 'vue';
import { useVueFlow } from '@vue-flow/core';

/**
 * Composable pour gérer les contrôles de l'éditeur (zoom, grille, plein écran, etc.)
 * 
 * @returns {Object} Fonctions et états pour la gestion des contrôles de l'éditeur
 */
export default function useEditorControls() {
  // Récupérer les méthodes de VueFlow
  const { fitView, zoomTo, onViewportChange } = useVueFlow();
  
  // États réactifs
  const zoomLevel = ref(1);
  const isFullScreen = ref(false);
  const showMinimap = ref(true);
  const snapToGrid = ref(true);
  const showLeftPanel = ref(true);
  const isDesktop = ref(window.innerWidth >= 1280); // xl breakpoint
  const rightPanelTab = ref('states');
  
  // Surveiller le changement de zoom
  onViewportChange(({ zoom }) => {
    zoomLevel.value = zoom;
  });
  
  // Détecter le redimensionnement de la fenêtre pour la réactivité
  onMounted(() => {
    window.addEventListener('resize', () => {
      isDesktop.value = window.innerWidth >= 1280;
    });
  });
  
  // --- Fonctions pour le contrôle de l'éditeur ---
  const centerGraph = () => {
    fitView({ padding: 0.2 });
  };

  const resetZoom = () => {
    zoomTo(1);
    zoomLevel.value = 1;
  };

  const toggleFullScreen = () => {
    isFullScreen.value = !isFullScreen.value;
    // Ajuster la vue après le passage en plein écran
    setTimeout(() => {
      centerGraph();
    }, 100);
  };

  const toggleLeftPanel = () => {
    showLeftPanel.value = !showLeftPanel.value;
  };

  const toggleMinimap = () => {
    showMinimap.value = !showMinimap.value;
  };

  const toggleGrid = () => {
    snapToGrid.value = !snapToGrid.value;
  };

  const zoomIn = () => {
    zoomTo(zoomLevel.value + 0.1);
  };

  const zoomOut = () => {
    zoomTo(Math.max(0.1, zoomLevel.value - 0.1));
  };
  
  // Fonction pour changer l'onglet du panneau droit
  const setRightPanelTab = (tab) => {
    rightPanelTab.value = tab;
  };

  return {
    // États
    zoomLevel,
    isFullScreen,
    showMinimap,
    snapToGrid,
    showLeftPanel,
    isDesktop,
    rightPanelTab,
    
    // Méthodes
    centerGraph,
    resetZoom,
    toggleFullScreen,
    toggleLeftPanel,
    toggleMinimap,
    toggleGrid,
    zoomIn,
    zoomOut,
    setRightPanelTab
  };
}