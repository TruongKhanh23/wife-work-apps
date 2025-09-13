<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
  >
    <div class="px-4 py-4 sm:pl-6 sm:pr-4">
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
            placeholder="Upload File..."
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
        <button
          @click="downloadTemplate"
          class="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-gray-500 shadow-theme-xs hover:bg-gray-600 sm:w-auto"
        >
          Tải file mẫu
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

async function downloadTemplate() {
  try {
    // Nếu file mẫu nằm ở public/input.xlsx, chỉ cần fetch
    const response = await fetch('/input.xlsx')
    if (!response.ok) throw new Error('Không tải được file mẫu')
    const blob = await response.blob()
    saveAs(blob, 'input.xlsx')
  } catch (error) {
    alert('❌ Lỗi tải file mẫu: ' + error.message)
  }
}

// Header cố định (B → AH)
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

// Chuyển Excel date thành dd/mm/yyyy
function excelDateToString(val) {
  if (val == null || val === '') return ''
  if (typeof val === 'number' && !isNaN(val)) {
    const d = XLSX.SSF.parse_date_code(val)
    if (d && d.y) {
      return `${String(d.d).padStart(2, '0')}/${String(d.m).padStart(2, '0')}/${d.y}`
    }
  }
  if (typeof val === 'string') {
    const iso = val.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
    const dm = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (dm) return val
    const parsed = new Date(val)
    if (!isNaN(parsed.getTime())) {
      return `${String(parsed.getDate()).padStart(2, '0')}/${String(parsed.getMonth() + 1).padStart(2, '0')}/${parsed.getFullYear()}`
    }
  }
  return val
}

// Xác định index cột cần format ngày
const dateColumnIndexes = HEADERS.reduce((acc, h, idx) => {
  const lower = (h || '').toLowerCase()
  const extrasLower = EXTRA_DATE_HEADERS.map((s) => s.toLowerCase())
  if (lower.includes('ngay') || extrasLower.includes(lower)) acc.push(idx)
  return acc
}, [])

// Tạo tên file snake_case không dấu
function toSnakeCaseFileName(name) {
  // 1. Chuyển về NFKD để tách dấu
  let str = name.normalize('NFKD')

  // 2. Bỏ dấu Latin
  str = str.replace(/[\u0300-\u036f]/g, '')

  // 3. Thay tất cả ký tự không phải a-z, A-Z, 0-9 thành _
  str = str.replace(/[^a-zA-Z0-9]+/g, '_')

  // 4. Chuyển về lowercase
  str = str.toLowerCase()

  // 5. Bỏ _ dư ở đầu và cuối
  str = str.replace(/^_+|_+$/g, '')

  return str
}

const fileName = ref('')
const fileInput = ref(null)

async function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  fileName.value = file.name

  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data, { type: 'array' })

  const sheet = workbook.Sheets['SUMMARY']
  if (!sheet) {
    alert('❌ Không tìm thấy sheet SUMMARY')
    return
  }

  const rowsRaw = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  const rows = rowsRaw.slice(4)

  const zip = new JSZip()

  rows.forEach((row) => {
    const storeName = row[1]
    if (!storeName) return

    const sheetData = []
    sheetData.push(['SoChungTu', ...HEADERS])

    const blockSize = HEADERS.length
    let stt = 1

    for (let colStart = 3; colStart < row.length; colStart += blockSize) {
      const slice = row.slice(colStart, colStart + blockSize)

      // Chuyển date trong slice thành dd/mm/yyyy
      dateColumnIndexes.forEach((dateIdx) => {
        if (dateIdx < slice.length) {
          const v = slice[dateIdx]
          if (v != null && v !== '') slice[dateIdx] = excelDateToString(v)
        }
      })

      // --- Chỉ push những dòng có SoTien ---
      const moneyValue = slice[6] // cột SoTien
      if (moneyValue != null && moneyValue !== '' && !isNaN(Number(moneyValue))) {
        sheetData.push([stt, ...slice])
        stt++
      }
    }

    const safeName = toSnakeCaseFileName(storeName)
    const ws = XLSX.utils.aoa_to_sheet(sheetData)

    // --- Các cột mặc định ẩn ---
    const hiddenColIndexes = [3, 6, 9, 10, 11, 12, 13, 14, 18, 20, 22, 23, 24, 25, 26, 27, 28, 30]

    // --- Auto fit column width + giữ hidden ---
    ws['!cols'] = ws['!cols'] || []
    sheetData[0].forEach((_, colIdx) => {
      const maxLength =
        Math.max(
          10,
          ...sheetData.map((row) => (row[colIdx] != null ? String(row[colIdx]).length : 0)),
        ) + 2 // padding

      ws['!cols'][colIdx] = ws['!cols'][colIdx] || {}
      ws['!cols'][colIdx].wch = maxLength

      if (hiddenColIndexes.includes(colIdx)) {
        ws['!cols'][colIdx].hidden = true
      }
    })

    // --- Header vàng ---
    const yellowHeaders = [
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
    sheetData[0].forEach((cellValue, colIdx) => {
      if (yellowHeaders.includes(cellValue)) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx })
        ws[cellRef].s = ws[cellRef].s || {}
        ws[cellRef].s.fill = { patternType: 'solid', fgColor: { rgb: 'FFFF00' } }
        ws[cellRef].s.font = { bold: true }
      }
    })

    // --- Định dạng các cột đặc biệt ---
    const dateCols = [1, 29] // B & AD
    const textCol = 21 // MucCpCo
    const moneyCol = 6 // SoTien

    for (let r = 1; r < sheetData.length; r++) {
      // Date
      dateCols.forEach((c) => {
        const cellRef = XLSX.utils.encode_cell({ r, c })
        const value = sheetData[r][c]
        if (value) {
          const parts = value.split('/').map(Number)
          if (parts.length === 3) {
            const d = new Date(parts[2], parts[1] - 1, parts[0])
            ws[cellRef] = { t: 'd', v: d, s: ws[cellRef]?.s || {} }
          }
        }
      })

      // MucCpCo -> Text
      const textCellRef = XLSX.utils.encode_cell({ r, c: textCol })
      if (sheetData[r][textCol] != null) {
        ws[textCellRef] = { t: 's', v: sheetData[r][textCol], s: ws[textCellRef]?.s || {} }
      }

      // SoTien -> Number custom format
      const moneyCellRef = XLSX.utils.encode_cell({ r, c: moneyCol })
      const moneyValue = Number(sheetData[r][moneyCol])
      if (!isNaN(moneyValue)) {
        ws[moneyCellRef] = {
          t: 'n',
          v: moneyValue,
          s: {
            ...ws[moneyCellRef]?.s,
            numFmt: '_(* #.##0_);_(* (#.##0);_(* "-"??_);_(@_)',
          },
        }
      }
    }

    // --- Border cho tất cả ô ---
    const thinBorder = {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } },
    }

    const totalRows = sheetData.length
    const totalCols = HEADERS.length

    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c })
        if (!ws[cellRef]) {
          ws[cellRef] = { t: 's', v: '', s: {} }
        }
        ws[cellRef].s = ws[cellRef].s || {}
        ws[cellRef].s.border = thinBorder
      }
    }

    // --- Tạo workbook ---
    const newWb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(newWb, ws, 'Sheet1')
    const wbout = XLSX.write(newWb, { type: 'array', bookType: 'xlsx' })
    zip.file(`${safeName}.xlsx`, wbout)
  })

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, 'processed_files.zip')
}
</script>
