import { useAuthStore } from '@/stores/AuthStore';

export function adminGuard(to, from, next) {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return next({ name: 'login' });
  }

  if (!authStore.isAdmin) {
    return next({ name: 'unauthorized' });
  }

  next();
}