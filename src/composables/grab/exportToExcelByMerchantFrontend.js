import ExcelJS from 'exceljs'

function toSafeSheetName(dateStr) {
  const [d, m, y] = dateStr.split('/')
  return `${y}-${m}-${d}`
}

export async function exportToExcelByMerchantFrontend(merchantName, newDataByDate) {
  const workbook = new ExcelJS.Workbook()

  for (const [dateStr, rows] of Object.entries(newDataByDate)) {
    const safeSheetName = toSafeSheetName(dateStr)

    const sheet = workbook.addWorksheet(safeSheetName)

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

    rows.forEach((row) => sheet.addRow(row))
  }

  const buffer = await workbook.xlsx.writeBuffer()

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const url = window.URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${merchantName}.xlsx`
  a.click()

  window.URL.revokeObjectURL(url)
}
