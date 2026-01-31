import { ref } from 'vue'

export function useFetchOrderIds() {
  const loading = ref(false)
  const error = ref(null)
  const orderIds = ref([])

  const fetchOrderIds = async ({ cookie, merchantId, dateStr, startHour = 8, endHour = 23 }) => {
    loading.value = true
    error.value = null

    try {
      const res = await fetch('/api/grab/get-orders-by-merchant-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cookie,
          merchantId,
          dateStr,
          startHour,
          endHour,
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()

      // tuỳ API trả gì, sửa lại nếu cần
      orderIds.value = data?.orderIds || data || []

      return orderIds.value
    } catch (err) {
      error.value = err.message || 'Fetch failed'
      console.error('fetchOrderIds error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    orderIds,
    fetchOrderIds,
  }
}
