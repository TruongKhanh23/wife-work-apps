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
            multiple
            @change="handleFileUpload"
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
            {{ isLoading ? 'Processing...' : 'Upload File' }}
          </button>
        </div>

        <div class="flex gap-2 flex-wrap">
          <button
            @click="downloadTemplate"
            class="shadow-theme-xs flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Download sample file
          </button>
        </div>
      </div>

      <div
        class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10"
      >
        <div class="w-full max-w-[830px] flex flex-col gap-4">
          <h3 class="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
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
            <li>Nhấp đúp chuột để chạy file <code class="font-bold">convert_to_xls.bat</code>.</li>
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
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx-js-style'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const fileName = ref('')
const fileInput = ref(null)
const isLoading = ref(false)

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
  'DoiTuongCo',
  'NganHangNo',
  'NganHangCo',
  'CongViecCo',
  'MucCpCo',
  'ThamChieu',
]
const HIDDEN_COLS = [3, 6, 9, 10, 11, 12, 13, 14, 18, 20, 22, 23, 24, 25, 26, 27, 28, 30]
const DATE_COLS_FIXED = [1, 29] // B & AD
const TEXT_COL = 21
const MONEY_COL = 6

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
        '0',
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
          // Tính theo UTC midnight để tránh lệch timezone
          const excelEpoch = Date.UTC(1899, 11, 30) // "1899-12-30" UTC
          const utcDateMs = Date.UTC(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate())
          const excelSerialDate = Math.round((utcDateMs - excelEpoch) / (24 * 60 * 60 * 1000))

          ws[cellRef] = {
            t: 'n', // number (Excel date serial)
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

    // Các cell khác giữ nguyên
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

// --- Main ---
async function downloadTemplate() {
  try {
    const response = await fetch('/input.xlsx')
    if (!response.ok) throw new Error('Không tải được file mẫu')
    const blob = await response.blob()
    saveAs(blob, 'input.xlsx')
  } catch (error) {
    alert('❌ Lỗi tải file mẫu: ' + error.message)
  }
}

async function handleFileUpload(e) {
  isLoading.value = true;
  let files = Array.from(e.target.files || [])
  if (files.length === 0) return

  // validate tên file như cũ...
  const invalidFiles = files.filter((f) => !/^\d{2}\.\d{2}\.\d{4}\.(xlsx|xls)$/i.test(f.name))
  if (invalidFiles.length > 0) {
    alert(`❌ Tên file sai: \n${invalidFiles.map((f) => f.name).join('\n')}`)
    e.target.value = ''
    fileName.value = ''
    return
  }

  fileName.value = files.map((f) => f.name).join(', ')

  const zip = new JSZip()
  const allStoresData = {}

  // 👉 Sort files theo ngày
  function parseDateFromFileName(name) {
    const base = name.replace(/\.[^.]+$/, '')
    const parts = base.split('.')
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts.map(Number)
      return new Date(yyyy, mm - 1, dd)
    }
    return null
  }
  files = files.sort((a, b) => parseDateFromFileName(a.name) - parseDateFromFileName(b.name))

  let lastSoChungTuGlobal = null

  // Đọc từng file input (theo ngày đã sort)
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

      // 👉 Nếu chưa có store thì khởi tạo
      if (!allStoresData[storeName]) {
        // nếu là file đầu tiên → lấy từ cột 3, còn lại → kế thừa global
        const initSoChungTu = fileIdx === 0 ? Number(row[3]) || 0 : lastSoChungTuGlobal || 0
        allStoresData[storeName] = { slices: [], lastSoChungTu: initSoChungTu }
      }

      const blockSize = HEADERS.length
      for (let colStart = 4; colStart < row.length; colStart += blockSize) {
        const slice = createSheetDataSlice(
          row.slice(colStart, colStart + blockSize),
          dateColumnIndexes,
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
    const sheetData = [['SoChungTu', ...HEADERS]]

    let soChungTu = lastSoChungTu
    slices.forEach((slice) => {
      soChungTu++
      sheetData.push([soChungTu, ...slice])
    })

    data.finalSoChungTu = soChungTu
    lastSoChungTuGlobal = soChungTu // 👉 cập nhật cho file kế tiếp

    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    applyStyles(ws, sheetData)

    const newWb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(newWb, ws, 'Sheet1')
    zip.file(
      `${toSnakeCaseFileName(storeName)}.xlsx`,
      XLSX.write(newWb, { type: 'array', bookType: 'xlsx' }),
    )
  })

  // 👉 Sinh thêm file input đã cập nhật (cột 3 = SoChungTu cuối)
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
      XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }),
    )
  }

  // 👉 Đặt tên file zip theo logic ngày
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
        '0',
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
  isLoading.value = false;
}

// --- New: Download conversion tool ---
async function downloadConversionTool() {
  try {
    // Create a zip containing both BAT + PS1 files
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
</script>
