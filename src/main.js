import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/style.css';

// Créer l'application
const app = createApp(App);

// Initialiser Pinia (state management)
const pinia = createPinia();
app.use(pinia);

// Initialiser le routeur
app.use(router);

// Monter l'application
app.mount('#app');