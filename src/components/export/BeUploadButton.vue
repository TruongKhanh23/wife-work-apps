<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
  >
    <div class="px-4 py-4 sm:pl-6 sm:pr-4 flex flex-col gap-4 min-h-screen">
      <!-- Upload + Export buttons -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Upload New Password (if changes)
            </label>
            <input
              ref="fileInput"
              type="file"
              accept=".xlsx,.xls"
              @change="handleFileUpload"
              class="hidden"
            />
            <input
              type="text"
              :value="fileName"
              placeholder="Upload File accounts..."
              disabled
              class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
            />
          </div>
          <button
            @click="$refs.fileInput.click()"
            class="mt-6 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 sm:w-auto"
          >
            Upload File
          </button>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button
            @click="downloadTemplate"
            class="shadow-theme-xs flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Download Sample Password
          </button>

          <!-- Export + Spinner -->
          <button
            @click="handleExport"
            :disabled="isLoading"
            class="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-70 sm:w-auto"
          >
            <span v-if="isLoading" class="animate-spin">
              <!-- SVG spinner -->
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle opacity="0.5" cx="10" cy="10" r="8.75" stroke="white" stroke-width="2.5" />
                <path
                  d="M18.2372 12.9506C18.8873 13.1835 19.6113 12.846 19.7613 12.1719C20.0138 11.0369 20.0672 9.86319 19.9156 8.70384C19.7099 7.12996 19.1325 5.62766 18.2311 4.32117C17.3297 3.01467 16.1303 1.94151 14.7319 1.19042C13.7019 0.637155 12.5858 0.270357 11.435 0.103491C10.7516 0.00440265 10.179 0.561473 10.1659 1.25187C10.1528 1.94226 10.7059 2.50202 11.3845 2.6295C12.1384 2.77112 12.8686 3.02803 13.5487 3.39333C14.5973 3.95661 15.4968 4.76141 16.1728 5.74121C16.8488 6.721 17.2819 7.84764 17.4361 9.02796C17.5362 9.79345 17.5172 10.5673 17.3819 11.3223C17.2602 12.002 17.5871 12.7178 18.2372 12.9506Z"
                  stroke="white"
                  stroke-width="4"
                />
              </svg>
            </span>
            {{ isLoading ? 'Đang xử lý...' : 'Export' }}
          </button>
          <button
            v-if="isLoading"
            @click="stopProcessing"
            class="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-red-600 shadow-theme-xs hover:bg-red-700 sm:w-auto"
          >
            Stop
          </button>
        </div>
      </div>

      <!-- Table -->
      <div v-if="accounts.length" class="mt-4">
        <h3 class="font-semibold mb-2">
          {{ isProcessing ? 'Processing branches:' : 'Default branches:' }}
        </h3>
        <table class="table-auto border-collapse border border-gray-300 w-full text-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-2 py-1">Branch</th>
              <th class="border border-gray-300 px-2 py-1">Account</th>
              <th class="border border-gray-300 px-2 py-1">Password</th>
              <th class="border border-gray-300 px-2 py-1">MerchantId</th>
              <th class="border border-gray-300 px-2 py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(acc, idx) in accounts" :key="idx">
              <td class="border border-gray-300 px-2 py-1">{{ acc.branch }}</td>
              <td class="border border-gray-300 px-2 py-1">{{ acc.account }}</td>
              <td class="border border-gray-300 px-2 py-1">
                {{ acc.password }}
              </td>
              <td class="border border-gray-300 px-2 py-1">
                {{ acc.merchantId }}
              </td>
              <td class="border border-gray-300 px-2 py-1">
                <span
                  :class="{
                    'text-gray-500': acc.status === 'Not Start',
                    'text-blue-600': acc.status === 'Processing',
                    'text-green-600': acc.status === 'Done',
                    'text-red-600': acc.status === 'Error',
                  }"
                >
                  {{ acc.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { exportOrdersToExcel } from '@/utils/beExport'

const fileName = ref('')
const accounts = ref([])
const isLoading = ref(false)
const isProcessing = ref(false)
const stopFlag = ref(false)
const processedAccounts = ref([]) // lưu những quán đã Done

function stopProcessing() {
  stopFlag.value = true
}

// Hàm đọc file excel
async function loadAccountsFromExcel(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Không tìm thấy file mặc định')
  const data = await response.arrayBuffer()
  const workbook = XLSX.read(data, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  return rows
    .slice(1)
    .map((row) => ({
      branch: row[0],
      account: row[1],
      password: row[2],
      merchantId: row[3],
      status: 'Not Start', // ✅ thêm status mặc định
    }))
    .filter((acc) => acc.branch && acc.account)
}

async function downloadTemplate() {
  try {
    const response = await fetch('/be-export/branches_accounts.xlsx')
    if (!response.ok) throw new Error('Không tải được file mẫu')
    const blob = await response.blob()
    saveAs(blob, 'branches_accounts.xlsx')
  } catch (error) {
    alert('❌ Lỗi tải file mẫu: ' + error.message)
  }
}

async function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  fileName.value = file.name
  try {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    accounts.value = rows
      .slice(1)
      .map((row) => ({
        branch: row[0],
        account: row[1],
        password: row[2],
        merchantId: row[3],
        status: 'Not Start', // ✅ mặc định
      }))
      .filter((acc) => acc.branch && acc.account)

    if (accounts.value.length) {
      isProcessing.value = true
      isLoading.value = true

      // ✅ Cập nhật trạng thái theo từng quán
      for (const acc of accounts.value) {
        acc.status = 'Processing'
        await exportOrdersToExcel([acc]) // xử lý từng quán
        acc.status = 'Done'
      }

      alert('✅ Xuất file BE thành công')
    }
  } catch (err) {
    alert('❌ Lỗi đọc file Excel: ' + err.message)
  } finally {
    isLoading.value = false
  }
}

async function handleExport() {
  try {
    isLoading.value = true
    isProcessing.value = true
    stopFlag.value = false
    processedAccounts.value = []

    let listToProcess = accounts.value
    if (!listToProcess.length) {
      listToProcess = await loadAccountsFromExcel('/be-export/branches_accounts.xlsx')
      accounts.value = listToProcess
    }

    for (const acc of listToProcess) {
      if (stopFlag.value) break // ✅ nếu bấm Stop thì thoát vòng lặp
      acc.status = 'Processing'
      await exportOrdersToExcel([acc], false) // false = không download ngay
      acc.status = 'Done'
      processedAccounts.value.push(acc)
    }

    if (stopFlag.value) {
      // ✅ Nếu stop thì nén & download những quán đã xử lý xong
      await exportOrdersToExcel(processedAccounts.value, true)
    }

    // ✅ Reset status về Not Start sau khi chạy hết (chỉ khi không Stop)
    if (!stopFlag.value) {
      accounts.value.forEach((acc) => (acc.status = 'Not Start'))
    }

    isProcessing.value = false
  } catch (err) {
    alert('❌ Lỗi Export: ' + err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    accounts.value = await loadAccountsFromExcel('/be-export/branches_accounts.xlsx')
    isProcessing.value = false
  } catch (err) {
    console.error('Không load được danh sách mặc định:', err.message)
  }
})
</script>
