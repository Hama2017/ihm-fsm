import { ref } from 'vue';
import toast from '@/composables/Toast/useToast';

/**
 * Composable pour gérer la vérification des dépendances entre automates
 * 
 * @param {Object} options Configuration du composable
 * @param {Ref<Array>} options.contractAutomates Liste des automates du contrat
 * @param {Ref<String|null>} options.activeAutomateId ID de l'automate actif
 * @returns {Object} Fonctions pour la vérification des dépendances
 */
export default function useDependencyChecker({
  contractAutomates,
  activeAutomateId
}) {
  // Message d'erreur pour les dépendances
  const dependencyError = ref('');
  
  /**
   * Vérifie si l'ajout d'une dépendance créerait un cycle entre les automates
   * 
   * @param {String} sourceAutomateId ID de l'automate source (qui dépend de)
   * @param {String} targetAutomateId ID de l'automate cible (qui est dépendant)
   * @returns {Boolean} True si un cycle serait créé, False sinon
   */
  const wouldCreateCycle = (sourceAutomateId, targetAutomateId) => {
    // Créer une copie du graphe de dépendances actuel
    const graph = {};
    const automateIds = contractAutomates.value.map(a => a.id);
    
    // Initialiser le graphe
    automateIds.forEach(id => {
      graph[id] = [];
    });
    
    // Construire le graphe de dépendances
    contractAutomates.value.forEach(automate => {
      automate.transitions.forEach(transition => {
        if (transition.automataDependencies && transition.automataDependencies.length > 0) {
          transition.automataDependencies.forEach(dependencyId => {
            if (!graph[dependencyId]) graph[dependencyId] = [];
            graph[dependencyId].push(automate.id);
          });
        }
      });
    });
    
    // Ajouter la nouvelle dépendance pour la vérification
    if (!graph[targetAutomateId]) graph[targetAutomateId] = [];
    graph[targetAutomateId].push(sourceAutomateId);
    
    // Fonction DFS pour détecter les cycles
    const visited = new Set();
    const recStack = new Set();
    
    const hasCycle = (node) => {
      if (!visited.has(node)) {
        visited.add(node);
        recStack.add(node);
        
        for (const neighbor of graph[node] || []) {
          if (!visited.has(neighbor) && hasCycle(neighbor)) {
            return true;
          } else if (recStack.has(neighbor)) {
            return true;
          }
        }
      }
      
      recStack.delete(node);
      return false;
    };
    
    // Vérifier s'il y a un cycle à partir du nœud cible
    return hasCycle(targetAutomateId);
  };
  
  /**
   * Vérifie si le contrat a des dépendances cycliques entre automates
   * 
   * @returns {Boolean} True si des cycles existent, False sinon
   */
  const hasAutomataCyclicDependencies = () => {
    const graph = {};
    const automateIds = contractAutomates.value.map(a => a.id);
    
    // Initialiser le graphe
    automateIds.forEach(id => {
      graph[id] = [];
    });
    
    // Construire le graphe de dépendances
    contractAutomates.value.forEach(automate => {
      automate.transitions.forEach(transition => {
        if (transition.automataDependencies && transition.automataDependencies.length > 0) {
          // Pour chaque dépendance, ajouter un lien dans le graphe
          transition.automataDependencies.forEach(dependencyId => {
            if (!graph[dependencyId]) graph[dependencyId] = [];
            graph[dependencyId].push(automate.id);
          });
        }
      });
    });
    
    // Fonction DFS pour détecter les cycles
    const visited = new Set();
    const recStack = new Set();
    const cyclePaths = [];
    
    const detectCycle = (node, path = []) => {
      if (!visited.has(node)) {
        visited.add(node);
        recStack.add(node);
        path.push(node);
        
        for (const neighbor of graph[node] || []) {
          if (!visited.has(neighbor)) {
            const result = detectCycle(neighbor, [...path]);
            if (result.hasCycle) {
              return result;
            }
          } else if (recStack.has(neighbor)) {
            // Trouver l'index où commence le cycle
            const startIdx = path.indexOf(neighbor);
            const cyclePath = path.slice(startIdx).concat(neighbor);
            return { hasCycle: true, path: cyclePath };
          }
        }
        
        recStack.delete(node);
      }
      
      return { hasCycle: false, path: [] };
    };
    
    // Vérifier chaque nœud
    for (const node of automateIds) {
      const result = detectCycle(node);
      if (result.hasCycle) {
        const cycleNames = result.path.map(id => {
          const automate = contractAutomates.value.find(a => a.id === id);
          return automate ? automate.name : id;
        });
        
        dependencyError.value = `Dépendance cyclique détectée: ${cycleNames.join(' → ')}`;
        return true;
      }
    }
    
    dependencyError.value = '';
    return false;
  };
  
  /**
   * Vérifie si tous les automates ont un état final
   * 
   * @returns {Boolean} True si tous les automates ont un état final, False sinon
   */
  const allAutomatesHaveFinalState = () => {
    for (const automate of contractAutomates.value) {
      // Ignorer l'automate de déploiement
      if (automate.id === 'flow-deploiement') continue;
      
      // Vérifier si cet automate a au moins un état final
      const hasFinalState = automate.states.some(state => {
        return !automate.transitions.some(transition => transition.source === state.id);
      });
      
      if (!hasFinalState) {
        return false;
      }
    }
    
    return true;
  };
  
  /**
   * Vérifie si un état est le dernier état final d'un automate
   * 
   * @param {String} stateId ID de l'état à vérifier
   * @returns {Boolean} True si c'est le dernier état final, False sinon
   */
  const isLastFinalState = (stateId) => {
    if (!activeAutomateId.value) return false;
    
    const automate = contractAutomates.value.find(a => a.id === activeAutomateId.value);
    if (!automate) return false;
    
    // Trouver tous les états finaux (états sans transitions sortantes)
    const finalStates = automate.states.filter(state => 
      !automate.transitions.some(transition => transition.source === state.id)
    );
    
    // C'est le dernier état final si c'est le seul et que c'est celui qu'on vérifie
    return finalStates.length === 1 && finalStates[0].id === stateId;
  };
  
  /**
   * Ajoute une dépendance d'automate à une transition si elle ne crée pas de cycle
   * 
   * @param {String} transitionId ID de la transition
   * @param {String} dependencyId ID de l'automate dépendant
   * @returns {Object} Résultat de l'opération
   */
  const addAutomataDependencySafely = (transitionId, dependencyId) => {
    // Vérifier si l'ajout créerait un cycle
    if (wouldCreateCycle(activeAutomateId.value, dependencyId)) {
      toast.error(`Impossible d'ajouter cette dépendance: créerait un cycle entre les automates`);
      return { success: false, message: 'Dépendance cyclique détectée' };
    }
    
    // Trouver la transition
    const automate = contractAutomates.value.find(a => a.id === activeAutomateId.value);
    if (!automate) {
      return { success: false, message: 'Automate non trouvé' };
    }
    
    const transitionIndex = automate.transitions.findIndex(t => t.id === transitionId);
    if (transitionIndex === -1) {
      return { success: false, message: 'Transition non trouvée' };
    }
    
    // Ajouter la dépendance
    if (!automate.transitions[transitionIndex].automataDependencies) {
      automate.transitions[transitionIndex].automataDependencies = [];
    }
    
    // Vérifier si la dépendance existe déjà
    if (!automate.transitions[transitionIndex].automataDependencies.includes(dependencyId)) {
      automate.transitions[transitionIndex].automataDependencies.push(dependencyId);
    }
    
    return { success: true, message: 'Dépendance ajoutée avec succès' };
  };
  
  /**
   * Calcule l'ordre de déploiement des automates en fonction des dépendances
   * 
   * @returns {Array} Liste des IDs d'automates dans l'ordre de déploiement
   */
  const getDeploymentOrder = () => {
    // Créer un graphe de dépendances
    const graph = {};
    const indegree = {};
    
    // Exclure l'automate de déploiement
    const realAutomates = contractAutomates.value.filter(a => a.id !== 'flow-deploiement');
    
    // Initialiser
    realAutomates.forEach(automate => {
      graph[automate.id] = [];
      indegree[automate.id] = 0;
    });
    
    // Construire le graphe
    realAutomates.forEach(automate => {
      automate.transitions.forEach(transition => {
        if (transition.automataDependencies && transition.automataDependencies.length > 0) {
          transition.automataDependencies.forEach(dependencyId => {
            // Ajouter une arête du automate dépendant au automate actuel
            graph[dependencyId].push(automate.id);
            indegree[automate.id]++;
          });
        }
      });
    });
    
    // Tri topologique
    const queue = [];
    const result = [];
    
    // Trouver les nœuds sans dépendances
    for (const automateId in indegree) {
      if (indegree[automateId] === 0) {
        queue.push(automateId);
      }
    }
    
    // Parcourir le graphe
    while (queue.length > 0) {
      const automateId = queue.shift();
      result.push(automateId);
      
      // Réduire le degré d'entrée des voisins
      for (const neighbor of graph[automateId]) {
        indegree[neighbor]--;
        if (indegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      }
    }
    
    return result;
  };
  
  return {
    dependencyError,
    wouldCreateCycle,
    hasAutomataCyclicDependencies,
    allAutomatesHaveFinalState,
    isLastFinalState,
    addAutomataDependencySafely,
    getDeploymentOrder
  };
}