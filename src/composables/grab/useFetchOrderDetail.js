import { ref } from 'vue'
import axios from 'axios'

export function useFetchOrderDetail() {
  const loading = ref(false)
  const error = ref(null)

  // ===============================
  // main function (CALL BACKEND API)
  // ===============================
  const fetchOrderDetail = async (orderId, merchantId, cookie, dateStr) => {
    loading.value = true
    error.value = null

    try {
      const res = await axios.post('/api/grab/get-order-details', {
        orderId,
        merchantId,
        cookie,
        dateStr,
      })

      // backend đã parse sẵn rows rồi
      return res.data.rows || []
    } catch (err) {
      error.value = err.message
      console.error(`❌ Lỗi với order ${orderId}:`, err)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchOrderDetail,
  }
}
