// api/grab/get-orders-by-merchant-id.js

import axios from 'axios'

const BASE_HEADERS = {
  accept: 'application/json',
  origin: 'https://merchant.grab.com',
  referer: 'https://merchant.grab.com/',
  requestsource: 'troyPortal',
}

function toGrabTime(dateStr, hour, minute, second) {
  const pad = (n) => String(n).padStart(2, '0')

  let iso = dateStr

  // nếu là DD/MM/YYYY → convert
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/')
    iso = `${y}-${pad(m)}-${pad(d)}`
  }

  return `${iso}T${pad(hour)}:${pad(minute)}:${pad(second)}+07:00`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { cookie, merchantId, dateStr, startHour = 0, endHour = 23 } = req.body

    if (!cookie || !merchantId || !dateStr) {
      return res.status(400).json({
        message: 'cookie, merchantId, dateStr are required',
      })
    }

    const headers = {
      ...BASE_HEADERS,
      merchantId,
      cookie,
    }

    const url = 'https://api.grab.com/delvplatformapi/merchant/v1/reports/daily-pagination'

    const start = toGrabTime(dateStr, startHour, 0, 0)
    const end = toGrabTime(dateStr, endHour, 59, 59)

    let pageIndex = 0
    const pageSize = 150
    const orderIds = []
    let hasMore = true

    // pagination loop
    while (hasMore) {
      const params = {
        states: '',
        startTime: start,
        endTime: end,
        pageIndex,
        pageSize,
      }
      console.log('params', params)

      const response = await axios.get(url, { headers, params })

      const statements = response.data?.statements ?? []

      orderIds.push(...statements.map((s) => s.ID))

      hasMore = statements.length === pageSize
      pageIndex++
    }

    return res.status(200).json({
      total: orderIds.length,
      orderIds,
    })
  } catch (error) {
    console.error('Grab API error:', error?.response?.data || error.message)

    return res.status(500).json({
      message: 'Failed to fetch orders',
      error: error?.response?.data || error.message,
    })
  }
}
