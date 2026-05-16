<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
  >
    <div class="px-4 py-4 sm:pl-6 sm:pr-4 flex flex-col gap-5">
      <!-- Row 1: Channel select -->
      <div>
        <MultipleSelect v-model="selectedChannels" :options="channels" :is-multi="true">
          <template #label> Select Channels </template>
        </MultipleSelect>
      </div>

      <!-- Row 2: File uploads + Export button -->
      <div class="flex flex-wrap items-end gap-4">
        <!-- Input File(s) -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Select Input File(s)
          </label>
          <div class="flex items-center gap-2">
            <input
              ref="fileInput"
              type="file"
              accept=".xlsx,.xls"
              multiple
              @change="handleFileUpload"
              class="hidden"
            />
            <input
              type="text"
              :value="fileName"
              placeholder="Upload File..."
              disabled
              class="dark:bg-dark-900 h-11 min-w-[280px] rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
            <button
              @click="$refs.fileInput.click()"
              :disabled="isLoading"
              class="h-11 flex items-center justify-center gap-2 px-4 text-sm font-medium text-white rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 whitespace-nowrap"
            >
              Upload File
            </button>
          </div>
        </div>

        <!-- Branch Mapping File -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Branch Mapping File
          </label>
          <div class="flex items-center gap-2">
            <input
              ref="branchMappingInput"
              type="file"
              accept=".xlsx,.xls"
              @change="handleBranchMappingUpload"
              class="hidden"
            />
            <input
              type="text"
              :value="branchMappingFileName"
              placeholder="branch-mapping.xlsx..."
              disabled
              class="dark:bg-dark-900 h-11 min-w-[280px] rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
            <button
              @click="$refs.branchMappingInput.click()"
              :disabled="isLoading"
              class="h-11 flex items-center justify-center gap-2 px-4 text-sm font-medium text-white rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 whitespace-nowrap"
            >
              Upload File
            </button>
          </div>
        </div>

        <!-- Export button (aligned to bottom of row) -->
        <div class="flex flex-col items-start pb-0">
          <button
            @click="handleExport"
            :disabled="isLoading || !canExport"
            class="h-11 flex items-center justify-center gap-2 px-6 text-sm font-medium text-white rounded-lg shadow-theme-xs transition-colors whitespace-nowrap"
            :class="
              canExport && !isLoading
                ? 'bg-brand-500 hover:bg-brand-600 cursor-pointer'
                : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
            "
          >
            <span v-if="isLoading">Processing...</span>
            <span v-else>Export</span>
          </button>
        </div>

        <!-- Download sample (pushed to right) -->
        <div class="ml-auto">
          <button
            @click="downloadTemplate"
            class="h-11 shadow-theme-xs flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 whitespace-nowrap"
          >
            Download sample file
          </button>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Date pickers cho từng channel -->
        <div class="flex flex-col gap-4 flex-shrink-0">
          <div v-for="channel in selectedChannels" :key="channel" class="flex items-center gap-2">
            <label class="w-24 mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              {{ channel }}
            </label>

            <!-- 🗓 Cho phép chọn nhiều ngày -->
            <flat-pickr
              v-model="channelDateRanges[channel]"
              :config="multiDateConfig"
              class="h-10 min-w-[500px] border border-gray-300 rounded px-2 py-1 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
              placeholder="Select multiple dates"
            />
          </div>
        </div>

        <!-- Phần hướng dẫn hoặc xử lý dữ liệu hiện có -->
        <div class="bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="w-full max-w-[830px] flex flex-col gap-4">
            <h3
              class="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl"
            >
              Hướng dẫn chuyển đổi thành file Excel 97 - 2003 Workbook
            </h3>

            <ol
              class="list-decimal list-inside text-sm text-gray-500 dark:text-gray-400 sm:text-base flex flex-col gap-2"
            >
              <li>Tải và giải nén folder kết quả.</li>
              <li>
                Tải và giải nén các file logic <code class="font-bold">convert_to_xls.bat</code> và
                <code class="font-bold">do_not_touch_convert_excel.ps1</code> bằng cách nhấn vào nút
                Download bên dưới và đặt chúng cùng với folder kết quả.
              </li>
              <li>
                Nhấp đúp chuột để chạy file <code class="font-bold">convert_to_xls.bat</code>.
              </li>
              <li>Kiểm tra kết quả trong folder "<code>dd-mm-yyyy-Converted</code>".</li>
            </ol>

            <div class="mb-5 overflow-hidden rounded-lg">
              <img src="/demo-convert-to-xls.png" alt="card" class="overflow-hidden rounded-lg" />
            </div>
          </div>

          <!-- New: Download conversion tool -->
          <button
            @click="downloadConversionTool"
            class="shadow-theme-xs flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Download tool convert Excel 97-2003
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx-js-style'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import MultipleSelect from '@/components/forms/FormElements/MultipleSelect.vue'

/* ---------------------- FLATPICKR CONFIG ---------------------- */
const multiDateConfig = {
  mode: 'multiple',
  dateFormat: 'd/m/Y',
  altInput: true,
  altFormat: 'd/m/Y',
  allowInput: true,
  conjunction: ', ',
}

/* ---------------------- STATE ---------------------- */
const fileName = ref('')
const isLoading = ref(false)
const fileInput = ref(null)

// Branch mapping state (replaces static import)
const branchMappingInput = ref(null)
const branchMappingFileName = ref('')
const branchMappingLoaded = ref(false)
const branchMappingData = ref([]) // Array of { branchUnit, branchCode, inventoryCode, branchUnitName, branchNameInUnitFile, branchNameMomo }

// Uploaded cost files (stored for deferred export)
const uploadedFiles = ref([])

// Can only export when both files are ready
const canExport = computed(() => uploadedFiles.value.length > 0 && branchMappingLoaded.value)

const channels = [
  { label: 'Bank', value: 'Bank' },
  { label: 'Momo', value: 'Momo' },
  { label: 'GrabFood', value: 'GrabFood' },
  { label: 'BeFood', value: 'BeFood' },
  { label: 'ZaloPay', value: 'ZaloPay' },
  { label: 'XanhSM', value: 'XanhSM' },
  { label: 'Vill', value: 'Vill' },
  { label: 'Ryo', value: 'Ryo' },
  { label: 'VNPay', value: 'VNPay' },
  { label: 'ShopeeFood', value: 'ShopeeFood' },
]

const selectedChannels = ref([])
const channelDateRanges = ref(
  channels.reduce((acc, ch) => {
    acc[ch.value] = []
    return acc
  }, {})
)

// --- Constants ---
const HEADERS = [
  'NgayChungTu',
  'GhiChu',
  'DoiTuong',
  'TkNo',
  'TkCo',
  'SoTienNte',
  'SoTien',
  'DienGiai',
  'NguoiGiaoDich',
  'DiaChi',
  'TienTe',
  'TyGia',
  'TkClear',
  'DoiTuongNo',
  'DoiTuongCo',
  'NganHangNo',
  'NganHangCo',
  'CongViecNo',
  'CongViecCo',
  'MucCpNo',
  'MucCpCo',
  'SpNo',
  'SpCo',
  'MaHHNo',
  'MaHHCo',
  'MaExtra1',
  'MaExtra2',
  'DonViNhan',
  'ThamChieu',
  'NhanVien',
  '',
]

const EXTRA_DATE_HEADERS = ['NgayChungTu', 'ThamChieu']
const YELLOW_HEADERS = [
  'SoChungTu',
  'NgayChungTu',
  'GhiChu',
  'TkNo',
  'TkCo',
  'SoTien',
  'DienGiai',
  'CongViecNo',
  'MucCpNo',
  'ThamChieu',
]
const HIDDEN_COLS = [
  3, 6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 21, 22, 23, 24, 25, 26, 27, 28, 30,
]
const DATE_COLS_FIXED = [1, 29] // B & AD
const TEXT_COL = 21
const MONEY_COL = 6

// Expected columns in branch-mapping.xlsx (in order, header row)
const BRANCH_MAPPING_COLUMNS = [
  'branchUnit',
  'branchCode',
  'inventoryCode',
  'branchUnitName',
  'branchNameInUnitFile',
  'branchNameMomo',
]

function normalizeText(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLowerCase()
}

function findBranchUnitByMomoName(tenQuan) {
  const normalized = normalizeText(tenQuan)
  const found = branchMappingData.value.find((b) => normalizeText(b.branchNameMomo) === normalized)
  return found ? found.branchUnit : ''
}

// --- Helpers ---
function excelDateToString(val) {
  if (val == null || val === '') return ''
  if (typeof val === 'number' && !isNaN(val)) {
    const d = XLSX.SSF.parse_date_code(val)
    if (d?.y) return `${String(d.d).padStart(2, '0')}/${String(d.m).padStart(2, '0')}/${d.y}`
  }
  if (typeof val === 'string') {
    const iso = val.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
    const dm = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (dm) return val
    const parsed = new Date(val)
    if (!isNaN(parsed.getTime()))
      return `${String(parsed.getDate()).padStart(2, '0')}/${String(parsed.getMonth() + 1).padStart(
        2,
        '0'
      )}/${parsed.getFullYear()}`
  }
  return val
}

function toSnakeCaseFileName(name) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase()
    .replace(/^_+|_+$/g, '')
}

function createSheetDataSlice(slice, dateColumnIndexes) {
  dateColumnIndexes.forEach((idx) => {
    if (idx < slice.length && slice[idx] != null && slice[idx] !== '') {
      slice[idx] = excelDateToString(slice[idx])
    }
  })
  return slice
}

function applyStyles(ws, sheetData) {
  ws['!cols'] = ws['!cols'] || []
  sheetData[0].forEach((_, colIdx) => {
    const maxLength =
      Math.max(10, ...sheetData.map((r) => (r[colIdx] != null ? String(r[colIdx]).length : 0))) + 2
    ws['!cols'][colIdx] = { wch: maxLength }
    if (HIDDEN_COLS.includes(colIdx)) ws['!cols'][colIdx].hidden = true
  })

  sheetData[0].forEach((v, colIdx) => {
    if (YELLOW_HEADERS.includes(v)) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx })
      ws[cellRef].s = ws[cellRef].s || {}
      ws[cellRef].s.fill = { patternType: 'solid', fgColor: { rgb: 'FFFF00' } }
      ws[cellRef].s.font = { bold: true }
    }
  })

  const thinBorder = {
    top: { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } },
  }

  for (let r = 0; r < sheetData.length; r++) {
    for (let c = 0; c < HEADERS.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c })
      if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '', s: {} }
      ws[cellRef].s = ws[cellRef].s || {}
      ws[cellRef].s.border = thinBorder
    }
  }

  for (let r = 1; r < sheetData.length; r++) {
    DATE_COLS_FIXED.forEach((c) => {
      const cellRef = XLSX.utils.encode_cell({ r, c })
      const val = sheetData[r][c]
      if (val) {
        let jsDate = null

        if (typeof val === 'string') {
          const parts = val.split('/').map(Number)
          if (parts.length === 3) {
            jsDate = new Date(parts[2], parts[1] - 1, parts[0]) // dd/mm/yyyy
          }
        } else if (val instanceof Date) {
          jsDate = val
        }

        if (jsDate && !isNaN(jsDate.getTime())) {
          const excelEpoch = Date.UTC(1899, 11, 30)
          const utcDateMs = Date.UTC(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate())
          const excelSerialDate = Math.round((utcDateMs - excelEpoch) / (24 * 60 * 60 * 1000))

          ws[cellRef] = {
            t: 'n',
            v: excelSerialDate,
            s: {
              ...ws[cellRef]?.s,
              numFmt: 'dd/mm/yyyy',
              alignment: { horizontal: 'center' },
            },
          }
        }
      }
    })

    const textCellRef = XLSX.utils.encode_cell({ r, c: TEXT_COL })
    if (sheetData[r][TEXT_COL] != null)
      ws[textCellRef] = { t: 's', v: sheetData[r][TEXT_COL], s: ws[textCellRef]?.s || {} }

    const moneyCellRef = XLSX.utils.encode_cell({ r, c: MONEY_COL })
    const moneyValue = Number(sheetData[r][MONEY_COL])
    if (!isNaN(moneyValue))
      ws[moneyCellRef] = {
        t: 'n',
        v: moneyValue,
        s: { ...ws[moneyCellRef]?.s, numFmt: '_(* #.##0_);_(* (#.##0);_(* "-"??_);_(@_)' },
      }
  }
}

// --- Branch Mapping Upload Handler ---
async function handleBranchMappingUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return

  try {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    if (rows.length < 2) {
      alert('❌ File branch mapping không có dữ liệu.')
      e.target.value = ''
      return
    }

    // Detect header row (first row)
    const headerRow = rows[0].map((h) => (h || '').toString().trim())

    // Validate required columns exist
    const missing = BRANCH_MAPPING_COLUMNS.filter((col) => !headerRow.includes(col))
    if (missing.length > 0) {
      alert(
        `❌ File branch mapping thiếu các cột:\n${missing.join(
          ', '
        )}\n\nCác cột cần có:\n${BRANCH_MAPPING_COLUMNS.join(', ')}`
      )
      e.target.value = ''
      return
    }

    // Build index map for column positions
    const colIndex = {}
    BRANCH_MAPPING_COLUMNS.forEach((col) => {
      colIndex[col] = headerRow.indexOf(col)
    })

    // Parse rows
    const parsed = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.every((cell) => cell == null || cell === '')) continue
      const entry = {}
      BRANCH_MAPPING_COLUMNS.forEach((col) => {
        entry[col] = (row[colIndex[col]] ?? '').toString().trim()
      })
      if (entry.branchNameMomo) {
        parsed.push(entry)
      }
    }

    if (parsed.length === 0) {
      alert('❌ Không tìm thấy dữ liệu hợp lệ trong file branch mapping.')
      e.target.value = ''
      return
    }

    branchMappingData.value = parsed
    branchMappingLoaded.value = true
    branchMappingFileName.value = file.name
  } catch (err) {
    alert('❌ Lỗi đọc file branch mapping: ' + err.message)
    e.target.value = ''
  }
}

// --- Input File Upload Handler (stores files, does NOT export) ---
function handleFileUpload(e) {
  let files = Array.from(e.target.files || [])
  if (files.length === 0) return

  const invalidFiles = files.filter((f) => !/^\d{2}\.\d{2}\.\d{4}\.(xlsx|xls)$/i.test(f.name))
  if (invalidFiles.length > 0) {
    alert(`❌ Tên file sai: \n${invalidFiles.map((f) => f.name).join('\n')}`)
    e.target.value = ''
    fileName.value = ''
    uploadedFiles.value = []
    return
  }

  uploadedFiles.value = files
  fileName.value = files.map((f) => f.name).join(', ')
}

// --- Export Handler (triggered by Export button) ---
async function handleExport() {
  if (!canExport.value) return

  isLoading.value = true

  try {
    await processExport(uploadedFiles.value)
  } catch (err) {
    alert('❌ Lỗi xuất file: ' + err.message)
  } finally {
    isLoading.value = false
  }
}

// --- Core export logic (unchanged from original handleFileUpload processing) ---
async function processExport(files) {
  const zip = new JSZip()
  const allStoresData = {}

  function parseDateFromFileName(name) {
    const base = name.replace(/\.[^.]+$/, '')
    const parts = base.split('.')
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts.map(Number)
      return new Date(yyyy, mm - 1, dd)
    }
    return null
  }

  files = [...files].sort((a, b) => parseDateFromFileName(a.name) - parseDateFromFileName(b.name))

  let lastSoChungTuGlobal = null

  for (const [fileIdx, file] of files.entries()) {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets['SUMMARY']
    if (!sheet) {
      alert(`❌ Không tìm thấy sheet SUMMARY trong file ${file.name}`)
      continue
    }

    const rowsRaw = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(4)
    const dateColumnIndexes = HEADERS.reduce((acc, h, idx) => {
      const lower = (h || '').toLowerCase()
      const extrasLower = EXTRA_DATE_HEADERS.map((s) => s.toLowerCase())
      if (lower.includes('ngay') || extrasLower.includes(lower)) acc.push(idx)
      return acc
    }, [])

    rowsRaw.forEach((row) => {
      const storeName = row[1]
      if (!storeName) return

      if (!allStoresData[storeName]) {
        const initSoChungTu = fileIdx === 0 ? Number(row[3]) || 0 : lastSoChungTuGlobal || 0
        allStoresData[storeName] = { slices: [], lastSoChungTu: initSoChungTu }
      }

      const blockSize = HEADERS.length
      for (let colStart = 4; colStart < row.length; colStart += blockSize) {
        const slice = createSheetDataSlice(
          row.slice(colStart, colStart + blockSize),
          dateColumnIndexes
        )
        const moneyValue = slice[6]
        if (moneyValue != null && moneyValue !== '' && !isNaN(Number(moneyValue))) {
          allStoresData[storeName].slices.push(slice)
        }
      }
    })
  }

  // Xuất file Excel cho từng quán
  Object.entries(allStoresData).forEach(([storeName, data]) => {
    const { slices, lastSoChungTu } = data

    const filteredSlices = slices.filter((slice) => {
      const lastValue = (slice[slice.length - 1] || '').toString().toLowerCase()

      if (selectedChannels.value.length === channels.length) {
        return selectedChannels.value.some((ch) => isRowInChannelDateRange(slice, ch))
      }

      return selectedChannels.value.some(
        (ch) => lastValue.includes(ch.toLowerCase()) && isRowInChannelDateRange(slice, ch)
      )
    })

    const finalHeaders = [...HEADERS]
    finalHeaders.splice(finalHeaders.length - 1, 0, 'Donvi')

    const sheetData = [['SoChungTu', ...finalHeaders]]

    let soChungTu = lastSoChungTu
    filteredSlices.forEach((slice) => {
      soChungTu++
      const newSlice = [...slice]
      const branchUnit = findBranchUnitByMomoName(storeName)
      newSlice.splice(newSlice.length - 1, 0, branchUnit)
      sheetData.push([soChungTu, ...newSlice])
    })

    data.finalSoChungTu = soChungTu
    lastSoChungTuGlobal = soChungTu

    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    applyStyles(ws, sheetData)

    const newWb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(newWb, ws, 'Sheet1')
    zip.file(
      `${toSnakeCaseFileName(storeName)}.xlsx`,
      XLSX.write(newWb, { type: 'array', bookType: 'xlsx' })
    )
  })

  const finalHeaders = [...HEADERS]
  finalHeaders.splice(finalHeaders.length - 1, 0, 'Donvi')
  const allCombinedData = [['SoChungTu', ...finalHeaders, 'TenQuan']]

  Object.entries(allStoresData).forEach(([storeName, data]) => {
    const { slices, lastSoChungTu } = data
    const filteredSlices = slices.filter((slice) => {
      const lastValue = (slice[slice.length - 1] || '').toString().toLowerCase()
      if (selectedChannels.value.length === channels.length) {
        return selectedChannels.value.some((ch) => isRowInChannelDateRange(slice, ch))
      }
      return selectedChannels.value.some(
        (ch) => lastValue.includes(ch.toLowerCase()) && isRowInChannelDateRange(slice, ch)
      )
    })

    let soChungTu = Math.max(1, (lastSoChungTu || 0) - slices.length + 1)
    filteredSlices.forEach((slice) => {
      const newSlice = [...slice]
      const branchUnit = findBranchUnitByMomoName(storeName)
      newSlice.splice(newSlice.length - 1, 0, branchUnit)
      allCombinedData.push([soChungTu++, ...newSlice, storeName])
    })
  })

  const wsTotal = XLSX.utils.aoa_to_sheet(allCombinedData)
  applyStyles(wsTotal, allCombinedData)

  const wbTotal = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wbTotal, wsTotal, 'TongHop')

  zip.file(`TongHop.xlsx`, XLSX.write(wbTotal, { type: 'array', bookType: 'xlsx' }))

  for (const file of files) {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets['SUMMARY']
    const rowsRaw = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    for (let i = 4; i < rowsRaw.length; i++) {
      const row = rowsRaw[i]
      const storeName = row[1]
      if (storeName && allStoresData[storeName]) {
        row[3] = allStoresData[storeName].finalSoChungTu
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(rowsRaw)
    workbook.Sheets['SUMMARY'] = ws

    zip.file(
      `${file.name.replace(/\.[^.]+$/, '')}_last_export.xlsx`,
      XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
    )
  }

  function parseDateFromFileName(name) {
    const base = name.replace(/\.[^.]+$/, '')
    const parts = base.split('.')
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts.map(Number)
      return new Date(yyyy, mm - 1, dd)
    }
    return null
  }

  const dates = files
    .map((f) => parseDateFromFileName(f.name))
    .filter((d) => d instanceof Date && !isNaN(d))

  let zipName = 'result.zip'
  if (dates.length === 1) {
    zipName = files[0].name.replace(/\.[^.]+$/, '') + '.zip'
  } else if (dates.length > 1) {
    dates.sort((a, b) => a - b)
    const format = (d) =>
      `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}.${d.getFullYear()}`
    const first = dates[0]
    const last = dates[dates.length - 1]

    let isContinuous = true
    for (let i = 1; i < dates.length; i++) {
      const diff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)
      if (diff !== 1) {
        isContinuous = false
        break
      }
    }

    if (isContinuous) {
      zipName = `${format(first)}_to_${format(last)}.zip`
    } else {
      zipName = dates.map(format).join('-') + '.zip'
    }
  }

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, zipName)
}

// --- New: Download conversion tool ---
async function downloadConversionTool() {
  try {
    const zip = new JSZip()
    const files = [
      { path: '/convert-to-xls/convert_to_xls.bat', name: 'convert_to_xls.bat' },
      {
        path: '/convert-to-xls/do_not_touch_convert_excel.ps1',
        name: 'do_not_touch_convert_excel.ps1',
      },
    ]

    for (const file of files) {
      const response = await fetch(file.path)
      if (!response.ok) throw new Error(`Không tải được file ${file.name}`)
      const blob = await response.blob()
      zip.file(file.name, blob)
    }

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'Excel_Conversion_Tool.zip')
  } catch (err) {
    alert('❌ Lỗi tải công cụ: ' + err.message)
  }
}

function isRowInChannelDateRange(row, channel) {
  const dateStr = excelDateToString(row[28])
  if (!dateStr) return false

  const [dd, mm, yyyy] = dateStr.split('/').map(Number)
  const rowTime = Date.UTC(yyyy, mm - 1, dd)

  let selectedDates = channelDateRanges.value[channel]

  if (!Array.isArray(selectedDates)) {
    if (typeof selectedDates === 'string') {
      selectedDates = selectedDates
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.includes('/'))
    } else {
      selectedDates = []
    }
  }

  if (selectedDates.length === 0) return true

  console.log('🗓 [Compare Dates]')
  console.log(`→ Channel: ${channel}`)
  console.log(`→ Row date (Excel): ${dateStr} (UTC=${new Date(rowTime).toISOString()})`)
  console.log('→ Selected dates:', selectedDates)

  const result = selectedDates.some((sel) => {
    console.log(`   ├─ sel: ${sel}`)
    const [d, m, y] = sel.split('/').map(Number)
    const selTime = Date.UTC(y, m - 1, d)
    const match = selTime === rowTime
    console.log(`   │   selTime: ${selTime} (${new Date(selTime).toISOString()})`)
    console.log(`   │   rowTime: ${rowTime} (${new Date(rowTime).toISOString()})`)
    console.log(`   └─ Compare with selected: ${sel} → ${match ? '✅ MATCH' : '❌ not match'}`)
    return match
  })

  console.log(`→ Final match result for channel "${channel}": ${result ? '✅ true' : '❌ false'}`)
  console.log('---------------------------------------------')

  return result
}

// --- Main template download ---
async function downloadTemplate() {
  try {
    const response = await fetch('/cost-input.xlsx')
    if (!response.ok) throw new Error('Không tải được file mẫu')
    const blob = await response.blob()
    saveAs(blob, 'cost-input.xlsx')
  } catch (error) {
    alert('❌ Lỗi tải file mẫu: ' + error.message)
  }
}
</script>
