<template>
  <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="px-4 py-4 sm:pl-6 sm:pr-4 flex flex-col gap-4">

      <!-- Upload + template -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <RevenueFileInput
          v-model:fileName="fileName"
          :isLoading="isLoading"
          @upload="handleFileUpload"
        />
        <RevenueTemplateDownload @download="downloadTemplate" />
      </div>

      <!-- Guide + conversion tool -->
      <RevenueConversionGuide @downloadTool="downloadConversionTool" />

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RevenueFileInput from './RevenueFileInput.vue'
import RevenueTemplateDownload from './RevenueTemplateDownload.vue'
import RevenueConversionGuide from './RevenueConversionGuide.vue'
import useRevenueExport from '@/composables/useRevenueExport'

const fileName = ref('')
const isLoading = ref(false)

const { handleFileUpload, downloadTemplate, downloadConversionTool } = useRevenueExport({
  fileName,
  isLoading,
})
</script>
