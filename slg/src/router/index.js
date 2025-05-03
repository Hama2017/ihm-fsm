import { createRouter, createWebHistory } from 'vue-router';
import { authMiddleware } from './auth-middleware';
import MainLayout from '../layouts/MainLayout.vue';
import AuthLayout from '../layouts/AuthLayout.vue';
import DashboardView from '../views/DashboardView.vue';
import SettingsView from '../views/SettingsView.vue';
import LoadingView from '../views/LoadingView.vue';
import SplashScreen from '../views/SplashScreen.vue';
import ContractsListView from '../views/contracts/ContractsListView.vue';
import CreateContractView from '../views/contracts/CreateContractView.vue';
import ContractExecutionView from '../views/contracts/ContractExecutionView.vue';
import PackageListView from '../views/packages/PackageListView.vue';
import PackageEditorView from '../views/packages/PackageEditorView.vue';
import PackageDetailsView from '../views/packages/PackageDetailsView.vue';

// Nouvelles vues d'authentification
import LoginView from '../views/auth/LoginView.vue';
import RegisterView from '../views/auth/RegisterView.vue';
import ForgotPasswordView from '../views/auth/ForgotPasswordView.vue';
import ResetPasswordView from '../views/auth/ResetPasswordView.vue';

// Vue profil
import ProfileView from '../views/profile/ProfileView.vue';

// Vue d'erreur
import UnauthorizedView from '../views/errors/UnauthorizedView.vue';
import NotFoundView from '../views/errors/NotFoundView.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    meta: {
      requiresAuth: true // Toutes les routes sous cette layout nécessitent une authentification
    },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
        meta: {
          title: 'Tableau de bord',
          icon: 'dashboard'
        }
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: {
          title: 'Profil',
          icon: 'user'
        }
      },
      {
        path: 'contracts',
        name: 'contracts',
        component: ContractsListView,
        meta: {
          title: 'Liste des contrats',
          icon: 'contractList',
          group: 'Contrats'
        }
      },
      {
        path: 'contracts/create',
        name: 'create-contract',
        component: CreateContractView,
        meta: {
          title: 'Créer un contrat',
          icon: 'contractCreate',
          group: 'Contrats'
        }
      },
      {
        path: 'contracts/edit/:id',
        name: 'edit-contract',
        component: CreateContractView,
        meta: {
          title: 'Modifier un contrat',
          icon: 'contract',
          group: 'Contrats'
        }
      },
      {
        path: 'contracts/:id',
        name: 'contract-details',
        component: ContractsListView,
        meta: {
          title: 'Détails du contrat',
          icon: 'contract',
          group: 'Contrats'
        }
      },
      {
        path: 'contracts/:name/execute',
        name: 'contract-execution',
        component: ContractExecutionView,
        meta: {
          title: 'Exécution du contrat',
          icon: 'contract',
          group: 'Contrats'
        }
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsView,
        meta: {
          title: 'Paramètres',
          icon: 'settings',
          requiredRole: 'admin' // Seuls les administrateurs peuvent accéder aux paramètres
        }
      },
      {
        path: 'packages',
        name: 'packages',
        component: PackageListView,
        meta: {
          title: 'Gestion des packages',
          icon: 'package',
          group: 'Administration',
          requiredRole: 'admin' // Seuls les administrateurs peuvent accéder aux packages
        }
      },
      {
        path: 'packages/new',
        name: 'package-new',
        component: PackageEditorView,
        meta: {
          title: 'Nouveau package',
          icon: 'packageAdd',
          group: 'Administration',
          requiredRole: 'admin'
        }
      },
      {
        path: 'packages/:id/edit',
        name: 'package-edit',
        component: PackageEditorView,
        meta: {
          title: 'Modifier le package',
          icon: 'package',
          group: 'Administration',
          requiredRole: 'admin'
        }
      },
      {
        path: 'packages/:id/details',
        name: 'package-details',
        component: PackageDetailsView,
        meta: {
          title: 'Détails du package',
          icon: 'package',
          group: 'Administration',
          requiredRole: 'admin'
        }
      },
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    meta: {
      guestOnly: true // Ces routes sont accessibles uniquement aux utilisateurs non authentifiés
    },
    children: [
      {
        path: 'login',
        name: 'login',
        component: LoginView,
        meta: {
          title: 'Connexion'
        }
      },
      {
        path: 'register',
        name: 'register',
        component: RegisterView,
        meta: {
          title: 'Inscription'
        }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: ForgotPasswordView,
        meta: {
          title: 'Mot de passe oublié'
        }
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: ResetPasswordView,
        meta: {
          title: 'Réinitialisation du mot de passe'
        }
      }
    ]
  },
  {
    path: '/splash',
    name: 'splash',
    component: SplashScreen,
    meta: {
      title: 'Bienvenue'
    }
  },
  {
    path: '/loading',
    name: 'loading',
    component: LoadingView,
    meta: {
      title: 'Chargement'
    }
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: UnauthorizedView,
    meta: {
      title: 'Accès non autorisé'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      title: 'Page non trouvée'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Appliquer le middleware d'authentification à toutes les routes
router.beforeEach(authMiddleware);

// Navigation guards pour le titre et le splash screen
router.beforeEach((to, from, next) => {
  document.title = `Smart Legal Contract - ${to.meta.title || 'Application'}`;
  
  // Si on va directement au splash, autoriser
  if (to.name === 'splash') {
    next();
    return;
  }
  
  // Vérifier si c'est la première visite
  const splashScreenSeen = localStorage.getItem('splash_screen_seen');
  
  // Afficher le splash screen uniquement si:
  // - splashScreenSeen n'existe pas (première visite ou après login/register)
  // - L'utilisateur va à la page d'accueil (/)
  // - L'utilisateur n'est pas en train de se connecter/s'inscrire
  if (!splashScreenSeen && to.path === '/' && !to.path.startsWith('/auth')) {
    next({ name: 'splash' });
  } else {
    next();
  }
});

export default router;