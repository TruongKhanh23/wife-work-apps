export default async function handler(req, res) {
  try {
    const { offset = 0, limit = 100, cookie } = req.body

    if (!cookie) {
      return res.status(400).json({
        message: 'Cookie is required',
      })
    }

    const url =
      `https://portal.grab.com/foodtroy/v1/VN/merchant-groups/catalog-stores` +
      `?offset=${offset}&limit=${limit}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        origin: 'https://merchant.grab.com',
        referer: 'https://merchant.grab.com/',
        requestsource: 'troyPortal',
        'user-agent': 'Mozilla/5.0',

        // 🔥 gắn cookie từ frontend
        Cookie: cookie,
      },
    })

    if (!response.ok) {
      throw new Error(`Grab API ${response.status}`)
    }

    const data = await response.json()

    res.status(200).json(data)
  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: 'Grab API failed',
      error: err.message,
    })
  }
}
