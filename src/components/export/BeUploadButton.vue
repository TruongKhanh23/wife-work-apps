<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
  >
    <div class="px-4 py-4 sm:pl-6 sm:pr-4 flex flex-col gap-4">
      <!-- Upload + Template buttons -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
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
          <button
            @click="$refs.fileInput.click()"
            class="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 sm:w-auto"
          >
            Upload File
          </button>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button
            @click="downloadTemplate"
            class="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-gray-500 shadow-theme-xs hover:bg-gray-600 sm:w-auto"
          >
            Tải file mẫu
          </button>

          <button
            @click="handleExport"
            class="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-green-600 shadow-theme-xs hover:bg-green-700 sm:w-auto"
          >
            Export
          </button>
        </div>
      </div>

      <!-- Hiển thị danh sách accounts sau khi upload -->
      <div v-if="accounts.length" class="mt-4">
        <h3 class="font-semibold mb-2">Danh sách accounts:</h3>
        <table class="table-auto border-collapse border border-gray-300 w-full text-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-2 py-1">Branch</th>
              <th class="border border-gray-300 px-2 py-1">Account</th>
              <th class="border border-gray-300 px-2 py-1">Password</th>
              <th class="border border-gray-300 px-2 py-1">MerchantId</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(acc, idx) in accounts" :key="idx">
              <td class="border border-gray-300 px-2 py-1">{{ acc.branch }}</td>
              <td class="border border-gray-300 px-2 py-1">{{ acc.account }}</td>
              <td class="border border-gray-300 px-2 py-1">{{ acc.password }}</td>
              <td class="border border-gray-300 px-2 py-1">{{ acc.merchantId }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// Import logic BE export
import { exportOrdersToExcel } from '@/utils/beExport'

const fileName = ref('')
const accounts = ref([])

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

    // Bỏ dòng tiêu đề => giả định 4 cột: branch | account | password | merchantId
    accounts.value = rows
      .slice(1)
      .map((row) => ({
        branch: row[0],
        account: row[1],
        password: row[2],
        merchantId: row[3],
      }))
      .filter((acc) => acc.branch && acc.account)

    if (accounts.value.length) {
      // 🔥 Gọi logic export BE
      await exportOrdersToExcel(accounts.value)
      alert('✅ Xuất file BE thành công')
    }
  } catch (err) {
    alert('❌ Lỗi đọc file Excel: ' + err.message)
  }
}

async function handleExport() {
  try {
    if (accounts.value.length) {
      // Đã có file upload => xuất trực tiếp
      await exportOrdersToExcel(accounts.value)
      alert("✅ Xuất file BE thành công")
      return
    }

    // Chưa upload file => dùng file mặc định
    const response = await fetch("/be-export/branches_accounts.xlsx")
    if (!response.ok) throw new Error("Không tìm thấy file mặc định")

    const data = await response.arrayBuffer()
    const workbook = XLSX.read(data, { type: "array" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    const defaultAccounts = rows.slice(1).map((row) => ({
      branch: row[0],
      account: row[1],
      password: row[2],
      merchantId: row[3],
    })).filter(acc => acc.branch && acc.account)

    if (!defaultAccounts.length) throw new Error("File mặc định không có dữ liệu")

    await exportOrdersToExcel(defaultAccounts)
    alert("✅ Xuất file BE thành công (dùng file mặc định)")
  } catch (err) {
    alert("❌ Lỗi Export: " + err.message)
  }
}

</script>
