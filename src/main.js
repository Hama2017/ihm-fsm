import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Pour simuler le router en attendant son implémentation
const app = createApp(App)

// Composant router-link de remplacement
app.component('router-link', {
  props: {
    to: {
      type: String,
      required: true
    }
  },
  template: `<a href="#" @click.prevent class="router-link"><slot></slot></a>`
})

app.mount('#app')