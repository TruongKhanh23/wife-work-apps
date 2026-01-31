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

    // =========================
    // helpers
    // =========================
    const formatTime = (t) =>
      t
        ? new Date(t).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Ho_Chi_Minh',
          })
        : ''

    const createdOn = formatTime(order.times?.createdAt)
    const orderCompletedAt = order.times?.completedAt

    const pushRow = (meta, name, quantity, size = '', note = '') => {
      rows.push({
        ...meta,
        item_name: name,
        quantity,
        size,
        note,
      })
    }

    // =========================
    // 🔥 CORE PARSER (topping + size + combo)
    // =========================
    const parseItem = (item, meta) => {
      const baseQty = item.quantity || 1
      const groups = item.modifierGroups || []
      const originalName = item.name

      // =====================
      // COMBO
      // =====================
      const isCombo = groups.some((g) => /chọn ly/i.test(g.modifierGroupName))

      if (isCombo) {
        const comboGroups = groups.filter((g) => /chọn ly/i.test(g.modifierGroupName))

        comboGroups.forEach((comboGroup, idx) => {
          const lyNum = idx + 1

          const toppingGroup = groups.find((g) =>
            new RegExp(`Topping Ly ${lyNum}`, 'i').test(g.modifierGroupName),
          )

          const isUpsize = toppingGroup?.modifiers?.some((m) => /up\s*size/i.test(m.modifierName))

          const size = isUpsize ? 'L' : 'M'

          comboGroup.modifiers.forEach((m) =>
            pushRow(meta, m.modifierName, m.quantity * baseQty, size, originalName),
          )
        })

        return
      }

      // =====================
      // SIZE
      // =====================
      let name = item.name
      let size = ''

      const match = item.name.match(/^(.*)\(size\s*([ML])\)/i)

      if (match) {
        name = match[1].trim()
        size = match[2].toUpperCase()
      } else {
        const flat = groups.flatMap((g) => g.modifiers || [])
        const upsize = flat.find((m) => /size|up\s*size/i.test(m.modifierName))
        if (upsize) size = 'L'
      }

      // =====================
      // item chính
      // =====================
      pushRow(meta, name, baseQty, size)

      // =====================
      // 🔥 TOPPING
      // =====================
      groups.forEach((g) => {
        if (/topping/i.test(g.modifierGroupName)) {
          g.modifiers?.forEach((t) =>
            pushRow(meta, t.modifierName, t.quantity * baseQty, size, originalName),
          )
        }
      })
    }

    // =========================
    // unified bookings
    // =========================
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

    // =========================
    // main loop
    // =========================
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

      booking.items.forEach((item) => parseItem(item, meta))
    }

    return res.status(200).json({ rows })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed' })
  }
}
