import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/style.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia); // Pinia doit être appliqué AVANT d'appeler le store
app.use(router);
app.mount('#app');

// ✅ Maintenant que pinia est actif, on peut appeler le store
import { useThemeStore } from './stores/theme';
const themeStore = useThemeStore();
themeStore.setDarkMode(themeStore.darkMode);      // applique ou retire .dark de <html>
themeStore.updateCssVariables();                  // applique les couleurs personnalisées
