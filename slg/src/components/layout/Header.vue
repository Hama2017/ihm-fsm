// src/components/layout/Header.vue (correction du problème de notification)
<template>
  <header 
    class="py-4 px-6 flex justify-between items-center border-b transition-colors duration-300"
    :class="darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'"
  >
    <h1 class="text-lg font-semibold">{{ pageTitle }}</h1>
    <div class="flex items-center gap-4">
      <!-- Toggle Dark Mode Button -->
      <button 
        class="p-2 rounded transition-colors duration-200"
        :class="darkMode 
          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'"
        @click="toggleTheme"
      >
        <LucideMoon v-if="!darkMode" class="w-5 h-5" />
        <LucideSun v-else class="w-5 h-5" />
      </button>

      <!-- Notifications Button -->
      <div class="relative">
        <!-- Changement : ajout de l'attribut id et stopPropagation -->
        <button 
          id="notifications-toggle"
          class="p-2 rounded transition-colors duration-200"
          :class="darkMode 
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'"
          @click.stop="toggleNotifications"
        >
          <LucideBell class="w-5 h-5" />
          <span v-if="unreadNotifications > 0" class="absolute top-0 right-0 h-4 w-4 rounded-full text-xs flex items-center justify-center bg-red-500 text-white">
            {{ unreadNotifications }}
          </span>
        </button>

        <!-- Notifications Dropdown -->
        <div 
          v-if="showNotifications"
          id="notifications-dropdown"
          class="absolute right-0 mt-2 w-80 rounded-md shadow-lg z-50 border transition-colors duration-300"
          :class="darkMode 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200'"
          @click.stop
        >
          <div class="py-2 px-4 border-b flex justify-between items-center" 
               :class="darkMode ? 'border-gray-700' : 'border-gray-200'">
            <h3 class="font-medium">Notifications</h3>
            <button 
              class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              @click="markAllAsRead"
            >
              Tout marquer comme lu
            </button>
          </div>
          <ul class="max-h-64 overflow-y-auto">
            <li 
              v-for="(notification, index) in notifications" 
              :key="index"
              class="p-3 border-b last:border-b-0 transition-colors duration-300"
              :class="[
                darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50',
                notification.read 
                  ? (darkMode ? 'text-gray-400' : 'text-gray-500') 
                  : (darkMode ? 'text-gray-200' : 'text-gray-800')
              ]"
            >
              <div class="flex items-start">
                <span 
                  class="w-2 h-2 rounded-full mt-1"
                  :class="notification.read ? 'bg-gray-400' : 'bg-blue-500'"
                ></span>
                <div class="ml-3 flex-1">
                  <p class="text-sm font-medium">{{ notification.title }}</p>
                  <p class="text-xs mt-1">{{ notification.time }}</p>
                </div>
              </div>
            </li>
          </ul>
          <div v-if="notifications.length === 0" class="py-6 text-center text-gray-500 dark:text-gray-400">
            <p>Aucune notification</p>
          </div>
        </div>
      </div>

      <!-- Logout Button -->
      <button
        @click="logout"
        class="p-2 rounded transition-colors duration-200 text-red-600 dark:text-red-400"
        :class="darkMode 
          ? 'bg-gray-800 hover:bg-red-900/20' 
          : 'bg-gray-100 hover:bg-red-100'"
        title="Déconnexion"
      >
        <LucideLogOut class="w-5 h-5" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useThemeStore } from '@/stores/theme';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import toast from '@/composables/Toast/useToast';
import {
  LucideSun,
  LucideMoon,
  LucideBell,
  LucideLogOut
} from 'lucide-vue-next';

// Router
const router = useRouter();

// Theme store
const themeStore = useThemeStore();
const { darkMode } = storeToRefs(themeStore);
const toggleTheme = () => themeStore.setDarkMode(!darkMode.value);

// Auth store
const authStore = useAuthStore();

const route = useRoute();
const pageTitle = computed(() => route.meta.title || 'Dashboard');

const showNotifications = ref(false);

// Notifications (exemple - à remplacer par des données réelles)
const notifications = ref([
  { title: 'Nouvel automate déployé', time: 'Il y a 10 minutes', read: false },
  { title: 'Mise à jour du système disponible', time: 'Il y a 3 heures', read: false },
  { title: 'Automate #32 en erreur', time: 'Il y a 5 heures', read: false },
  { title: 'Rapport hebdomadaire disponible', time: 'Hier', read: true }
]);

// Nombre de notifications non lues
const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

// Marquer toutes les notifications comme lues
const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true;
  });
  toast.success('Toutes les notifications ont été marquées comme lues');
};

// Méthode spécifique pour basculer l'affichage des notifications
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

// Gestionnaire de clic à l'extérieur amélioré
const handleClickOutside = (event) => {
  // Vérifier si le clic est en dehors du bouton de notification et du menu déroulant
  const notificationToggle = document.getElementById('notifications-toggle');
  const notificationDropdown = document.getElementById('notifications-dropdown');
  
  // Si le menu est affiché et que le clic n'est ni sur le bouton ni sur le menu
  if (showNotifications.value && 
      event.target !== notificationToggle && 
      !notificationToggle?.contains(event.target) &&
      event.target !== notificationDropdown && 
      !notificationDropdown?.contains(event.target)) {
    showNotifications.value = false;
  }
};

// Déconnexion
const logout = async () => {
  try {
    await authStore.logout();
    router.push({ name: 'login' });
    toast.success('Vous avez été déconnecté avec succès');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    toast.error('Erreur lors de la déconnexion');
  }
};

onMounted(() => {
  // Ajouter l'événement de clic sur document
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  // Nettoyer l'événement
  document.removeEventListener('click', handleClickOutside);
});

watch(() => route.path, () => {
  showNotifications.value = false;
});
</script>