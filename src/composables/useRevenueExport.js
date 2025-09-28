import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx-js-style'
import JSZip from 'jszip'

// 👉 toàn bộ constants + helper functions + logic handleFileUpload, downloadTemplate, downloadConversionTool
export default function useRevenueExport({ fileName, isLoading }) {
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
        return `${String(parsed.getDate()).padStart(2, '0')}/${String(
          parsed.getMonth() + 1,
        ).padStart(2, '0')}/${parsed.getFullYear()}`
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
        Math.max(10, ...sheetData.map((r) => (r[colIdx] != null ? String(r[colIdx]).length : 0))) +
        2
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
    isLoading.value = true
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
    isLoading.value = false
  }
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

  return {
    handleFileUpload,
    downloadTemplate,
    downloadConversionTool,
  }
}
