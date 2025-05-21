<template>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900 transition-colors duration-300">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Formulaire</h2>
      <form class="space-y-4" @submit.prevent="submitForm">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</label>
          <input 
            type="text" 
            v-model="formData.name"
            placeholder="Votre nom" 
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.name }}</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input 
            type="email" 
            v-model="formData.email"
            placeholder="email@example.com" 
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.email }}</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
          <textarea 
            rows="4" 
            v-model="formData.message"
            placeholder="Votre message" 
            class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          ></textarea>
          <p v-if="errors.message" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.message }}</p>
        </div>
        
        <div>
          <button 
            type="submit" 
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200"
            :disabled="isSubmitting"
          >
            <div v-if="isSubmitting" class="flex items-center">
              <LucideLoader class="w-4 h-4 animate-spin mr-2" />
              <span>Envoi en cours...</span>
            </div>
            <span v-else>Envoyer</span>
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue';
  import { LucideLoader } from 'lucide-vue-next';
  
  // State
  const formData = reactive({
    name: '',
    email: '',
    message: ''
  });
  
  const errors = reactive({
    name: '',
    email: '',
    message: ''
  });
  
  const isSubmitting = ref(false);
  
  // Methods
  const validateForm = () => {
    let valid = true;
    
    // Reset errors
    errors.name = '';
    errors.email = '';
    errors.message = '';
    
    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
      valid = false;
    }
    
    // Validate email
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'L\'email est invalide';
      valid = false;
    }
    
    // Validate message
    if (!formData.message.trim()) {
      errors.message = 'Le message est requis';
      valid = false;
    }
    
    return valid;
  };
  
  const submitForm = async () => {
    if (!validateForm()) return;
    
    isSubmitting.value = true;
    
    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Réinitialiser le formulaire
      formData.name = '';
      formData.email = '';
      formData.message = '';
      
      alert('Formulaire soumis avec succès!');
    } catch (error) {
      alert('Une erreur est survenue lors de l\'envoi du formulaire.');
      console.error(error);
    } finally {
      isSubmitting.value = false;
    }
  };
  </script>