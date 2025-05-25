import apiClient from './api.config';

/**
 * Service de gestion des contrats automatiques.
 * Permet la création, modification, suppression et récupération des contrats.
 */
const automatonContractService = {
  /**
   * Crée un nouveau contrat automatisé.
   * @param {Object} contractData - Données du contrat à créer
   * @returns {Promise<Object>} Contrat créé
   * @throws {Error} Erreur en cas d'échec
   */
  async createContract(contractData) {
    try {
      const response = await apiClient.post('/automaton-contracts/', contractData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère un contrat par son ID.
   * @param {string} contractId - ID du contrat à récupérer
   * @returns {Promise<Object>} Contrat récupéré
   * @throws {Error} Erreur en cas d'échec
   */
  async getContract(contractId) {
    try {
      const response = await apiClient.get(`/automaton-contracts/${contractId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Met à jour un contrat existant.
   * @param {string} contractId - ID du contrat à mettre à jour
   * @param {Object} contractData - Nouvelles données du contrat
   * @returns {Promise<Object>} Contrat mis à jour
   * @throws {Error} Erreur en cas d'échec
   */
  async updateContract(contractId, contractData) {
    try {
      const response = await apiClient.put(`/automaton-contracts/${contractId}`, contractData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Supprime un contrat par son ID.
   * @param {string} contractId - ID du contrat à supprimer
   * @returns {Promise<Object>} Confirmation de suppression
   * @throws {Error} Erreur en cas d'échec
   */
  async deleteContract(contractId) {
    try {
      const response = await apiClient.delete(`/automaton-contracts/${contractId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère la liste de tous les contrats.
   * @returns {Promise<Array>} Liste des contrats
   * @throws {Error} Erreur en cas d'échec
   */
  async getAllContracts() {
    try {
      const response = await apiClient.get('/automaton-contracts/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Récupère les contrats créés par un utilisateur spécifique.
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Array>} Liste des contrats de l'utilisateur
   * @throws {Error} Erreur en cas d'échec
   */
  async getContractsByUser(userId) {
    try {
      const response = await apiClient.get(`/automaton-contracts/by-user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  
/**
 * Transforme un contrat pour le déploiement selon le format attendu par l'API.
 * @param {Object} contract - Contrat à transformer
 * @returns {Object} Contrat au format pour le déploiement
 */
transformContractForDeployment(contract) {
  // Structure de sortie selon le Swagger
  const specificationModel = {
    name: contract.id, 
    automatons: {},
    required_packages: []
  };

  // Collecter les packages utilisés
  const packagesUsed = new Set();

  // Conditions par défaut si aucune condition n'est détectée
  const defaultConditions = ["package__p1__c1", "package__p2__c2"];
  
  // Packages par défaut
  const defaultPackages = ['p1', 'p2'];

  // Normaliser un nom de variable
  const normalizeStateName = (name) => {
    if (!name) return 'q0';
    
    // Convertir en minuscules et supprimer les accents
    let normalized = name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '_');
    
    // Préfixer avec q si commence par un chiffre
    if (/^[0-9]/.test(normalized)) {
      normalized = 'q' + normalized;
    }
    
    return normalized || 'q0';
  };

  // NOUVEAU: Créer un mapping des IDs d'automates vers leurs noms générés
  const automatonIdToName = {};
  let automatonIndex = 0;

  // Premier passage: créer le mapping des IDs d'automates
  if (Array.isArray(contract.automates)) {
    contract.automates.forEach((automate) => {
      // Ignorer l'automate de déploiement
      if (automate.id === 'flow-deploiement') return;
      
      const automatonKey = `Automata${automatonIndex}`;
      automatonIdToName[automate.id] = automatonKey;
      automatonIndex++;
    });
  }

  // Deuxième passage: créer les automates avec les bonnes références
  automatonIndex = 0; // Reset pour la création

  // Parcourir les automates
  if (Array.isArray(contract.automates)) {
    contract.automates.forEach((automate) => {
      // Ignorer l'automate de déploiement
      if (automate.id === 'flow-deploiement') return;
      
      const automatonKey = `Automata${automatonIndex}`;
      const automatonObj = {
        states: [],
        transitions: []
      };
      
      // Map de correspondance ID -> nom normalisé
      const stateNameMap = {};
      
      // Extraire les états
      if (Array.isArray(automate.states)) {
        automate.states.forEach(state => {
          const normalizedName = normalizeStateName(state.label);
          stateNameMap[state.id] = normalizedName;
          automatonObj.states.push(normalizedName);
        });
      }

      // Ajouter l'état "completed" si nécessaire
      if (!automatonObj.states.includes("completed")) {
        const finalState = automate.states.find(s => s.type === 'final');
        if (finalState) {
          stateNameMap[finalState.id] = "completed";
          const finalStateIndex = automatonObj.states.indexOf(normalizeStateName(finalState.label));
          if (finalStateIndex !== -1) {
            automatonObj.states[finalStateIndex] = "completed";
          } else {
            automatonObj.states.push("completed");
          }
        } else {
          automatonObj.states.push("completed");
        }
      }
      
      // Extraire les transitions AVANT le tri topologique
      if (Array.isArray(automate.transitions)) {
        automate.transitions.forEach(transition => {
          if (transition.source && transition.target) {
            const sourceLabel = stateNameMap[transition.source] || 'q0';
            let targetLabel = stateNameMap[transition.target] || 'q1';
            
            // Si la cible est un état final, utiliser "completed"
            const targetState = automate.states.find(s => s.id === transition.target);
            if (targetState && targetState.type === 'final') {
              targetLabel = "completed";
            }
            
            const transitionObj = {
              source: sourceLabel,
              destination: targetLabel,
              trigger: normalizeStateName(transition.label),
              conditions: []
            };
            
            // CORRECTION: Extraire correctement les packages des conditions
            if (Array.isArray(transition.conditions)) {
              transition.conditions.forEach(condition => {
                // Si la condition est une string
                if (typeof condition === 'string') {
                  transitionObj.conditions.push(condition);
                  
                  // Extraire le package si format package__nom
                  if (condition.startsWith('package__')) {
                    const parts = condition.split('__');
                    if (parts.length >= 2) {
                      packagesUsed.add(parts[1]);
                    }
                  }
                }
                // Si la condition est un objet
                else if (typeof condition === 'object' && condition !== null) {
                  // Ajouter la condition au format string si disponible
                  if (condition.condition) {
                    transitionObj.conditions.push(condition.condition);
                  }
                  
                  // Extraire le nom du package depuis l'objet
                  if (condition.package) {
                    let packageName;
                    
                    if (typeof condition.package === 'object') {
                      // L'objet package a un format {id, label, name}
                      packageName = condition.package.name || 
                                  condition.package.label || 
                                  condition.package.id;
                    } else if (typeof condition.package === 'string') {
                      packageName = condition.package;
                    }
                    
                    if (packageName) {
                      packagesUsed.add(packageName);
                    }
                  }
                }
              });
            }
            
            // NOUVEAU: Gérer les dépendances d'automates
            if (Array.isArray(transition.automataDependencies)) {
              transition.automataDependencies.forEach(dependency => {
                let dependencyName;
                
                // Si la dépendance est une string (ID de l'automate)
                if (typeof dependency === 'string') {
                  dependencyName = automatonIdToName[dependency];
                }
                // Si la dépendance est un objet avec un ID
                else if (typeof dependency === 'object' && dependency !== null) {
                  if (dependency.id) {
                    dependencyName = automatonIdToName[dependency.id];
                  } else if (dependency.automatonId) {
                    dependencyName = automatonIdToName[dependency.automatonId];
                  } else if (dependency.name) {
                    // Chercher par nom dans le mapping
                    const foundKey = Object.keys(automatonIdToName).find(key => 
                      contract.automates.find(a => a.id === key && a.name === dependency.name)
                    );
                    if (foundKey) {
                      dependencyName = automatonIdToName[foundKey];
                    }
                  }
                }
                
                // Ajouter la condition de dépendance d'automate
                if (dependencyName) {
                  const automataCondition = `automata__${dependencyName}__is_completed`;
                  transitionObj.conditions.push(automataCondition);
                  console.log(`Dépendance d'automate ajoutée: ${automataCondition}`);
                } else {
                  console.warn('Dépendance d\'automate non trouvée:', dependency);
                }
              });
            }
            
            automatonObj.transitions.push(transitionObj);
          }
        });
      }

      // ===== TRI TOPOLOGIQUE APRÈS AVOIR CRÉÉ LES TRANSITIONS =====
      // Étape 1 : construire le graphe de transitions
      const graph = {};
      const inDegree = {};
      
      // Initialiser le graphe et les degrés entrants
      automatonObj.states.forEach(state => {
        graph[state] = [];
        inDegree[state] = 0;
      });

      // Construire le graphe à partir des transitions
      automatonObj.transitions.forEach(({ source, destination }) => {
        if (!graph[source]) graph[source] = [];
        graph[source].push(destination);
        inDegree[destination] = (inDegree[destination] || 0) + 1;
      });

      // Étape 2 : trouver les nœuds avec inDegree 0 (états initiaux)
      const queue = Object.keys(inDegree).filter(state => inDegree[state] === 0);

      // Étape 3 : tri topologique (algorithme de Kahn)
      const sortedStates = [];
      const visited = new Set();
      const tempInDegree = { ...inDegree }; // Copie pour ne pas modifier l'original

      while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;

        visited.add(current);
        sortedStates.push(current);

        // Réduire le degré entrant des voisins
        for (const neighbor of graph[current] || []) {
          tempInDegree[neighbor]--;
          if (tempInDegree[neighbor] === 0 && !visited.has(neighbor)) {
            queue.push(neighbor);
          }
        }
      }

      // Étape 4 : ajouter les états isolés (sans transitions)
      automatonObj.states.forEach(state => {
        if (!visited.has(state)) {
          sortedStates.push(state);
        }
      });

      // Étape 5 : s'assurer que "completed" est toujours en dernier
      const completedIndex = sortedStates.indexOf("completed");
      if (completedIndex !== -1 && completedIndex !== sortedStates.length - 1) {
        sortedStates.splice(completedIndex, 1);
        sortedStates.push("completed");
      }

      // Remplacer les états par l'ordre topologique
      automatonObj.states = sortedStates;
      
      console.log(`Ordre topologique pour ${automatonKey}:`, sortedStates);
      
      // Ajouter l'automate au modèle de spécification
      specificationModel.automatons[automatonKey] = automatonObj;
      automatonIndex++;
    });
  }
  
  // Convertir les packages utilisés en tableau de noms (strings)
  specificationModel.required_packages = Array.from(packagesUsed);
  
  // Si aucun package n'est détecté, ajouter les packages par défaut
  if (specificationModel.required_packages.length === 0) {
    specificationModel.required_packages.push(...defaultPackages);
  }
  
  console.log('Mapping des automates:', automatonIdToName);
  console.log('Packages extraits:', Array.from(packagesUsed));
  console.log('Spécification finale:', specificationModel);
  
  return specificationModel;
}
};

export default automatonContractService;