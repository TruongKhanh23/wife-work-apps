import axios from 'axios'

const BASE_HEADERS = {
  accept: 'application/json',
  origin: 'https://merchant.grab.com',
  referer: 'https://merchant.grab.com/',
  requestsource: 'troyPortal',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { orderId, merchantId, cookie, dateStr } = req.body

    if (!orderId || !merchantId || !cookie) {
      return res.status(400).json({
        message: 'orderId, merchantId, cookie are required',
      })
    }

    const headers = {
      ...BASE_HEADERS,
      merchantId,
      cookie,
    }

    const url = `https://api.grab.com/food/merchant/v3/orders/${orderId}`

    const response = await axios.get(url, { headers })

    const order = response.data?.order

    if (!order || order.state !== 'COMPLETED') {
      return res.status(200).json({ rows: [] })
    }

    const rows = []

    const formatTime = (t) => (t ? new Date(t).toLocaleString('vi-VN') : '')

    const pushRow = (row) => rows.push(row)

    const createdOn = formatTime(order.times?.createdAt)
    const orderCompletedAt = order.times?.completedAt

    const bookings =
      order.orderBookings?.length > 0
        ? order.orderBookings.map((b) => ({
            displayID: b.shortOrderID,
            items: b.items?.items || [],
            completedAt: b.completedAt,
          }))
        : [
            {
              displayID: order.displayID,
              items: order.itemInfo?.items || [],
              completedAt: orderCompletedAt,
            },
          ]

    for (const booking of bookings) {
      const updatedOn = formatTime(booking.completedAt || orderCompletedAt)

      const meta = {
        merchantid: order.merchant?.ID,
        order_id: order.orderID,
        displayID: booking.displayID,
        date: dateStr,
        updatedOn,
        createdOn,
      }

      for (const item of booking.items) {
        pushRow({
          ...meta,
          item_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })
      }
    }

    return res.status(200).json({
      rows,
    })
  } catch (error) {
    console.error('Grab order detail error:', error?.response?.data || error.message)

    return res.status(500).json({
      message: 'Failed to fetch order detail',
      error: error?.response?.data || error.message,
    })
  }
}
