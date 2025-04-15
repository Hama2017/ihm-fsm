import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import DashboardView from '../views/DashboardView.vue';
import AutomatesView from '../views/AutomatesView.vue';
import SettingsView from '../views/SettingsView.vue';

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
        path: 'automates',
        name: 'automates',
        component: AutomatesView,
        meta: { 
          title: 'Gestion des automates',
          icon: 'automation'
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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards pour mettre à jour le titre de la page
router.beforeEach((to, from, next) => {
  document.title = `FSM Web3 - ${to.meta.title || 'Application'}`;
  next();
});

export default router;