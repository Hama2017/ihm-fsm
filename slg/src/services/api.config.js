import axios from 'axios';

// Création d'une instance Axios avec une configuration de base
const apiClient = axios.create({
  baseURL:'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // timeout de 10 secondes
});

// Intercepteurs pour gérer les erreurs globalement
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Gestion des erreurs globales (ex: logging, notification...)
    console.error('API Error:', error);
    
    // Si l'erreur a une réponse du serveur
    if (error.response) {
      // Erreurs 4xx, 5xx
      console.error('Server responded with error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Pas de réponse reçue du serveur
      console.error('No response received from server');
    } else {
      // Erreur de configuration de la requête
      console.error('Request configuration error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;