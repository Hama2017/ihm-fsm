// CustomNodeComponents.js
// Ce fichier contient des composants personnalisés pour les nœuds dans VueFlow

import { Position } from '@vue-flow/core';

// Composant pour un nœud d'état initial
export const InitialStateNode = {
  template: `
    <div class="initial-state-node">
      <div class="state-content">
        <div class="state-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8L12 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M8 12L16 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="state-label">{{ data.label }}</div>
      </div>
      <div class="nodrag">
        <handle 
          type="source" 
          position="bottom" 
          :style="{ top: '100%', left: '50%' }"
        />
      </div>
    </div>
  `,
  props: ['data', 'selected'],
  setup(props) {
    return {
      ...props
    };
  }
};

// Composant pour un nœud d'état final
export const FinalStateNode = {
  template: `
    <div class="final-state-node">
      <div class="nodrag">
        <handle 
          type="target" 
          position="top" 
          :style="{ top: '0%', left: '50%' }"
        />
      </div>
      <div class="state-content">
        <div class="state-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="state-label">{{ data.label }}</div>
      </div>
    </div>
  `,
  props: ['data', 'selected'],
  setup(props) {
    return {
      ...props
    };
  }
};

// Composant pour un nœud d'état standard
export const StandardStateNode = {
  template: `
    <div class="standard-state-node">
      <div class="nodrag">
        <handle 
          type="target" 
          position="top" 
          :style="{ top: '0%', left: '50%' }"
        />
      </div>
      <div class="state-content">
        <div class="state-label">{{ data.label }}</div>
      </div>
      <div class="nodrag">
        <handle 
          type="source" 
          position="bottom" 
          :style="{ top: '100%', left: '50%' }"
        />
      </div>
    </div>
  `,
  props: ['data', 'selected'],
  setup(props) {
    return {
      ...props
    };
  }
};

// Styles CSS pour les nœuds personnalisés
export const nodeStyles = `
  .initial-state-node, .final-state-node, .standard-state-node {
    border-radius: 8px;
    padding: 10px 15px;
    font-size: 14px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    min-width: 120px;
    text-align: center;
  }
  
  .initial-state-node {
    background-color: #dcfce7;
    border: 2px solid #86efac;
    color: #166534;
  }
  
  .final-state-node {
    background-color: #dbeafe;
    border: 2px solid #93c5fd;
    color: #1e40af;
  }
  
  .standard-state-node {
    background-color: #f9fafb;
    border: 2px solid #e5e7eb;
    color: #374151;
  }
  
  .dark .initial-state-node {
    background-color: #064e3b;
    border: 2px solid #10b981;
    color: #d1fae5;
  }
  
  .dark .final-state-node {
    background-color: #172554;
    border: 2px solid #3b82f6;
    color: #bfdbfe;
  }
  
  .dark .standard-state-node {
    background-color: #1f2937;
    border: 2px solid #4b5563;
    color: #e5e7eb;
  }
  
  .state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
  
  .state-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 24px;
  }
  
  .state-label {
    font-weight: 500;
  }
  
  .vue-flow__node.selected .initial-state-node,
  .vue-flow__node.selected .final-state-node,
  .vue-flow__node.selected .standard-state-node {
    box-shadow: 0 0 0 2px #3b82f6;
  }
`;

// Configuration des nœuds avec leurs positions par défaut
export const getNodeConfig = (type) => {
  const baseConfig = {
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  };
  
  switch (type) {
    case 'initial':
      return {
        ...baseConfig,
        type: 'initialState',
        sourcePosition: Position.Bottom,
        targetPosition: null, // Initial nodes don't have target handles
      };
    case 'final':
      return {
        ...baseConfig,
        type: 'finalState',
        sourcePosition: null, // Final nodes don't have source handles
        targetPosition: Position.Top,
      };
    default:
      return {
        ...baseConfig,
        type: 'standardState',
      };
  }
};