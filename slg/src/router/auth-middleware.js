import { useAuthStore } from '@/stores/auth';

/**
 * Middleware de vérification d'authentification
 * @param {Object} to - Route de destination
 * @param {Object} from - Route d'origine
 * @param {Function} next - Fonction à appeler pour continuer la navigation
 */
export async function authMiddleware(to, from, next) {
  // Obtenir le store d'authentification
  const authStore = useAuthStore();
  
  // Vérifier si la route nécessite une authentification
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = authStore.isAuthenticated;

  // Si la route nécessite une authentification et que l'utilisateur n'est pas authentifié
  if (requiresAuth && !isAuthenticated) {
    // Stocker l'URL cible pour rediriger après la connexion
    sessionStorage.setItem('redirectAfterLogin', to.fullPath);
    
    // Rediriger vers la page de connexion
    next({ name: 'login' });
    return;
  }

  // Si la route nécessite un rôle spécifique
  if (to.meta.requiredRole && isAuthenticated) {
    // Vérifier si l'utilisateur a le rôle requis
    if (!authStore.hasAccess(to.meta.requiredRole)) {
      // Rediriger vers une page non autorisée ou la page d'accueil
      next({ name: 'unauthorized' });
      return;
    }
  }

  // Si l'utilisateur est authentifié et essaie d'accéder à une page de connexion/inscription
  if (isAuthenticated && to.meta.guestOnly) {
    // Rediriger vers la page d'accueil
    next({ name: 'dashboard' });
    return;
  }

  // Autoriser la navigation
  next();
}