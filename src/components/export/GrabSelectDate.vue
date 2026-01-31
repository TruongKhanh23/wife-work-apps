<template>
  <div class="w-full">
    <div class="flex flex-col gap-4 w-full">
      <div class="flex flex-col gap-2 w-full">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Select Date(s)
        </label>

        <!-- ✅ dùng model -->
        <flat-pickr
          v-model="model"
          :config="multiDateConfig"
          class="h-10 w-full border border-gray-300 rounded px-2 py-1 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
          placeholder="Select multiple dates"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'

const props = defineProps({
  rangeDate: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:rangeDate'])

const model = computed({
  get: () => props.rangeDate,
  set: (val) => emit('update:rangeDate', val)
})

const multiDateConfig = {
  mode: 'multiple',
  dateFormat: 'd/m/Y',
  altInput: true,
  altFormat: 'd/m/Y',
  allowInput: true,
  conjunction: ', ',
}
</script>
