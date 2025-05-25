import { ref, computed, watch } from 'vue';
import { useStorage } from '@vueuse/core'; // Vous devrez installer cette dépendance
import frLocale from '@/locales/fr.json';
import enLocale from '@/locales/en.json';

/**
 * Système d'internationalisation (i18n) pour l'application
 * 
 * Ce composable permet de :
 * - Gérer les traductions dans différentes langues
 * - Changer de langue dynamiquement
 * - Persister la langue choisie
 * - Formater les chaînes avec variables
 * - Gérer le pluriel
 * 
 * @returns {Object} Fonctionnalités d'internationalisation
 */
export function useI18n() {
  // Langues disponibles
  const AVAILABLE_LOCALES = ['fr', 'en'];
  
  // Langue par défaut
  const DEFAULT_LOCALE = 'fr';
  
  // Dictionnaires de traductions
  const messages = {
    fr: frLocale,
    en: enLocale
  };
  
  // Langue actuelle (persister dans localStorage)
  const currentLocale = useStorage(
    'app_locale',
    // Logique pour déterminer la langue initiale
    (() => {
      const storedLocale = localStorage.getItem('app_locale');
      if (storedLocale && AVAILABLE_LOCALES.includes(storedLocale)) {
        return storedLocale;
      }
      
      // Détecter la langue du navigateur
      const browserLocale = navigator.language?.split('-')[0];
      if (browserLocale && AVAILABLE_LOCALES.includes(browserLocale)) {
        return browserLocale;
      }
      
      return DEFAULT_LOCALE;
    })()
  );
  
  /**
   * Change la langue courante et sauvegarde la préférence
   * @param {string} locale Code de langue (ex: 'fr', 'en')
   * @returns {boolean} True si la langue a été changée, false sinon
   */
  const setLocale = (locale) => {
    if (!AVAILABLE_LOCALES.includes(locale)) {
      console.warn(`Langue non supportée: ${locale}. Utilisation de la langue par défaut: ${DEFAULT_LOCALE}`);
      return false;
    }
    
    currentLocale.value = locale;
    document.documentElement.setAttribute('lang', locale);
    return true;
  };
  
  // S'assurer que l'attribut lang est toujours synchronisé
  watch(currentLocale, (newLocale) => {
    document.documentElement.setAttribute('lang', newLocale);
  }, { immediate: true });

  /**
   * Fonction de traduction
   * @param {string} key Clé de traduction (ex: 'common.save')
   * @param {Object} params Paramètres pour la traduction (ex: {count: 3})
   * @returns {string} Texte traduit
   */
  const t = (key, params = {}) => {
    // Si la clé est vide ou non définie, retourner une chaîne vide
    if (!key) return '';
    
    // Récupération de la traduction par la clé
    const keys = key.split('.');
    let translation = messages[currentLocale.value];
    
    // Traverser l'arbre des traductions
    for (const k of keys) {
      if (!translation || !translation[k]) {
        // Si la traduction n'est pas trouvée dans la langue courante, essayer en anglais
        if (currentLocale.value !== 'en') {
          let fallbackTranslation = messages['en'];
          let fallbackFound = true;
          
          for (const fallbackKey of keys) {
            if (!fallbackTranslation || !fallbackTranslation[fallbackKey]) {
              fallbackFound = false;
              break;
            }
            fallbackTranslation = fallbackTranslation[fallbackKey];
          }
          
          if (fallbackFound) {
            // Utiliser la traduction anglaise comme fallback
            console.warn(`Traduction manquante pour '${key}' en '${currentLocale.value}', utilisation de la version anglaise`);
            return formatTranslation(fallbackTranslation, params);
          }
        }
        
        // Aucune traduction trouvée, utiliser la clé comme fallback
        console.warn(`Traduction manquante: ${key}`);
        return key;
      }
      translation = translation[k];
    }
    
    return formatTranslation(translation, params);
  };
  
  /**
   * Formate une traduction en fonction des paramètres
   * @param {string} translation La traduction brute
   * @param {Object} params Les paramètres à injecter
   * @returns {string} La traduction formatée
   */
  const formatTranslation = (translation, params) => {
    // Si la traduction est une fonction, l'appeler avec les paramètres
    if (typeof translation === 'function') {
      return translation(params);
    }
    
    // Si c'est une chaîne avec pluralisation (séparée par |)
    if (typeof translation === 'string' && translation.includes('|') && params.count !== undefined) {
      const parts = translation.split('|').map(p => p.trim());
      // Pluriel simple: 0-1 | 2+
      const index = params.count <= 1 ? 0 : 1;
      if (parts[index]) {
        translation = parts[index];
      }
    }
    
    // Si c'est une chaîne simple, remplacer les paramètres {param}
    if (typeof translation === 'string') {
      return translation.replace(/{([^}]+)}/g, (_, p) => {
        return params[p] !== undefined ? params[p] : `{${p}}`;
      });
    }
    
    return translation || key;
  };
  
  /**
   * Vérifie si une clé de traduction existe
   * @param {string} key Clé de traduction à vérifier
   * @returns {boolean} True si la clé existe, false sinon
   */
  const exists = (key) => {
    if (!key) return false;
    
    const keys = key.split('.');
    let obj = messages[currentLocale.value];
    
    for (const k of keys) {
      if (!obj || typeof obj !== 'object' || !(k in obj)) {
        return false;
      }
      obj = obj[k];
    }
    
    return true;
  };
  
  /**
   * Formate une date selon la locale courante
   * @param {Date|string|number} date La date à formater
   * @param {Object} options Options de formatage
   * @returns {string} Date formatée
   */
  const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Options par défaut pour le format de date
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    try {
      return new Intl.DateTimeFormat(currentLocale.value, defaultOptions).format(dateObj);
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return String(date);
    }
  };
  
  /**
   * Formate un nombre selon la locale courante
   * @param {number} number Le nombre à formater
   * @param {Object} options Options de formatage
   * @returns {string} Nombre formaté
   */
  const formatNumber = (number, options = {}) => {
    if (number === undefined || number === null) return '';
    
    try {
      return new Intl.NumberFormat(currentLocale.value, options).format(number);
    } catch (error) {
      console.error('Erreur lors du formatage du nombre:', error);
      return String(number);
    }
  };
  
  /**
   * Formate un prix selon la locale courante
   * @param {number} amount Le montant à formater
   * @param {string} currency Code de devise (ex: EUR, USD)
   * @returns {string} Prix formaté
   */
  const formatCurrency = (amount, currency = 'EUR') => {
    return formatNumber(amount, {
      style: 'currency',
      currency
    });
  };
  
  /**
   * Liste des langues disponibles avec leurs libellés
   */
  const availableLocales = computed(() => [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' }
  ]);
  
  /**
   * Obtient le libellé d'une langue à partir de son code
   * @param {string} code Code de langue
   * @returns {string} Libellé de la langue
   */
  const getLocaleLabel = (code) => {
    const locale = availableLocales.value.find(l => l.code === code);
    return locale ? locale.label : code;
  };

  return {
    currentLocale,
    setLocale,
    t,
    exists,
    formatDate,
    formatNumber,
    formatCurrency,
    availableLocales,
    getLocaleLabel
  };
}

// Exporter la fonction pour l'utiliser dans les composants
export default useI18n;