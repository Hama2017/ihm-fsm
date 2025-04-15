<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <li>
    <router-link 
      :to="item.route" 
      class="block px-3 py-2 rounded-lg text-secondary-400 hover:bg-secondary-700/50 hover:text-white transition-colors"
    >
      {{ item.title }}
    </router-link>
  </li>
</template>