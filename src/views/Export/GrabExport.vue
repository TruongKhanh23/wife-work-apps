<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12">
        <div
          class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div class="px-4 py-4 sm:pl-6 sm:pr-4 flex flex-col gap-4 min-h-screen">
            <GrabCookie v-model:cookie="cookie" />
            <div class="w-full">
              <div class="flex flex-col gap-4">
                <GrabSelectBranch v-model:selectedMerchants="selectedGrabMerchants" />
                <GrabSelectDate v-model:rangeDate="dateList" />
                <GrabExportButton
                  :process-text="processText"
                  :percent="percent"
                  @export="handleExport"
                  @stop="handleStopExport"
                />
                <RecentFiles
                  :files="files"
                  @download="downloadFile"
                  @delete="removeFile"
                  @download-all="downloadAll"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import GrabSelectBranch from '@/components/export/GrabSelectBranch.vue'
import GrabCookie from '@/components/export/GrabCookie.vue'
import GrabSelectDate from '@/components/export/GrabSelectDate.vue'
import GrabExportButton from '@/components/export/GrabExportButton.vue'
import { useFetchOrderIds } from '@/composables/grab/useFetchOrderIds'
import { useFetchOrderDetail } from '@/composables/grab/useFetchOrderDetail.js'
import { exportToExcelByMerchantFrontend } from '@/composables/grab/exportToExcelByMerchantFrontend.js'
import RecentFiles from '@/components/file-manager/RecentFiles.vue'
import { useRecentFiles } from '@/composables/file/useRecentFiles'

const { loadingFetchOrderIds, errorFetchOrderIds, orderIds, fetchOrderIds } = useFetchOrderIds()
const { loadingFetchOrderDetail, errorFetchOrderDetail, fetchOrderDetail } = useFetchOrderDetail()

const { files, addFile, downloadFile, downloadAll, resetFiles, removeFile } = useRecentFiles()
const store = useStore()
const currentPageTitle = ref('Grab Export')
const dateList = ref([])
const selectedGrabMerchants = ref([])
const cookie = ref('')
const isStopped = ref(false)
const processText = ref('')
const percent = ref(0)

function handleStopExport() {
  isStopped.value = true
}

async function handleExport({ stopFlag, done }) {
  resetFiles()
  isStopped.value = false
  try {
    const merchantInfos = store.getters.getGrabMerchants.map((m) => ({
      id: m.merchantID,
      name: m.merchantName.replace(/^Cà\s*Phê\s*Muối\s*Chú\s*Long\s*-?\s*/i, '').trim(),
    }))

    const targetMerchants =
      selectedGrabMerchants.value.length > 0
        ? merchantInfos.filter((m) => selectedGrabMerchants.value.includes(m.id))
        : merchantInfos

    for (const { id: merchantId, name: merchantName } of targetMerchants) {
      if (isStopped.value) break
      const safeName = merchantName.replace(/[/\\?%*:|"<>]/g, '_')
      const dataByDate = {}

      // =========================
      // FETCH DATA
      // =========================
      const dates = dateList.value.split(',').map((d) => d.trim())

      for (const dateStr of dates) {
        if (isStopped.value) break

        const intervals = [
          { startHour: 0, endHour: 11 },
          { startHour: 12, endHour: 23 },
        ]

        const allRows = []

        try {
          // =========================
          // PHASE 1 — FETCH IDS
          // =========================
          let allIds = []

          for (const { startHour, endHour } of intervals) {
            if (isStopped.value) break

            processText.value = `📦 Fetching Order IDs ${merchantName} ${dateStr} ${startHour}h-${endHour}h`

            const ids = await fetchOrderIds({
              cookie: cookie.value,
              merchantId,
              dateStr,
              startHour,
              endHour,
            })

            allIds.push(...ids)
          }

          const uniqueIds = [...new Set(allIds)]

          // ======= 30% cho phase ID =======
          percent.value = 30

          // =========================
          // PHASE 2 — FETCH DETAILS
          // =========================
          let doneCount = 0
          const totalDetails = uniqueIds.length || 1

          for (const id of uniqueIds) {
            if (isStopped.value) break

            processText.value = `🧾 Fetching Order Details: ${doneCount + 1}/${totalDetails} (orders) - ${merchantName} ${dateStr}`

            const rows = await fetchOrderDetail(id, merchantId, cookie.value, dateStr)

            allRows.push(...rows)

            doneCount++

            // ======= 30% -> 95% =======
            percent.value = 30 + Math.floor((doneCount / totalDetails) * 65)
          }

          if (allRows.length) {
            dataByDate[dateStr] = allRows
          }
        } catch (err) {
          console.error(`❌ ${merchantName} - ${dateStr}`, err)
        }
      }

      if (isStopped.value) break
      // =========================
      // EXPORT EXCEL
      // =========================
      const blob = await exportToExcelByMerchantFrontend(safeName, dataByDate)

      addFile({
        name: `${safeName}.xlsx`,
        blob,
      })
    }
  } finally {
    processText.value = ''
    percent.value = 0
    done()
  }
}
</script>
<style></style>
