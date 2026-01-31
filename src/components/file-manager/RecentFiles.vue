<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-gray-800 dark:bg-white/[0.03]"
  >
    <div class="flex items-center justify-between px-6 mb-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Files</h3>
      </div>

      <button
        @click="emit('download-all')"
        class="inline-flex items-center gap-2 text-gray-500 hover:text-brand-500"
      >
        Download All
      </button>
    </div>

    <div class="max-w-full overflow-x-auto">
      <table class="w-full border-collapse table-auto">
        <!-- Table Header -->
        <thead>
          <tr class="border-t border-gray-200 dark:border-gray-800">
            <th
              v-for="header in tableHeaders"
              :key="header"
              class="px-6 py-3 font-medium text-left text-gray-500 text-theme-sm dark:text-gray-400"
            >
              {{ header }}
            </th>
            <th
              class="px-6 py-3 font-medium text-center text-gray-500 text-theme-sm dark:text-gray-400"
            >
              Action
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody>
          <tr
            v-for="row in tableData"
            :key="row.id"
            class="border-t border-gray-100 dark:border-gray-800"
          >
            <td class="px-6 py-[18px] text-sm text-gray-700 dark:text-gray-400">
              <div class="flex items-center gap-2">
                <img :src="row.fileIcon.light" alt="icon" class="dark:hidden" />
                <img :src="row.fileIcon.dark" alt="icon" class="hidden dark:block" />
                {{ row.fileName }}
              </div>
            </td>
            <td class="px-6 py-[18px] text-gray-700 text-theme-sm dark:text-gray-400">
              {{ row.category }}
            </td>
            <td class="px-6 py-[18px] text-gray-700 text-theme-sm dark:text-gray-400">
              {{ row.size }}
            </td>
            <td class="px-6 py-[18px] text-gray-700 text-theme-sm dark:text-gray-400">
              {{ row.dateModified }}
            </td>
            <td class="px-6 py-[18px] text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="emit('download', row.raw)"
                  class="text-gray-500 hover:text-theme-purple-500 dark:text-gray-400 dark:hover:text-theme-purple-500"
                >
                  <DownloadIcon />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DownloadIcon from '@/icons/DownloadIcon.vue'

const props = defineProps({
  files: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['download', 'delete', 'download-all'])

const tableHeaders = ['File Name', 'Category', 'Size', 'Date Modified']

// map sang format cũ để giữ nguyên template
const tableData = computed(() =>
  props.files.map((f) => ({
    id: f.id,
    raw: f,
    fileName: f.name,
    category: f.category,
    size: f.size,
    dateModified: f.date,
    fileIcon: {
      light: '/images/icons/file-pdf.svg',
      dark: '/images/icons/file-pdf-dark.svg',
    },
  })),
)
</script>
