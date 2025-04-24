<template>
  <path
    :id="id"
    class="vue-flow__edge-path"
    :d="edgePath"
    :style="style"
    :marker-end="markerEnd"
  />
  
  <!-- Fond du label principal -->
  <rect
    :x="labelX - (labelWidth / 2) - 8"
    :y="labelY - 22"
    :width="labelWidth + 16"
    :height="24"
    rx="12"
    ry="12"
    class="fill-blue-100 dark:fill-blue-900/40 shadow-sm"
    :style="{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }"
    pointer-events="all"

  />
  
  <!-- Label principal -->
  <text
    :x="labelX"
    :y="labelY - 10" 
    text-anchor="middle"
    dominant-baseline="middle"
    class="vue-flow__edge-text select-none pointer-events-none font-medium"
    :class="{ 'text-xs': label.length > 10, 'text-sm': label.length <= 10 }"
    :fill="isDarkMode ? '#93C5FD' : '#1E40AF'"
      pointer-events="all"

  >
    {{ label }}
  </text>
  
  <!-- Conditions (si activées) -->
  <g v-if="showConditions && edge && edge.conditions && edge.conditions.length > 0">
    <!-- Cercle indicateur du nombre de conditions -->
    <circle
      :cx="labelX + (labelWidth / 2) + 8"
      :cy="labelY - 16"
      r="8"
      class="fill-blue-500 dark:fill-blue-600"
    />
    <text
      :x="labelX + (labelWidth / 2) + 8"
      :y="labelY - 16"
      text-anchor="middle"
      dominant-baseline="middle"
      class="text-[8px] font-bold text-white select-none pointer-events-none"
    >
      {{ edge.conditions.length }}
    </text>
    
    <!-- Fond pour le texte des conditions -->
    <rect
      :x="labelX - (conditionsLabelWidth / 2) - 8"
      :y="labelY + 4"
      :width="conditionsLabelWidth + 16"
      :height="24"
      rx="6"
      ry="6"
      class="fill-blue-50 dark:fill-blue-800/30 stroke-blue-200 dark:stroke-blue-700"
      stroke-width="1"
      :style="{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05))' }"
      pointer-events="all"

    />
    
    <!-- Texte des conditions -->
    <text
      :x="labelX"
      :y="labelY + 16"
      text-anchor="middle"
      dominant-baseline="middle"
      class="vue-flow__edge-text select-none pointer-events-none text-[9px] font-medium"
      :fill="isDarkMode ? '#BFDBFE' : '#3B82F6'"
    >
      {{ conditionsText }}
    </text>
  </g>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { getBezierPath } from '@vue-flow/core';
import { useThemeStore } from '@/stores/theme';

const props = defineProps({
  id: { type: String, required: true },
  sourceX: { type: Number, required: true },
  sourceY: { type: Number, required: true },
  targetX: { type: Number, required: true },
  targetY: { type: Number, required: true },
  label: { type: String, default: '' },
  markerEnd: { type: String, default: '' },
  style: { type: Object, default: () => ({}) },
  edge: { type: Object, default: null },
  showConditions: { type: Boolean, default: true },
  packetCondition: { type: Array, default: () => [] }
});

// Référence au thème
const themeStore = useThemeStore();
const isDarkMode = computed(() => themeStore.darkMode);

// Calculer le chemin de l'edge (courbure de Bézier)
const edgePath = computed(() => {
  const [path] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    curvature: 0.25
  });
  return path;
});


// Position du label (milieu du chemin)
const labelX = computed(() => (props.sourceX + props.targetX) / 2);
const labelY = computed(() => (props.sourceY + props.targetY) / 2);

// Largeur approximative du label principal pour le rectangle de fond
const labelWidth = computed(() => {
  return Math.max(props.label.length * 7, 40);
});

// Texte des conditions
const conditionsText = computed(() => {
  if (!props.edge || !props.edge.conditions || props.edge.conditions.length === 0) {
    return '';
  }
  
  // Si plus de 2 conditions, montrer "N conditions"
  if (props.edge.conditions.length > 2) {
    return `${props.edge.conditions.length} conditions`;
  }
  
  // Sinon, montrer les noms des conditions
  const labels = props.edge.conditions.map(conditionId => {
    return getConditionLabel(conditionId);
  });
  
  // Tronquer si trop long
  let text = labels.join(', ');
  if (text.length > 25) {
    text = text.substring(0, 22) + '...';
  }
  
  return text;
});

// Largeur approximative du texte des conditions pour le rectangle de fond
const conditionsLabelWidth = computed(() => {
  return Math.max(conditionsText.value.length * 5.5, 60);
});

// Fonction pour obtenir le libellé d'une condition à partir de son ID
function getConditionLabel(conditionId) {
  for (const pkg of props.packetCondition) {
    const condition = pkg.functions.find(c => c.id === conditionId);
    if (condition) {
      return condition.label;
    }
  }
  return conditionId;
}
</script>

<style scoped>
/* Animation subtile pour les éléments visuels */
rect, circle {
  transition: all 0.2s ease;
}

/* Animation pour les états de survol (à ajouter si nécessaire) */
rect:hover, circle:hover {
  filter: brightness(1.05);
}
</style>