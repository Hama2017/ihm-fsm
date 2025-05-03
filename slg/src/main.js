import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/style.css';
import 'sweetalert2/dist/sweetalert2.min.css';

import { useThemeStore } from './stores/theme';
import { useAuthStore } from './stores/auth';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia); // appliquer Pinia avant d'utiliser le store

// Initialiser le theme
const themeStore = useThemeStore();
themeStore.setDarkMode(themeStore.darkMode);
themeStore.updateCssVariables();

// Initialiser l'authentification
const authStore = useAuthStore();
await authStore.init();

app.use(router);
app.mount('#app');