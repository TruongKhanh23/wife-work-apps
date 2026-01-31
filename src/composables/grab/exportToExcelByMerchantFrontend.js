import ExcelJS from 'exceljs'

function toSafeSheetName(dateStr) {
  const [d, m, y] = dateStr.split('/')
  return `${y}-${m}-${d}`.replace(/[\\/*?:[\]]/g, '_').slice(0, 31)
}

function normalizeRow(row) {
  const safe = {}

  for (const k in row) {
    const v = row[k]

    if (v === null || v === undefined) {
      safe[k] = ''
    } else if (v instanceof Date) {
      safe[k] = v
    } else if (typeof v === 'object') {
      safe[k] = JSON.stringify(v) // ⭐ QUAN TRỌNG
    } else {
      safe[k] = v
    }
  }

  return safe
}

export async function exportToExcelByMerchantFrontend(merchantName, newDataByDate) {
  const workbook = new ExcelJS.Workbook()

  for (const [dateStr, rows] of Object.entries(newDataByDate)) {
    console.log('rows', rows)
    const sheet = workbook.addWorksheet(toSafeSheetName(dateStr))

    sheet.columns = [
      { header: 'Merchant ID', key: 'merchantid', width: 25 },
      { header: 'Order ID', key: 'order_id', width: 30 },
      { header: 'Display ID', key: 'displayID', width: 15 },
      { header: 'Item Name', key: 'item_name', width: 30 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Size', key: 'size', width: 10 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Updated On', key: 'updatedOn', width: 20 },
      { header: 'Created On', key: 'createdOn', width: 20 },
      { header: 'Note', key: 'note', width: 40 },
    ]

    rows.forEach((row) => {
      sheet.addRow(normalizeRow(row))
    })
  }

  const buffer = await workbook.xlsx.writeBuffer()

  return new Blob([new Uint8Array(buffer)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
