import { useRouter } from 'vue-router';

/**
 * Composable pour gérer la navigation vers la page de chargement
 * et définir une redirection après un délai donné
 */
export function useLoading() {
  const router = useRouter();

  /**
   * Affiche l'écran de chargement et redirige après le délai complet
   * @param {Object} options - Options de configuration
   * @param {string} [options.returnTo='dashboard'] - Route de redirection après le chargement
   * @param {number} [options.forceDelay=0] - Temps minimal en ms à attendre (0 = animation complète)
   * @param {string} [options.title='Smart Legal Contract'] - Titre principal affiché
   * @param {string[]} [options.messages=['Blockchain connectée...', 'Déploiement du contrat...', 'Prêt à être utilisé !']] - Messages affichés séquentiellement
   */
  const showLoading = (options = {}) => {
    const { 
      returnTo = 'dashboard', 
      forceDelay = 0,
      title = 'Smart Legal Contract',
      messages = ['Blockchain connectée...', 'Déploiement du contrat...', 'Prêt à être utilisé !']
    } = options;
    
    // Stocker les paramètres pour récupération dans LoadingView
    if (returnTo !== 'dashboard') {
      sessionStorage.setItem('loading_return_to', returnTo);
    }
    
    // Stocker le délai forcé si nécessaire
    if (forceDelay > 0) {
      sessionStorage.setItem('loading_force_delay', forceDelay.toString());
    }
    
    // Stocker le titre et les messages personnalisés
    sessionStorage.setItem('loading_title', JSON.stringify(title));
    sessionStorage.setItem('loading_messages', JSON.stringify(messages));
    
    // Naviguer vers l'écran de chargement
    router.push({ name: 'loading' });
  };

  return {
    showLoading
  };
}

export default useLoading;