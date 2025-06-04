# Composants UI

Cette section documente tous les composants d'interface utilisateur de Smart Legal Contract. Ces composants forment le design system de l'application et garantissent une cohérence visuelle.

## 🎨 Design System

Tous les composants UI suivent les principes du design system SLC :
- **Cohérence** : Même API et comportement entre composants similaires
- **Accessibilité** : Support ARIA et navigation clavier
- **Responsivité** : Adaptation automatique aux différentes tailles d'écran
- **Thématisation** : Support des thèmes clair/sombre

## 🧩 Composants de base

### UiButton
Bouton réutilisable avec variants et tailles

```vue
<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <UiSpinner v-if="loading" class="mr-2 h-4 w-4" />
    <component 
      :is="icon" 
      v-else-if="icon" 
      class="mr-2 h-4 w-4" 
    />
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import UiSpinner from './UiSpinner.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => [
      'primary', 'secondary', 'danger', 'success', 'warning', 'ghost'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  disabled: Boolean,
  loading: Boolean,
  icon: String,
  fullWidth: Boolean
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
  }
  
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-base'
  }
  
  const width = props.fullWidth ? 'w-full' : ''
  const disabled = (props.disabled || props.loading) ? 'opacity-50 cursor-not-allowed' : ''
  
  return [base, variants[props.variant], sizes[props.size], width, disabled]
})

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
```

**Utilisation :**
```vue
<template>
  <div class="space-y-4">
    <!-- Bouton principal -->
    <UiButton variant="primary" @click="handleSave">
      Enregistrer
    </UiButton>
    
    <!-- Bouton avec icône et loading -->
    <UiButton 
      variant="success" 
      :loading="saving"
      icon="CheckIcon"
    >
      Valider
    </UiButton>
    
    <!-- Bouton pleine largeur -->
    <UiButton variant="danger" full-width>
      Supprimer le contrat
    </UiButton>
  </div>
</template>
```

### UiInput
Champ de saisie avec validation

```vue
<template>
  <div class="space-y-1">
    <label 
      v-if="label" 
      :for="inputId" 
      class="block text-sm font-medium text-gray-700"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <div v-if="prefixIcon" class="absolute inset-y-0 left-0 pl-3 flex items-center">
        <component :is="prefixIcon" class="h-5 w-5 text-gray-400" />
      </div>
      
      <input
        :id="inputId"
        v-model="internalValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClasses"
        v-bind="$attrs"
        @blur="handleBlur"
        @focus="handleFocus"
      >
      
      <div v-if="suffixIcon" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <component :is="suffixIcon" class="h-5 w-5 text-gray-400" />
      </div>
    </div>
    
    <p v-if="error" class="text-sm text-red-600">
      {{ error }}
    </p>
    
    <p v-else-if="hint" class="text-sm text-gray-500">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  error: String,
  hint: String,
  disabled: Boolean,
  readonly: Boolean,
  required: Boolean,
  prefixIcon: String,
  suffixIcon: String,
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)
const focused = ref(false)

const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const inputClasses = computed(() => {
  const base = 'block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }
  
  const states = {
    error: 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500',
    disabled: 'bg-gray-50 text-gray-500 cursor-not-allowed',
    readonly: 'bg-gray-50'
  }
  
  const prefix = props.prefixIcon ? 'pl-10' : ''
  const suffix = props.suffixIcon ? 'pr-10' : ''
  
  let stateClass = ''
  if (props.error) stateClass = states.error
  else if (props.disabled) stateClass = states.disabled
  else if (props.readonly) stateClass = states.readonly
  
  return [base, sizes[props.size], stateClass, prefix, suffix]
})

const handleBlur = (event) => {
  focused.value = false
  emit('blur', event)
}

const handleFocus = (event) => {
  focused.value = true
  emit('focus', event)
}
</script>
```

### UiModal
Modal réutilisable avec gestion des tailles

```vue
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50"></div>
        
        <!-- Modal Container -->
        <div class="flex items-center justify-center min-h-screen p-4">
          <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="modelValue"
              :class="modalClasses"
              @click.stop
            >
              <!-- Header -->
              <div v-if="$slots.header || title" class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <slot name="header">
                    <h3 class="text-lg font-medium text-gray-900">
                      {{ title }}
                    </h3>
                  </slot>
                  
                  <button
                    v-if="closable"
                    @click="close"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <!-- Body -->
              <div class="px-6 py-4">
                <slot />
              </div>
              
              <!-- Footer -->
              <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200">
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const modalClasses = computed(() => {
  const base = 'relative bg-white rounded-lg shadow-xl max-h-full overflow-hidden'
  
  const sizes = {
    xs: 'max-w-xs w-full',
    sm: 'max-w-sm w-full',
    md: 'max-w-md w-full',
    lg: 'max-w-lg w-full',
    xl: 'max-w-2xl w-full',
    full: 'max-w-7xl w-full mx-4'
  }
  
  return [base, sizes[props.size]]
})

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

// Gestion de l'échappement clavier
watch(() => props.modelValue, (isOpen) => {
  const handleEscape = (event) => {
    if (event.key === 'Escape' && props.closable) {
      close()
    }
  }
  
  if (isOpen) {
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = ''
  }
})
</script>
```

### UiCard
Conteneur de contenu avec variants

```vue
<template>
  <div :class="cardClasses">
    <!-- Header -->
    <div v-if="$slots.header || title" :class="headerClasses">
      <slot name="header">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
          <slot name="actions" />
        </div>
      </slot>
    </div>
    
    <!-- Body -->
    <div :class="bodyClasses">
      <slot />
    </div>
    
    <!-- Footer -->
    <div v-if="$slots.footer" :class="footerClasses">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'bordered', 'elevated', 'flat'].includes(value)
  },
  padding: {
    type: String,
    default: 'default',
    validator: (value) => ['none', 'sm', 'default', 'lg'].includes(value)
  }
})

const cardClasses = computed(() => {
  const base = 'bg-white rounded-lg overflow-hidden'
  
  const variants = {
    default: 'border border-gray-200',
    bordered: 'border-2 border-gray-300',
    elevated: 'shadow-lg border border-gray-100',
    flat: ''
  }
  
  return [base, variants[props.variant]]
})

const headerClasses = computed(() => {
  const base = 'border-b border-gray-200'
  
  const paddings = {
    none: '',
    sm: 'px-3 py-2',
    default: 'px-4 py-3',
    lg: 'px-6 py-4'
  }
  
  return [base, paddings[props.padding]]
})

const bodyClasses = computed(() => {
  const paddings = {
    none: '',
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6'
  }
  
  return paddings[props.padding]
})

const footerClasses = computed(() => {
  const base = 'border-t border-gray-200'
  
  const paddings = {
    none: '',
    sm: 'px-3 py-2',
    default: 'px-4 py-3',
    lg: 'px-6 py-4'
  }
  
  return [base, paddings[props.padding]]
})
</script>
```

### UiTable
Tableau responsive avec tri et pagination

```vue
<template>
  <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
    <table class="min-w-full divide-y divide-gray-300">
      <!-- Header -->
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="getHeaderClasses(column)"
            @click="handleSort(column)"
          >
            <div class="flex items-center space-x-1">
              <span>{{ column.title }}</span>
              <div v-if="column.sortable" class="flex flex-col">
                <ChevronUpIcon 
                  :class="getSortIconClasses(column, 'asc')" 
                  class="h-3 w-3"
                />
                <ChevronDownIcon 
                  :class="getSortIconClasses(column, 'desc')" 
                  class="h-3 w-3 -mt-1"
                />
              </div>
            </div>
          </th>
        </tr>
      </thead>
      
      <!-- Body -->
      <tbody class="divide-y divide-gray-200 bg-white">
        <tr 
          v-for="(item, index) in paginatedData" 
          :key="getRowKey(item, index)"
          :class="getRowClasses(item, index)"
          @click="handleRowClick(item, index)"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="getCellClasses(column)"
          >
            <slot 
              :name="`cell-${column.key}`" 
              :item="item" 
              :value="getValue(item, column.key)"
              :index="index"
            >
              {{ formatValue(getValue(item, column.key), column) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Empty State -->
    <div v-if="paginatedData.length === 0" class="text-center py-12">
      <slot name="empty">
        <div class="text-gray-500">
          <FolderOpenIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune donnée</h3>
          <p class="mt-1 text-sm text-gray-500">{{ emptyMessage }}</p>
        </div>
      </slot>
    </div>
    
    <!-- Pagination -->
    <div 
      v-if="showPagination && totalPages > 1" 
      class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6"
    >
      <UiPagination
        v-model:current-page="currentPage"
        :total-pages="totalPages"
        :total-items="sortedData.length"
        :per-page="perPage"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ChevronUpIcon, ChevronDownIcon, FolderOpenIcon } from '@heroicons/vue/24/outline'
import UiPagination from './UiPagination.vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  rowKey: {
    type: [String, Function],
    default: 'id'
  },
  selectable: Boolean,
  clickableRows: Boolean,
  emptyMessage: {
    type: String,
    default: 'Aucune donnée disponible'
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  perPage: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['row-click', 'sort'])

const sortColumn = ref(null)
const sortDirection = ref('asc')
const currentPage = ref(1)

const sortedData = computed(() => {
  if (!sortColumn.value) return props.data
  
  return [...props.data].sort((a, b) => {
    const aVal = getValue(a, sortColumn.value.key)
    const bVal = getValue(b, sortColumn.value.key)
    
    let result = 0
    if (aVal < bVal) result = -1
    else if (aVal > bVal) result = 1
    
    return sortDirection.value === 'desc' ? -result : result
  })
})

const totalPages = computed(() => {
  return Math.ceil(sortedData.value.length / props.perPage)
})

const paginatedData = computed(() => {
  if (!props.showPagination) return sortedData.value
  
  const start = (currentPage.value - 1) * props.perPage
  const end = start + props.perPage
  return sortedData.value.slice(start, end)
})

const getValue = (item, key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], item)
}

const getRowKey = (item, index) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(item, index)
  }
  return getValue(item, props.rowKey) || index
}

const formatValue = (value, column) => {
  if (column.formatter && typeof column.formatter === 'function') {
    return column.formatter(value)
  }
  return value
}

const handleSort = (column) => {
  if (!column.sortable) return
  
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
  
  emit('sort', { column: column.key, direction: sortDirection.value })
}

const handleRowClick = (item, index) => {
  if (props.clickableRows) {
    emit('row-click', { item, index })
  }
}

const getHeaderClasses = (column) => {
  const base = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
  const sortable = column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
  return [base, sortable]
}

const getCellClasses = (column) => {
  const base = 'px-6 py-4 whitespace-nowrap text-sm'
  const align = column.align === 'center' ? 'text-center' : 
               column.align === 'right' ? 'text-right' : 'text-left'
  return [base, align]
}

const getRowClasses = (item, index) => {
  const base = ''
  const hover = props.clickableRows ? 'hover:bg-gray-50 cursor-pointer' : ''
  const stripe = index % 2 === 1 ? 'bg-gray-50' : ''
  return [base, hover, stripe]
}

const getSortIconClasses = (column, direction) => {
  if (sortColumn.value !== column) return 'text-gray-300'
  return sortDirection.value === direction ? 'text-gray-900' : 'text-gray-300'
}
</script>
```

### UiDropdown
Menu déroulant avec support des actions

```vue
<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <!-- Trigger -->
    <div @click="toggle">
      <slot name="trigger" :open="isOpen">
        <UiButton 
          :variant="triggerVariant"
          :size="triggerSize"
          :class="triggerClasses"
        >
          {{ triggerText }}
          <ChevronDownIcon 
            :class="[
              'ml-2 h-4 w-4 transition-transform',
              isOpen ? 'rotate-180' : ''
            ]" 
          />
        </UiButton>
      </slot>
    </div>
    
    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        :class="menuClasses"
        @click.stop
      >
        <div class="py-1">
          <template v-for="(item, index) in items" :key="index">
            <!-- Separator -->
            <div 
              v-if="item.type === 'separator'"
              class="border-t border-gray-100 my-1"
            />
            
            <!-- Menu Item -->
            <component
              v-else
              :is="item.to ? 'router-link' : 'button'"
              :to="item.to"
              :class="getItemClasses(item)"
              :disabled="item.disabled"
              @click="handleItemClick(item)"
            >
              <component 
                v-if="item.icon" 
                :is="item.icon" 
                class="mr-3 h-4 w-4" 
              />
              {{ item.label }}
              <span v-if="item.badge" class="ml-auto">
                <UiBadge :variant="item.badge.variant">
                  {{ item.badge.text }}
                </UiBadge>
              </span>
            </component>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import UiButton from './UiButton.vue'
import UiBadge from './UiBadge.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  triggerText: {
    type: String,
    default: 'Actions'
  },
  triggerVariant: {
    type: String,
    default: 'secondary'
  },
  triggerSize: {
    type: String,
    default: 'md'
  },
  placement: {
    type: String,
    default: 'bottom-end',
    validator: (value) => [
      'bottom-start', 'bottom-end', 'top-start', 'top-end'
    ].includes(value)
  },
  width: {
    type: String,
    default: 'auto'
  }
})

const emit = defineEmits(['item-click'])

const isOpen = ref(false)
const dropdownRef = ref(null)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

const menuClasses = computed(() => {
  const base = 'absolute z-10 mt-2 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
  
  const placements = {
    'bottom-start': 'left-0',
    'bottom-end': 'right-0',
    'top-start': 'bottom-full left-0 mb-2',
    'top-end': 'bottom-full right-0 mb-2'
  }
  
  const width = props.width === 'auto' ? 'w-56' : props.width
  
  return [base, placements[props.placement], width]
})

const triggerClasses = computed(() => {
  return isOpen.value ? 'ring-2 ring-blue-500' : ''
})

const getItemClasses = (item) => {
  const base = 'group flex w-full items-center px-4 py-2 text-sm text-left'
  
  if (item.disabled) {
    return [base, 'text-gray-400 cursor-not-allowed']
  }
  
  const variants = {
    default: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
    danger: 'text-red-700 hover:bg-red-50 hover:text-red-900'
  }
  
  return [base, variants[item.variant || 'default']]
}

const handleItemClick = (item) => {
  if (item.disabled) return
  
  emit('item-click', item)
  
  if (item.action && typeof item.action === 'function') {
    item.action()
  }
  
  close()
}

// Fermer le dropdown en cliquant à l'extérieur
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
```

## 🎯 Exemples d'utilisation

### Formulaire complet
```vue
<template>
  <UiCard title="Nouveau contrat" variant="elevated">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <UiInput
        v-model="form.title"
        label="Titre du contrat"
        placeholder="Entrez le titre"
        required
        :error="getFieldError('title')"
      />
      
      <UiInput
        v-model="form.description"
        type="textarea"
        label="Description"
        hint="Description détaillée du contrat"
        :error="getFieldError('description')"
      />
      
      <div class="flex justify-end space-x-3">
        <UiButton variant="secondary" @click="cancel">
          Annuler
        </UiButton>
        <UiButton 
          type="submit" 
          variant="primary"
          :loading="saving"
        >
          Créer le contrat
        </UiButton>
      </div>
    </form>
  </UiCard>
</template>
```

### Liste avec actions
```vue
<template>
  <UiCard title="Mes contrats">
    <template #actions>
      <UiDropdown :items="bulkActions">
        <template #trigger="{ open }">
          <UiButton variant="ghost" size="sm">
            Actions
          </UiButton>
        </template>
      </UiDropdown>
    </template>
    
    <UiTable
      :data="contracts"
      :columns="contractColumns"
      clickable-rows
      @row-click="openContract"
    >
      <template #cell-status="{ value }">
        <UiBadge :variant="getStatusVariant(value)">
          {{ value }}
        </UiBadge>
      </template>
      
      <template #cell-actions="{ item }">
        <UiDropdown :items="getRowActions(item)" />
      </template>
    </UiTable>
  </UiCard>
</template>
```

Ces composants UI forment la base du design system de Smart Legal Contract et garantissent une expérience utilisateur cohérente et professionnelle.