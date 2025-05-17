import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/style.css';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Préparer les stores AVANT de monter l'app
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/AuthStore';

const themeStore = useThemeStore();
themeStore.setDarkMode(themeStore.darkMode);
themeStore.updateCssVariables();

const authStore = useAuthStore();

// Attendre que fetchUser se termine avant de monter l'app
authStore.fetchUser().finally(() => {
  app.use(router);

  // Si l'utilisateur est déjà connecté : rediriger vers SplashScreen
  if (authStore.user) {
    router.replace({ name: 'splash' }); // splash redirigera vers dashboard
  }

  // Sinon on monte normalement, il tombera sur la route protégée (ou login normalemen)
  app.mount('#app');
  
});
