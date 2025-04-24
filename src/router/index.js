import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import DashboardView from '../views/DashboardView.vue';
import SettingsView from '../views/SettingsView.vue';
import LoadingView from '../views/LoadingView.vue';
import SplashScreen from '../views/SplashScreen.vue';
import ContractsListView from '../views/contracts/ContractsListView.vue';
import CreateContractView from '../views/contracts/CreateContractView.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
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
        component: CreateContractView, // On réutilise le même composant
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
        path: 'settings',
        name: 'settings',
        component: SettingsView,
        meta: {
          title: 'Paramètres',
          icon: 'settings'
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards pour mettre à jour le titre de la page et gérer le splash screen
router.beforeEach((to, from, next) => {
  document.title = `Smart Legal Contract - ${to.meta.title || 'Application'}`;
  
  // Vérifier si c'est la première visite
  const splashScreenSeen = localStorage.getItem('splash_screen_seen');
  
  // Afficher le splash screen uniquement si:
  // - C'est la première visite (splashScreenSeen n'existe pas)
  // - L'utilisateur va à la page d'accueil (/)
  // - L'utilisateur n'est pas déjà en train d'aller au splash screen
  if (!splashScreenSeen && to.path === '/' && to.name !== 'splash') {
    next({ name: 'splash' });
  } else {
    next();
  }
});

export default router;