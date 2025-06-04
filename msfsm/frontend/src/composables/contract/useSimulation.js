import { ref, computed } from 'vue'
import useGraphStyles from '@/composables/contract/useGraphStyles' // adapte le chemin si nécessaire

export default function useSimulation(nodes, edges, isDarkMode) {
  const isSimulating = ref(false)
  const simulationCurrentState = ref(null)
  const simulationVisitedStates = ref([])
  const showSimulationModal = ref(false)
  const showDeploymentSummaryModal = ref(false)
  const deploymentResult = ref([])

  // 🎨 Récupère tous les styles depuis useGraphStyles
  const {
    getBaseNodeStyle,
    getBaseEdgeStyle,
    getActiveEdgeStyle,
    getAnimatedEdgeStyle,
    updateNodeStyles,
  } = useGraphStyles({ isDarkMode })

  /**
   * Bascule entre le mode simulation et le mode normal
   */
  const toggleSimulation = () => {
    if (isSimulating.value) {
      isSimulating.value = false
      simulationCurrentState.value = null
      simulationVisitedStates.value = []
      resetGraphStyles()
      return { success: true, message: 'Mode simulation désactivé.' }
    } else {
      showSimulationModal.value = true
      return { success: true, action: 'open-modal' }
    }
  }

  /**
   * Réinitialise la simulation au premier état initial
   */
  const resetSimulation = () => {
    const incomingTransitions = new Set(edges.value.map(edge => edge.target))
    const potentialInitialStates = nodes.value.filter(node => !incomingTransitions.has(node.id))

    if (potentialInitialStates.length > 0) {
      simulationCurrentState.value = potentialInitialStates[0].id
    } else if (nodes.value.length > 0) {
      simulationCurrentState.value = nodes.value[0].id
    } else {
      simulationCurrentState.value = null
    }

    simulationVisitedStates.value = simulationCurrentState.value ? [simulationCurrentState.value] : []
  }

  /**
   * Anime une transition entre deux états
   */
  const animateTransition = (sourceId, targetId) => {
    const animatedEdge = {
      id: `animated-${Date.now()}`,
      source: sourceId,
      target: targetId,
      animated: true,
      markerEnd: { type: 'arrowclosed' },
      style: getAnimatedEdgeStyle(),
      class: 'animated-edge',
    }

    edges.value.push(animatedEdge)

    setTimeout(() => {
      edges.value = edges.value.filter(e => e.id !== animatedEdge.id)
    }, 1200)
  }

  /**
   * Simule une transition vers un état cible
   */
  const simulateTransition = (node) => {
    if (!isSimulating.value || !simulationCurrentState.value)
      return { success: false, message: 'Aucune simulation en cours' }

    const availableTransitions = edges.value.filter(edge =>
      edge.source === simulationCurrentState.value && edge.target === node.id
    )

    if (availableTransitions.length > 0) {
      animateTransition(simulationCurrentState.value, node.id)
      simulationCurrentState.value = node.id

      if (!simulationVisitedStates.value.includes(node.id)) {
        simulationVisitedStates.value.push(node.id)
      }

      return { success: true, message: `Transition vers "${node.data.label}" effectuée` }
    } else if (node.id === simulationCurrentState.value) {
      return { success: true, message: `État actuel: "${node.data.label}"` }
    } else {
      return { success: false, message: `Transition vers "${node.data.label}" impossible` }
    }
  }

  /**
   * Simule le déploiement automatique par ordre topologique
   */
  const simulateDeployment = async () => {
    try {
      showSimulationModal.value = false

      if (!nodes.value.length || !edges.value.length)
        return { success: false, message: 'Aucun nœud ou arête dans l\'automate' }

      isSimulating.value = true
      simulationVisitedStates.value = []
      simulationCurrentState.value = null

      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

      const graph = {}
      const indegree = {}

      nodes.value.forEach((node) => {
        graph[node.id] = []
        indegree[node.id] = 0
      })

      edges.value.forEach((edge) => {
        graph[edge.source].push(edge.target)
        indegree[edge.target]++
      })

      const queue = Object.keys(indegree).filter(id => indegree[id] === 0)
      const deployed = new Set()
      const deploymentOrder = []

      while (queue.length > 0) {
        const current = queue.shift()
        simulationCurrentState.value = current
        simulationVisitedStates.value.push(current)
        deploymentOrder.push(current)

        // Mettre à jour le style du nœud
        nodes.value = updateNodeStyles(nodes.value, current)

        const outgoing = edges.value.filter(e => e.source === current)
        for (const edge of outgoing) {
          edge.style = getActiveEdgeStyle()
        }

        await delay(600)

        for (const target of graph[current]) {
          indegree[target]--
          if (indegree[target] === 0 && !deployed.has(target)) {
            queue.push(target)
          }
        }

        deployed.add(current)
      }

      simulationCurrentState.value = null
      deploymentResult.value = deploymentOrder
      showDeploymentSummaryModal.value = true
      isSimulating.value = false

      return { success: true, message: 'Simulation du Déploiement terminée' }
    } catch (error) {
      console.error('Erreur lors de la simulation du déploiement:', error)
      return { success: false, message: 'Erreur lors de la simulation du déploiement' }
    }
  }

  const launchSimulation = () => simulateDeployment()

  /**
   * Réinitialise tous les styles du graphe
   */
  const resetGraphStyles = () => {
    nodes.value.forEach(node => {
      node.style = getBaseNodeStyle()
    })

    edges.value.forEach(edge => {
      edge.style = getBaseEdgeStyle()
    })
  }

  /**
   * Ferme le modal de résumé de déploiement
   */
  const closeDeploymentSummaryModal = () => {
    showDeploymentSummaryModal.value = false
    deploymentResult.value = []
    isSimulating.value = false
    resetGraphStyles()
  }

  return {
    isSimulating,
    simulationCurrentState,
    simulationVisitedStates,
    showSimulationModal,
    showDeploymentSummaryModal,
    deploymentResult,
    toggleSimulation,
    resetSimulation,
    animateTransition,
    simulateTransition,
    simulateDeployment,
    launchSimulation,
    closeDeploymentSummaryModal,
    resetGraphStyles
  }
}
