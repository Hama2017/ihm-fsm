<template>
  <Modal
    :modelValue="modelValue"
    :title="t('packages.confirmDelete')"
    :confirm-text="t('common.delete')"
    variant="danger"
    @update:modelValue="$emit('update:modelValue', $event)"
    @confirm="$emit('confirm')"
  >
    <p class="text-gray-700 dark:text-gray-300">
      {{ t('packages.confirmDeleteMessage', { name: packageData?.label || packageData?.id }) }}
    </p>
    <p class="mt-2 text-gray-600 dark:text-gray-400 text-sm">
      {{ t('packages.confirmDeleteWarning') }}
    </p>
  </Modal>
</template>

<script setup>
import Modal from '@/components/ui/UiModal.vue';
import { computed } from 'vue';
import { useI18n } from '@/composables/i18n/useI18n';

// Composables
const { t } = useI18n();

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  package: {
    type: Object,
    default: null
  }
});

// Emits
defineEmits(['update:modelValue', 'confirm']);

// Computed
const packageData = computed(() => props.package);
</script>