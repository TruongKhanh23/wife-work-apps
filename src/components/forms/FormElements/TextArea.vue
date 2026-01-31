<template>
  <div class="space-y-6">
    <div>
      <label class="mb-1.5 block text-sm font-medium" :class="labelClass">
        Description
      </label>

      <textarea
        v-model="description"
        rows="6"
        placeholder="Enter a description..."
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
import { ref, computed } from 'vue'

const description = ref('')

/* state */
const isDisabled = ref(false)
const isError = ref(false)

/* base class */
const baseClass =
  'w-full rounded-lg bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden'

const textareaClass = computed(() => {
  if (isDisabled.value) {
    return `${baseClass}
      border border-gray-100 bg-gray-50 text-gray-400`
  }

  if (isError.value) {
    return `${baseClass}
      border border-error-300 focus:ring-3 focus:ring-error-500/10`
  }

  // default normal
  return `${baseClass}
      border border-gray-300 focus:ring-3 focus:ring-brand-500/10`
})

const labelClass = computed(() =>
  isDisabled.value ? 'text-gray-300' : 'text-gray-700'
)
</script>
