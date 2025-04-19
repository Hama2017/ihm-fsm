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
        <button 
          class="p-2 rounded transition-colors duration-200"
          :class="darkMode 
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'"
          @click="showNotifications = !showNotifications"
        >
          <LucideBell class="w-5 h-5" />
          <span class="absolute top-0 right-0 h-4 w-4 rounded-full text-xs flex items-center justify-center bg-red-500 text-white">
            3
          </span>
        </button>

        <!-- Notifications Dropdown -->
        <div 
          v-if="showNotifications"
          class="absolute right-0 mt-2 w-80 rounded-md shadow-lg z-50 border transition-colors duration-300 notifications-dropdown"
          :class="darkMode 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200'"
        >
          <div class="py-2 px-4 border-b" :class="darkMode ? 'border-gray-700' : 'border-gray-200'">
            <h3 class="font-medium">Notifications</h3>
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
          <div class="py-2 px-4 text-center">
            <a 
              href="#" 
              class="text-sm font-medium transition-colors duration-200"
              :class="darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'"
            >
              Voir toutes les notifications
            </a>
          </div>
        </div>
      </div>

      <!-- Profile Menu -->
      <div class="relative">
        <button 
          class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200"
          :class="darkMode 
            ? 'bg-gray-800 hover:bg-gray-700' 
            : 'bg-gray-100 hover:bg-gray-200'"
          @click="showProfileMenu = !showProfileMenu"
          ref="profileButton"
        >
          <img 
            src="https://i.pravatar.cc/100?img=1" 
            class="w-8 h-8 rounded-full border transition-colors duration-300"
            :class="darkMode ? 'border-blue-700' : 'border-blue-500'" 
            alt="User avatar"
          />
          <div class="leading-tight text-left">
            <p class="text-sm font-medium m-0" :class="darkMode ? 'text-gray-200' : 'text-gray-900'">
              Hamadou BA
            </p>
            <p class="text-xs m-0" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
              Admin
            </p>
          </div>
        </button>

        <!-- Profile Dropdown -->
        <div 
          v-if="showProfileMenu" 
          class="absolute right-0 mt-2 w-48 rounded-md shadow-lg border z-50 transition-colors duration-300"
          :class="darkMode 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200'"
        >
          <ul class="py-2 text-sm">
            <li>
              <a 
                href="#" 
                class="block px-4 py-2 transition-colors duration-200"
                :class="darkMode 
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
              >
                <div class="flex items-center">
                  <LucideUser class="w-4 h-4 mr-2" />
                  Profil
                </div>
              </a>
            </li>
            <li>
              <a 
                href="#" 
                class="block px-4 py-2 transition-colors duration-200"
                :class="darkMode 
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
              >
                <div class="flex items-center">
                  <LucideSettings class="w-4 h-4 mr-2" />
                  Paramètres
                </div>
              </a>
            </li>
            <li>
              <hr :class="darkMode ? 'border-gray-700' : 'border-gray-200'" />
            </li>
            <li>
              <a 
                href="#" 
                class="block px-4 py-2 transition-colors duration-200"
                :class="darkMode 
                  ? 'text-red-400 hover:bg-gray-800 hover:text-red-300' 
                  : 'text-red-600 hover:bg-gray-100 hover:text-red-700'"
              >
                <div class="flex items-center">
                  <LucideLogOut class="w-4 h-4 mr-2" />
                  Déconnexion
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  LucideSun,
  LucideMoon,
  LucideBell,
  LucideUser,
  LucideSettings,
  LucideLogOut
} from 'lucide-vue-next'

import { useThemeStore } from '../../stores/theme'
const theme = useThemeStore()

const darkMode = computed(() => theme.darkMode)
const toggleTheme = () => theme.setDarkMode(!darkMode.value)

const route = useRoute()
const pageTitle = computed(() => route.meta.title || 'Dashboard')

const showProfileMenu = ref(false)
const showNotifications = ref(false)
const profileButton = ref(null)

const notifications = [
  { title: 'Nouvel automate déployé', time: 'Il y a 10 minutes', read: false },
  { title: 'Mise à jour du système disponible', time: 'Il y a 3 heures', read: false },
  { title: 'Automate #32 en erreur', time: 'Il y a 5 heures', read: false },
  { title: 'Rapport hebdomadaire disponible', time: 'Hier', read: true }
]

const handleClickOutside = (event) => {
  if (profileButton.value && !profileButton.value.contains(event.target)) {
    showProfileMenu.value = false
  }
  if (!event.target.closest('.notifications-dropdown')) {
    showNotifications.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

watch(() => route.path, () => {
  showProfileMenu.value = false
  showNotifications.value = false
})
</script>
