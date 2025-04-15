<template>
   <router-view />

</template>

<script setup>
import { ref } from 'vue';
import TheSidebar from './components/layout/TheSidebar.vue';
import TheHeader from './components/layout/TheHeader.vue';
import TheFooter from './components/layout/TheFooter.vue';
import AutomateList from './components/fsm/AutomateList.vue';
import FunctionList from './components/fsm/FunctionList.vue';
import StateList from './components/fsm/StateList.vue';
import AutomateEditor from './components/fsm/AutomateEditor.vue';
import UiTabs from './components/ui/UiTabs.vue';
import UiForm from './components/ui/UiForm.vue';
import UiButton from './components/ui/UiButton.vue';
import UiModal from './components/ui/UiModal.vue';

// State
const isSidebarCollapsed = ref(false);
const isModalOpen = ref(false);
</script>