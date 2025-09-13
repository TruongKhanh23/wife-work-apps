<template>
  <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="px-4 py-4 sm:pl-6 sm:pr-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input ref="fileInput" type="file" accept=".xlsx,.xls" @change="handleFileUpload" class="hidden" />
          <input type="text" :value="fileName" placeholder="Upload File..." disabled
            class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]" />
          <button @click="$refs.fileInput.click()"
            class="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 sm:w-auto">
            Upload File
          </button>
        </div>
        <button @click="downloadTemplate"
          class="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-gray-500 shadow-theme-xs hover:bg-gray-600 sm:w-auto">
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

const fileName = ref('')
const fileInput = ref(null)

// --- Constants ---
const HEADERS = [
  'NgayChungTu', 'GhiChu', 'DoiTuong', 'TkNo', 'TkCo', 'SoTienNte', 'SoTien', 'DienGiai', 'NguoiGiaoDich', 'DiaChi', 'TienTe', 'TyGia', 'TkClear', 'DoiTuongNo', 'DoiTuongCo', 'NganHangNo', 'NganHangCo', 'CongViecNo', 'CongViecCo', 'MucCpNo', 'MucCpCo', 'SpNo', 'SpCo', 'MaHHNo', 'MaHHCo', 'MaExtra1', 'MaExtra2', 'DonViNhan', 'ThamChieu', 'NhanVien', ''
]

const EXTRA_DATE_HEADERS = ['NgayChungTu', 'ThamChieu']
const YELLOW_HEADERS = ['SoChungTu', 'NgayChungTu', 'GhiChu', 'TkNo', 'TkCo', 'SoTien', 'DienGiai', 'DoiTuongCo', 'NganHangNo', 'NganHangCo', 'CongViecCo', 'MucCpCo', 'ThamChieu']
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
    if (!isNaN(parsed.getTime())) return `${String(parsed.getDate()).padStart(2, '0')}/${String(parsed.getMonth() + 1).padStart(2, '0')}/${parsed.getFullYear()}`
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
  dateColumnIndexes.forEach(idx => {
    if (idx < slice.length && slice[idx] != null && slice[idx] !== '') {
      slice[idx] = excelDateToString(slice[idx])
    }
  })
  return slice
}

function applyStyles(ws, sheetData) {
  ws['!cols'] = ws['!cols'] || []
  sheetData[0].forEach((_, colIdx) => {
    const maxLength = Math.max(10, ...sheetData.map(r => (r[colIdx] != null ? String(r[colIdx]).length : 0))) + 2
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

  const thinBorder = { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin', color: { rgb: '000000' } }, left: { style: 'thin', color: { rgb: '000000' } }, right: { style: 'thin', color: { rgb: '000000' } } }

  for (let r = 0; r < sheetData.length; r++) {
    for (let c = 0; c < HEADERS.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c })
      if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '', s: {} }
      ws[cellRef].s = ws[cellRef].s || {}
      ws[cellRef].s.border = thinBorder
    }
  }

  for (let r = 1; r < sheetData.length; r++) {
    DATE_COLS_FIXED.forEach(c => {
      const cellRef = XLSX.utils.encode_cell({ r, c })
      const val = sheetData[r][c]
      if (val) {
        const parts = val.split('/').map(Number)
        if (parts.length === 3) {
          ws[cellRef] = {
            t: 's',
            v: `${String(parts[0]).padStart(2, '0')}/${String(parts[1]).padStart(2, '0')}/${parts[2]}`,
            s: {
              ...ws[cellRef]?.s,
              alignment: { horizontal: 'center' }
            }
          }
        }
      }
    })
    const textCellRef = XLSX.utils.encode_cell({ r, c: TEXT_COL })
    if (sheetData[r][TEXT_COL] != null) ws[textCellRef] = { t: 's', v: sheetData[r][TEXT_COL], s: ws[textCellRef]?.s || {} }
    const moneyCellRef = XLSX.utils.encode_cell({ r, c: MONEY_COL })
    const moneyValue = Number(sheetData[r][MONEY_COL])
    if (!isNaN(moneyValue)) ws[moneyCellRef] = { t: 'n', v: moneyValue, s: { ...ws[moneyCellRef]?.s, numFmt: '_(* #.##0_);_(* (#.##0);_(* "-"??_);_(@_)' } }
  }
}

// --- Main ---
async function downloadTemplate() {
  try {
    const response = await fetch('/input.xlsx')
    if (!response.ok) throw new Error('Không tải được file mẫu')
    const blob = await response.blob()
    saveAs(blob, 'input.xlsx')
  } catch (error) { alert('❌ Lỗi tải file mẫu: ' + error.message) }
}

async function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  fileName.value = file.name

  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data, { type: 'array' })
  const sheet = workbook.Sheets['SUMMARY']
  if (!sheet) return alert('❌ Không tìm thấy sheet SUMMARY')

  const rowsRaw = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(4)
  const zip = new JSZip()

  const dateColumnIndexes = HEADERS.reduce((acc, h, idx) => {
    const lower = (h || '').toLowerCase()
    const extrasLower = EXTRA_DATE_HEADERS.map(s => s.toLowerCase())
    if (lower.includes('ngay') || extrasLower.includes(lower)) acc.push(idx)
    return acc
  }, [])

  rowsRaw.forEach(row => {
    const storeName = row[1]
    if (!storeName) return

    const sheetData = [['SoChungTu', ...HEADERS]]
    let stt = 1
    const blockSize = HEADERS.length
    for (let colStart = 3; colStart < row.length; colStart += blockSize) {
      const slice = createSheetDataSlice(row.slice(colStart, colStart + blockSize), dateColumnIndexes)
      const moneyValue = slice[6]
      if (moneyValue != null && moneyValue !== '' && !isNaN(Number(moneyValue))) {
        sheetData.push([stt++, ...slice])
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    applyStyles(ws, sheetData)

    const newWb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(newWb, ws, 'Sheet1')
    zip.file(`${toSnakeCaseFileName(storeName)}.xlsx`, XLSX.write(newWb, { type: 'array', bookType: 'xlsx' }))
  })

  // 👉 Đặt tên file zip theo ngày hiện tại dd-mm-yyyy
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()
  const dateStr = `${dd}-${mm}-${yyyy}`

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `${dateStr}.zip`)
}

</script>
