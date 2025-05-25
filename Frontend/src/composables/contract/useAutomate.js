import { ref } from 'vue';
import { MarkerType } from '@vue-flow/core';
import toast from '@/composables/Toast/useToast';
import defaultTemplate from '@/config/defaultAutomateTemplate';

export default function useAutomate({
  contractAutomates,
  activeAutomateId,
  currentNodes,
  currentEdges,
  activeStateId,
  activeTransitionId,
  historyStack,
  historyIndex,
  canUndo,
  canRedo,
  updateNodeStyles,
  updateEdgeStyles,
  validateAutomate,
  getNodeConfig,
  getBaseNodeStyle,
  getBaseEdgeStyle
}) {
  const showAutomateModal = ref(false);
  const editingAutomateId = ref(null);
  const editingAutomateName = ref('');
  const automateModalError = ref('');

  const resetModal = (id = null, name = '') => {
    editingAutomateId.value = id;
    editingAutomateName.value = name;
    automateModalError.value = '';
    showAutomateModal.value = true;
  };

  const selectAutomate = (id) => {
    if (activeAutomateId.value === id) {
      clearCurrentAutomate();
      return;
    }

    if (activeAutomateId.value) saveCurrentAutomateState();

    activeAutomateId.value = id;
    loadAutomateState(id);

    resetActiveState();
    resetHistory();
    saveToHistory();
    validateAutomate();
  };

  const clearCurrentAutomate = () => {
    activeAutomateId.value = null;
    currentNodes.value = [];
    currentEdges.value = [];
    resetActiveState();
  };

  const resetActiveState = () => {
    activeStateId.value = null;
    activeTransitionId.value = null;
  };

  const resetHistory = () => {
    historyStack.value = [];
    historyIndex.value = -1;
    canUndo.value = false;
    canRedo.value = false;
  };

  const addAutomate = () => resetModal();

  const editAutomate = (id) => {
    const automate = contractAutomates.value.find(a => a.id === id);
    if (automate) resetModal(id, automate.name);
  };

  const removeAutomate = (id) => {
    const index = contractAutomates.value.findIndex(a => a.id === id);
    if (index === -1) return;

    if (activeAutomateId.value === id) clearCurrentAutomate();

    contractAutomates.value.splice(index, 1);

    if (contractAutomates.value.length > 0 && !activeAutomateId.value) {
      selectAutomate(contractAutomates.value[0].id);
    }

    toast.success('Clause supprimée avec succès');
  };

  const confirmAutomateEdit = () => {
    const name = editingAutomateName.value.trim();
    if (!name) return automateModalError.value = 'Le nom ne peut pas être vide';

    const nameExists = contractAutomates.value.some(a => a.name.toLowerCase() === name.toLowerCase() && a.id !== editingAutomateId.value);
    if (nameExists) return automateModalError.value = 'Une clause avec ce nom existe déjà';

    if (editingAutomateId.value) {
      const automate = contractAutomates.value.find(a => a.id === editingAutomateId.value);
      if (automate) {
        automate.name = name;
        toast.success(`Automate "${name}" modifié avec succès`);
      }
    } else {
      const newId = generateNewAutomateId();
      const baseConfig = JSON.parse(JSON.stringify(defaultTemplate));

      const newAutomate = {
        id: newId,
        name,
        states: baseConfig.states,
        transitions: baseConfig.transitions.map(t => ({
          ...t,
          markerEnd: MarkerType.ArrowClosed
        }))
      };

      contractAutomates.value.push(newAutomate);
      toast.success(`Clause "${name}" créée avec succès`);
      selectAutomate(newId);
    }

    showAutomateModal.value = false;
  };

  const generateNewAutomateId = () => {
    const maxId = Math.max(0, ...contractAutomates.value.map(a => parseInt(a.id)));
    return String(maxId + 1).padStart(2, '0');
  };

  const safeCloneNodes = () => currentNodes.value.map(n => ({
    id: n.id,
    data: { label: n.data.label },
    position: n.position,
    type: n.type,
    sourcePosition: n.sourcePosition,
    targetPosition: n.targetPosition,
    style: n.style
  }));

  const safeCloneEdges = () => currentEdges.value.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    markerEnd: e.markerEnd,
    style: e.style,
    conditions: e.conditions || [],
    automataDependencies: e.automataDependencies || null
  }));

  const saveToHistory = () => {
    if (historyIndex.value < historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, historyIndex.value + 1);
    }

    historyStack.value.push({
      nodes: safeCloneNodes(),
      edges: safeCloneEdges(),
      activeStateId: activeStateId.value,
      activeTransitionId: activeTransitionId.value
    });

    historyIndex.value = historyStack.value.length - 1;
    canUndo.value = historyIndex.value > 0;
    canRedo.value = false;
  };

  const saveCurrentAutomateState = () => {
    const automate = contractAutomates.value.find(a => a.id === activeAutomateId.value);
    if (!automate) return;

    automate.states = safeCloneNodes().map(n => ({
      id: n.id,
      label: n.data.label,
      position: n.position,
      type: n.type,
      sourcePosition: n.sourcePosition,
      targetPosition: n.targetPosition
    }));

    automate.transitions = safeCloneEdges();
  };

  const loadAutomateState = (id) => {
    const automate = contractAutomates.value.find(a => a.id === id);
    if (!automate) return;

    currentNodes.value = automate.states.map(s => ({
      id: s.id,
      position: s.position,
      data: { label: s.label },
      ...getNodeConfig(s.type || 'standard'),
      style: getBaseNodeStyle()
    }));

    currentEdges.value = automate.transitions.map(t => ({
      ...t,
      markerEnd: MarkerType.ArrowClosed,
      style: getBaseEdgeStyle()
    }));

    updateEdgeStyles(activeTransitionId.value);
  };

  const undo = () => {
    if (historyIndex.value > 0) {
      historyIndex.value--;
      const state = historyStack.value[historyIndex.value];
      currentNodes.value = state.nodes;
      currentEdges.value = state.edges;
      activeStateId.value = state.activeStateId;
      activeTransitionId.value = state.activeTransitionId;
      canUndo.value = historyIndex.value > 0;
      canRedo.value = true;
      updateNodeStyles(activeStateId.value);
      updateEdgeStyles(activeTransitionId.value);
    }
  };

  const redo = () => {
    if (historyIndex.value < historyStack.value.length - 1) {
      historyIndex.value++;
      const state = historyStack.value[historyIndex.value];
      currentNodes.value = state.nodes;
      currentEdges.value = state.edges;
      activeStateId.value = state.activeStateId;
      activeTransitionId.value = state.activeTransitionId;
      canUndo.value = true;
      canRedo.value = historyIndex.value < historyStack.value.length - 1;
      updateNodeStyles(activeStateId.value);
      updateEdgeStyles(activeTransitionId.value);
    }
  };

  const activeAutomateName = () => {
    return contractAutomates.value.find(a => a.id === activeAutomateId.value)?.name || '';
  };

  return {
    showAutomateModal,
    editingAutomateId,
    editingAutomateName,
    automateModalError,
    selectAutomate,
    addAutomate,
    editAutomate,
    removeAutomate,
    confirmAutomateEdit,
    saveToHistory,
    saveCurrentAutomateState,
    loadAutomateState,
    undo,
    redo,
    activeAutomateName
  };
}