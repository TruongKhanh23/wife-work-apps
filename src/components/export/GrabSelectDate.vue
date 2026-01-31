<template>
  <div class="w-full">
    <!-- container -->
    <div class="flex flex-col gap-4 w-full">
      <!-- label + input -->
      <div class="flex flex-col gap-2 w-full">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-400"
        >
          Select Date(s)
        </label>

        <flat-pickr
          v-model="rangeDate"
          :config="multiDateConfig"
          class="h-10 w-full border border-gray-300 rounded px-2 py-1 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
          placeholder="Select multiple dates"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'

const multiDateConfig = {
  mode: 'multiple',
  dateFormat: 'd/m/Y',
  altInput: true,
  altFormat: 'd/m/Y',
  allowInput: true,
  conjunction: ', ',
}

const rangeDate = ref([])
</script>
