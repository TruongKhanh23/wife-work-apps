<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
    <input
      ref="fileInput"
      type="file"
      accept=".xlsx,.xls"
      multiple
      @change="onChange"
      class="hidden"
    />
    <input
      type="text"
      :value="fileName"
      placeholder="Upload File..."
      disabled
      class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
    />
    <button
      @click="$refs.fileInput.click()"
      :disabled="isLoading"
      class="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-70 sm:w-auto"
    >
      <span v-if="isLoading" class="animate-spin">
        <!-- spinner -->
      </span>
      {{ isLoading ? 'Processing...' : 'Upload File' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  fileName: String,
  isLoading: Boolean,
})
const emit = defineEmits(['upload'])

const fileInput = ref(null)

function onChange(e) {
  emit('upload', e)
}
</script>
