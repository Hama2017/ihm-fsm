import { ref, computed } from 'vue';

/**
 * Système simple d'internationalisation (i18n) pour l'application
 */
export function useI18n() {
  // Langues disponibles
  const AVAILABLE_LOCALES = ['fr', 'en'];
  
  // Langue par défaut
  const DEFAULT_LOCALE = 'fr';
  
  // Langue actuelle (récupérée du localStorage ou langue par défaut)
  const currentLocale = ref(
    localStorage.getItem('app_locale') || navigator.language?.split('-')[0] || DEFAULT_LOCALE
  );
  
  // Vérifier si la langue est supportée, sinon utiliser la langue par défaut
  if (!AVAILABLE_LOCALES.includes(currentLocale.value)) {
    currentLocale.value = DEFAULT_LOCALE;
  }
  
  // Dictionnaire de traductions
  const messages = {
    fr: {
      common: {
        save: 'Sauvegarder',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        edit: 'Modifier',
        delete: 'Supprimer',
        create: 'Créer',
        deploy: 'Déployer',
        back: 'Retour',
        add: 'Ajouter',
        loading: 'Chargement...',
        yes: 'Oui',
        no: 'Non'
      },
      contract: {
        name: 'Nom du contrat',
        status: {
          draft: 'Brouillon',
          deployed: 'Déployé',
          active: 'Actif'
        },
        noAutomate: 'Aucun automate',
        automateCount: '{count} automate | {count} automates',
        createdAt: 'Créé le',
        updatedAt: 'Mis à jour le',
        confirmUpdate: 'Mettre à jour le contrat existant ?',
        confirmUpdateMessage: 'Un contrat nommé "{name}" existe déjà. Voulez-vous mettre à jour ce contrat existant ?'
      },
      automate: {
        name: 'Nom de la clause',
        addState: 'Ajouter un état',
        editState: 'Modifier l\'état',
        removeState: 'Supprimer l\'état',
        confirmDeleteState: 'Êtes-vous sûr de vouloir supprimer cet état ?',
        stateType: {
          initial: 'État initial',
          standard: 'État standard',
          final: 'État final'
        }
      },
      transition: {
        name: 'Déclencheur',
        addTransition: 'Ajouter une transition',
        editTransition: 'Modifier la transition',
        removeTransition: 'Supprimer la transition',
        invertTransition: 'Inverser la transition',
        confirmDeleteTransition: 'Êtes-vous sûr de vouloir supprimer cette transition ?',
        source: 'État source',
        target: 'État destination',
        function: 'Fonction',
        conditions: 'Conditions',
        dependencies: 'Dépendances'
      },
      success: {
        contractCreated: 'Contrat créé avec succès!',
        contractUpdated: 'Contrat mis à jour avec succès!',
        automateCreated: 'Clause créée avec succès!',
        automateUpdated: 'Clause mise à jour avec succès!',
        stateAdded: 'État ajouté avec succès!',
        stateUpdated: 'État modifié avec succès!',
        stateRemoved: 'État supprimé avec succès!',
        transitionAdded: 'Transition ajoutée avec succès!',
        transitionUpdated: 'Transition mise à jour avec succès!',
        transitionRemoved: 'Transition supprimée avec succès!',
        deployed: 'Contrat déployé avec succès!'
      },
      errors: {
        contractNameRequired: 'Veuillez saisir un nom de contrat',
        automateRequired: 'Veuillez créer au moins une clause',
        automateNameRequired: 'Le nom de la clause ne peut pas être vide',
        automateNameExists: 'Une clause avec ce nom existe déjà',
        stateNameRequired: 'Le nom de l\'état ne peut pas être vide',
        stateNameExists: 'Un état avec ce nom existe déjà',
        transitionRequired: 'Tous les champs sont requis',
        transitionExists: 'Cette transition existe déjà',
        transitionNotFound: 'Transition non trouvée',
        cyclicDependency: 'Dépendance cyclique détectée',
        cyclicAutomate: 'Automate cyclique détecté',
        cannotRemoveLastFinal: 'Impossible de supprimer le dernier état final',
        cannotDeployWithErrors: 'Impossible de déployer le contrat. Veuillez corriger les erreurs.',
        savingContract: 'Erreur lors de la sauvegarde du contrat.',
        loadingContract: 'Erreur lors du chargement du contrat.'
      },
      deployment: {
        title: 'Déploiement du contrat',
        preparing: 'Préparation du déploiement...',
        launching: 'Lancement du déploiement...',
        deploying: 'Déploiement des contrats intelligents...',
        complete: 'Déploiement terminé avec succès!',
        orderTitle: 'Ordre de déploiement des clauses:',
        simulationSuccess: 'Simulation de déploiement terminée avec succès!',
        simulationHelp: 'Cette simulation montre l\'ordre dans lequel les clauses seront déployées en fonction de leurs dépendances.',
        deploySuccess: 'Contrat déployé avec succès sur la blockchain!',
        deployHelp: 'Votre contrat intelligent a été correctement déployé sur la blockchain et est maintenant prêt à être utilisé.',
        interact: 'Interagir avec le contrat'
      }
    },
    en: {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        edit: 'Edit',
        delete: 'Delete',
        create: 'Create',
        deploy: 'Deploy',
        back: 'Back',
        add: 'Add',
        loading: 'Loading...',
        yes: 'Yes',
        no: 'No'
      },
      contract: {
        name: 'Contract name',
        status: {
          draft: 'Draft',
          deployed: 'Deployed',
          active: 'Active'
        },
        noAutomate: 'No automaton',
        automateCount: '{count} automaton | {count} automatons',
        createdAt: 'Created at',
        updatedAt: 'Updated at',
        confirmUpdate: 'Update existing contract?',
        confirmUpdateMessage: 'A contract named "{name}" already exists. Do you want to update this existing contract?'
      },
      automate: {
        name: 'Clause name',
        addState: 'Add state',
        editState: 'Edit state',
        removeState: 'Remove state',
        confirmDeleteState: 'Are you sure you want to delete this state?',
        stateType: {
          initial: 'Initial state',
          standard: 'Standard state',
          final: 'Final state'
        }
      },
      transition: {
        name: 'Trigger',
        addTransition: 'Add transition',
        editTransition: 'Edit transition',
        removeTransition: 'Remove transition',
        invertTransition: 'Invert transition',
        confirmDeleteTransition: 'Are you sure you want to delete this transition?',
        source: 'Source state',
        target: 'Target state',
        function: 'Function',
        conditions: 'Conditions',
        dependencies: 'Dependencies'
      },
      success: {
        contractCreated: 'Contract created successfully!',
        contractUpdated: 'Contract updated successfully!',
        automateCreated: 'Clause created successfully!',
        automateUpdated: 'Clause updated successfully!',
        stateAdded: 'State added successfully!',
        stateUpdated: 'State updated successfully!',
        stateRemoved: 'State removed successfully!',
        transitionAdded: 'Transition added successfully!',
        transitionUpdated: 'Transition updated successfully!',
        transitionRemoved: 'Transition removed successfully!',
        deployed: 'Contract deployed successfully!'
      },
      errors: {
        contractNameRequired: 'Please enter a contract name',
        automateRequired: 'Please create at least one clause',
        automateNameRequired: 'Clause name cannot be empty',
        automateNameExists: 'A clause with this name already exists',
        stateNameRequired: 'State name cannot be empty',
        stateNameExists: 'A state with this name already exists',
        transitionRequired: 'All fields are required',
        transitionExists: 'This transition already exists',
        transitionNotFound: 'Transition not found',
        cyclicDependency: 'Cyclic dependency detected',
        cyclicAutomate: 'Cyclic automaton detected',
        cannotRemoveLastFinal: 'Cannot remove the last final state',
        cannotDeployWithErrors: 'Cannot deploy the contract. Please fix the errors.',
        savingContract: 'Error while saving the contract.',
        loadingContract: 'Error while loading the contract.'
      },
      deployment: {
        title: 'Contract deployment',
        preparing: 'Preparing deployment...',
        launching: 'Launching deployment...',
        deploying: 'Deploying smart contracts...',
        complete: 'Deployment completed successfully!',
        orderTitle: 'Deployment order of clauses:',
        simulationSuccess: 'Deployment simulation completed successfully!',
        simulationHelp: 'This simulation shows the order in which the clauses will be deployed based on their dependencies.',
        deploySuccess: 'Contract successfully deployed on the blockchain!',
        deployHelp: 'Your smart contract has been correctly deployed on the blockchain and is now ready to be used.',
        interact: 'Interact with the contract'
      }
    }
  };

  /**
   * Change la langue courante et sauvegarde la préférence
   * @param {string} locale Code de langue (ex: 'fr', 'en')
   */
  const setLocale = (locale) => {
    if (!AVAILABLE_LOCALES.includes(locale)) {
      console.warn(`Langue non supportée: ${locale}. Utilisation de la langue par défaut: ${DEFAULT_LOCALE}`);
      locale = DEFAULT_LOCALE;
    }
    
    currentLocale.value = locale;
    localStorage.setItem('app_locale', locale);
  };

  /**
   * Fonction de traduction
   * @param {string} key Clé de traduction (ex: 'common.save')
   * @param {Object} params Paramètres pour la traduction (ex: {count: 3})
   * @returns {string} Texte traduit
   */
  const t = (key, params = {}) => {
    // Récupération de la traduction par la clé
    const keys = key.split('.');
    let translation = messages[currentLocale.value];
    
    // Traverser l'arbre des traductions
    for (const k of keys) {
      if (!translation || !translation[k]) {
        console.warn(`Traduction manquante: ${key}`);
        return key; // Fallback sur la clé
      }
      translation = translation[k];
    }

    // Si la traduction est une fonction, l'appeler avec les paramètres
    if (typeof translation === 'function') {
      return translation(params);
    }
    
    // Si c'est une chaîne avec pluralisation (séparée par |)
    if (typeof translation === 'string' && translation.includes('|') && params.count !== undefined) {
      const parts = translation.split('|').map(p => p.trim());
      // Pluriel simple: 0-1 | 2+
      return params.count <= 1 ? parts[0] : parts[1];
    }
    
    // Si c'est une chaîne simple, remplacer les paramètres {param}
    if (typeof translation === 'string') {
      return translation.replace(/{([^}]+)}/g, (_, p) => params[p] !== undefined ? params[p] : `{${p}}`);
    }
    
    return key; // Fallback
  };

  /**
   * Liste des langues disponibles avec leurs libellés
   */
  const availableLocales = computed(() => [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' }
  ]);

  return {
    currentLocale,
    setLocale,
    t,
    availableLocales
  };
}