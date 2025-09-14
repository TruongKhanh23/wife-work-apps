import ExcelJS from 'exceljs'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'
import axios from 'axios'

dayjs.extend(isSameOrBefore)

// ==== CONFIG API ==== //
const LOGIN_URL = 'https://gw.be.com.vn/api/v1/be-merchant-gateway/v2/merchant/login'
const STORE_URL =
  'https://gw.be.com.vn/api/v1/be-merchant-gateway/v2/merchant/get_stores_of_merchant'
const ORDER_URL =
  'https://gw.be.com.vn/api/v1/be-merchant-gateway/v2/merchant/get_restaurant_orders'

const OPERATOR_TOKEN = '0b28e008bc323838f5ec84f718ef11e6'
const USER_ID = 77550
const DEVICE_TYPE = 2

// ==== DATE RANGE ==== //
const START_DATE = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
const END_DATE = dayjs().format('YYYY-MM-DD')

function getDateRange(start, end) {
  const range = []
  let current = dayjs(start)
  const last = dayjs(end)
  while (current.isSameOrBefore(last)) {
    range.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }
  return range
}

// ==== API CALLS ==== //
async function login(account) {
  const body = {
    operator_token: OPERATOR_TOKEN,
    device_type: DEVICE_TYPE,
    access_token: 'PENDING',
    merchant_id: account.merchantId,
    email: account.account,
    password: account.password,
    device_token: '',
    device_name: '',
    locale: 'vi',
    remove_oldest_device: false,
    user_id: USER_ID,
  }
  const res = await axios.post(LOGIN_URL, body)
  return res.data.token
}

async function getStores(token, account) {
  const res = await axios.post(STORE_URL, {
    operator_token: OPERATOR_TOKEN,
    device_type: DEVICE_TYPE,
    access_token: token,
    merchant_id: account.merchantId,
    user_id: USER_ID,
    restaurant_id: 0,
    locale: 'vi',
    device_token: '',
  })
  return res.data?.data || []
}

async function fetchOrders(token, store_id, date, account) {
  const body = {
    operator_token: OPERATOR_TOKEN,
    device_type: DEVICE_TYPE,
    access_token: token,
    merchant_id: account.merchantId,
    start_date: date,
    end_date: date,
    limit: 100,
    page: 1,
    status_list: [],
    delivery_status_list: [],
    fetch_type: 'previous',
    user_id: USER_ID,
    restaurant_id: store_id,
    locale: 'vi',
    device_token: '',
  }
  const res = await axios.post(ORDER_URL, body)
  return res.data.restaurant_orders || []
}

// ==== MAIN EXPORT ==== //
export async function exportOrdersToExcel(accounts) {
  const dates = getDateRange(START_DATE, END_DATE)
  const zip = new JSZip()

  for (const account of accounts) {
    try {
      console.log(`🔑 [${account.branch}] Login...`)
      const token = await login(account)
      const stores = await getStores(token, account)

      // match store by tên chi nhánh
      const matchedStore = stores.find((s) =>
        s.store_name.toLowerCase().includes(account.branch.toLowerCase()),
      )
      if (!matchedStore) {
        console.warn(`⚠️ Không tìm thấy store cho: ${account.branch}`)
        continue
      }

      const store_id = matchedStore.store_id
      const workbook = new ExcelJS.Workbook()

      for (const date of dates) {
        console.log(`📦 [${account.branch}] Lấy đơn ngày ${date}`)
        const orders = await fetchOrders(token, store_id, date, account)

        const sheet = workbook.addWorksheet(date)
        sheet.columns = [
          { header: 'restaurant_id', key: 'restaurant_id', width: 15 },
          { header: 'order_id', key: 'order_id', width: 15 },
          { header: 'item_name', key: 'item_name', width: 30 },
          { header: 'quantity', key: 'quantity', width: 10 },
          { header: 'size', key: 'size', width: 15 },
        ]

        for (const order of orders) {
          for (const item of order.order_items || []) {
            let size = 'Không rõ'
            const customize = item.customize_object || ''
            const match = customize.match(/Size\s+(lớn|nhỏ)/i)
            if (match) size = match[1].toLowerCase()

            sheet.addRow({
              restaurant_id: store_id,
              order_id: order.order_id,
              item_name: item.item_name,
              quantity: item.quantity,
              size,
            })
          }
        }

        await new Promise((r) => setTimeout(r, 200)) // tránh bị rate limit
      }

      const buf = await workbook.xlsx.writeBuffer()
      zip.file(`${account.branch}.xlsx`, buf)
    } catch (err) {
      console.error(`❌ [${account.branch}] Lỗi:`, err.message)
    }
  }

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, 'be-orders.zip')
}
