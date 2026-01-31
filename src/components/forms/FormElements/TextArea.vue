<template>
  <div class="space-y-6">
    <div>
      <label class="mb-1.5 block text-sm font-medium" :class="labelClass">
        {{ label }}
      </label>

      <textarea
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        rows="6"
        :placeholder="placeholder"
        :disabled="isDisabled"
        :class="textareaClass"
      />

      <p
        v-if="isError"
        class="mt-1.5 text-theme-xs text-error-500"
      >
        Please enter a message in the textarea.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/* ---------- props ---------- */
const props = defineProps({
  label: { type: String, default: 'Description' },
  placeholder: { type: String, default: 'Enter description...' },
  modelValue: { type: String, default: '' }, // description
  isDisabled: { type: Boolean, default: false },
  isError: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])

/* ---------- styles ---------- */

const baseClass =
  'w-full rounded-lg bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden'

const textareaClass = computed(() => {
  if (props.isDisabled) {
    return `${baseClass}
      border border-gray-100 bg-gray-50 text-gray-400`
  }

  if (props.isError) {
    return `${baseClass}
      border border-error-300 focus:ring-3 focus:ring-error-500/10`
  }

  return `${baseClass}
      border border-gray-300 focus:ring-3 focus:ring-brand-500/10`
})

const labelClass = computed(() =>
  props.isDisabled ? 'text-gray-300' : 'text-gray-700'
)
</script>
