import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from './middleware/authGuard';
import { adminGuard } from './middleware/adminGuard';

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

import DeploymentView from '../views/contracts/DeploymentView.vue';
import LoginView from '../views/auth/LoginView.vue';
import RegisterView from '../views/auth/RegisterView.vue';
import ForgotPasswordView from '../views/auth/ForgotPasswordView.vue';
import ResetPasswordView from '../views/auth/ResetPasswordView.vue';

import ProfileView from '../views/profile/ProfileView.vue';

import UnauthorizedView from '../views/errors/UnauthorizedView.vue';
import NotFoundView from '../views/errors/NotFoundView.vue';

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
          requiresAuth: true, 
          title: 'Dashboard', 
          icon: 'dashboard'
          // No group - will appear in standard menu items
        }
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: {
          requiresAuth: true, 
          title: 'Profile', 
          icon: 'profile'
          // No group - will appear in standard menu items
        }
      },
      
      // Contracts group
      {
        path: 'contracts',
        name: 'contracts',
        component: ContractsListView,
        meta: {
          requiresAuth: true, 
          title: 'Contracts', 
          icon: 'contracts',
          group: 'Contrats' // Match the group name in the sidebar
        }
      },
      {
        path: 'contracts/create',
        name: 'create-contract',
        component: CreateContractView,
        meta: {
          requiresAuth: true, 
          title: 'Create Contract', 
          icon: 'create-contract',
          group: 'Contrats' // Match the group name in the sidebar
        }
      },
      {
        path: 'contracts/edit/:id',
        name: 'edit-contract',
        component: CreateContractView,
        meta: {
          requiresAuth: true, 
          title: 'Edit Contract', 
          icon: 'edit-contract',
          group: 'Contrats', 
          hidden: true // Hide from sidebar since it's a dynamic route
        }
      },
      {
        path: 'contracts/:id',
        name: 'contract-details',
        component: ContractsListView,
        meta: {
          requiresAuth: true, 
          title: 'Contract Details', 
          icon: 'contract-details',
          group: 'Contrats',
          hidden: true // Hide from sidebar since it's a dynamic route
        }
      },
      {
        path: 'contracts/:name/execute',
        name: 'contract-execution',
        component: ContractExecutionView,
        meta: {
          requiresAuth: true, 
          title: 'Execute Contract', 
          icon: 'contract-execution',
          group: 'Contrats'
        }
      },
      {
        path: '/contracts/deploy/:id/:name?',
        name: 'deployment',
        component: DeploymentView,
        meta: {
          requiresAuth: true,
          title: 'Déploiement de contrat'
        }
      },
      
      // Administration group
      {
        path: 'settings',
        name: 'settings',
        component: SettingsView,
        meta: {
          requiresAuth: true, 
          title: 'Settings', 
          icon: 'settings',
          group: 'Administration',
          requiredRole: 'admin' // Use this for the access check in the sidebar
        },
        beforeEnter: adminGuard
      },
      {
        path: 'packages',
        name: 'packages',
        component: PackageListView,
        meta: {
          requiresAuth: true, 
          title: 'Packages', 
          icon: 'packages',
          group: 'Administration',
          requiredRole: 'admin'
        },
        beforeEnter: adminGuard
      },
      {
        path: 'packages/new',
        name: 'package-new',
        component: PackageEditorView,
        meta: {
          requiresAuth: true, 
          title: 'New Package', 
          icon: 'package-new',
          group: 'Administration',
          requiredRole: 'admin'
        },
        beforeEnter: adminGuard
      },
      {
        path: 'packages/:id/edit',
        name: 'package-edit',
        component: PackageEditorView,
        meta: {
          requiresAuth: true, 
          title: 'Edit Package', 
          icon: 'package-edit',
          group: 'Administration',
          requiredRole: 'admin',
          hidden: true // Hide from sidebar since it's a dynamic route
        },
        beforeEnter: adminGuard
      },
      {
        path: 'packages/:id/details',
        name: 'package-details',
        component: PackageDetailsView,
        meta: {
          requiresAuth: true, 
          title: 'Package Details', 
          icon: 'package-details',
          group: 'Administration',
          requiredRole: 'admin'
        },
        beforeEnter: adminGuard
      }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: LoginView,
        meta: { requiresGuest: true, title: 'Login' } 
      },
      {
        path: 'register',
        name: 'register',
        component: RegisterView,
        meta: { requiresGuest: true, title: 'Register' } 
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: ForgotPasswordView,
        meta: { requiresGuest: true, title: 'Forgot Password' } 
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: ResetPasswordView,
        meta: { requiresGuest: true, title: 'Reset Password' } 
      }
    ]
  },
  {
    path: '/splash',
    name: 'splash',
    component: SplashScreen,
    meta: { title: 'Welcome' }
  },
  {
    path: '/loading',
    name: 'loading',
    component: LoadingView,
    meta: { title: 'Loading' }
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: UnauthorizedView,
    meta: { title: 'Unauthorized' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: 'Page Not Found' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(authGuard);

export default router;