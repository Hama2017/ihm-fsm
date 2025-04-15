import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/style.css';

import { useThemeStore } from './stores/theme'; // 👈 importer AVANT le mount

const app = createApp(App);
const pinia = createPinia();

app.use(pinia); // appliquer Pinia avant d’utiliser le store
app.use(router);

// ⬇️ IMPORTANT : appeler le store après avoir activé Pinia, mais AVANT le mount
const themeStore = useThemeStore();
themeStore.setDarkMode(themeStore.darkMode);      // applique la classe .dark à <html>
themeStore.updateCssVariables();                  // met à jour les couleurs CSS

app.mount('#app'); // 👈 doit être appelé en dernier
