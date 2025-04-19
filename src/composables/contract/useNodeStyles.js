import { computed } from 'vue';
import { MarkerType } from '@vue-flow/core';

/**
 * Composable pour gérer les styles des nœuds et arêtes
 * 
 * @param {Object} options Configuration du composable
 * @param {Ref<Boolean>} options.isDarkMode État du mode sombre
 * @returns {Object} Fonctions pour la gestion des styles
 */
export default function useNodeStyles({ isDarkMode }) {
  // Styles de base pour les nœuds normaux
  const getBaseNodeStyle = () => {
    return {
      padding: '8px 16px',
      fontSize: '0.875rem',
      fontWeight: '500',
      borderRadius: '9999px',
      transition: 'all 0.2s ease',
      backgroundColor: isDarkMode.value ? '#374151' : '#f3f4f6', // dark:bg-gray-700 : bg-gray-100
      color: isDarkMode.value ? '#d1d5db' : '#1f2937', // dark:text-gray-300 : text-gray-800
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    };
  };

  // Styles pour les nœuds sélectionnés
  const getSelectedNodeStyle = () => {
    return {
      padding: '8px 16px',
      fontSize: '0.875rem',
      fontWeight: '600',
      borderRadius: '9999px',
      transition: 'all 0.2s ease',
      background: 'linear-gradient(to top right, #3b82f6, #1d4ed8)', // from-blue-500 to-blue-700
      color: '#ffffff', // text-white
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-lg
    };
  };

  // Styles pour les arêtes normales
  const getBaseEdgeStyle = () => {
    return {
      stroke: isDarkMode.value ? '#6B7280' : '#9CA3AF', // gray-500 : gray-400
      strokeWidth: 2,
    };
  };

  // Styles pour les arêtes sélectionnées
  const getSelectedEdgeStyle = () => {
    return {
      stroke: '#3B82F6', // blue-500
      strokeWidth: 3,
      animation: 'dash 1s linear infinite',
    };
  };
  
  // Styles pour les arêtes animées (simulation)
  const getAnimatedEdgeStyle = () => {
    return {
      stroke: '#facc15', // yellow-400
      strokeWidth: 3,
      strokeDasharray: '10',
      animation: 'pulse-line 1s ease forwards'
    };
  };
  
  // Styles pour les arêtes actives (visitées) en mode simulation
  const getActiveEdgeStyle = () => {
    return {
      stroke: '#10b981', // green-500
      strokeWidth: 3,
    };
  };
  
  // Configuration par défaut des arêtes
  const getDefaultEdgeConfig = () => {
    return {
      markerEnd: MarkerType.ArrowClosed,
      style: getBaseEdgeStyle()
    };
  };
  
  // Mise à jour des styles des nœuds en fonction de l'élément sélectionné
  const updateNodeStyles = (nodes, selectedId) => {
    nodes.forEach(node => {
      node.style = node.id === selectedId 
        ? getSelectedNodeStyle() 
        : getBaseNodeStyle();
    });
    return nodes;
  };
  
  // Mise à jour des styles des arêtes en fonction de l'élément sélectionné
  const updateEdgeStyles = (edges, selectedId) => {
    edges.forEach(edge => {
      edge.style = edge.id === selectedId 
        ? getSelectedEdgeStyle() 
        : getBaseEdgeStyle();
    });
    return edges;
  };

  return {
    getBaseNodeStyle,
    getSelectedNodeStyle,
    getBaseEdgeStyle,
    getSelectedEdgeStyle,
    getAnimatedEdgeStyle,
    getActiveEdgeStyle,
    getDefaultEdgeConfig,
    updateNodeStyles,
    updateEdgeStyles
  };
}