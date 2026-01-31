import { ref } from 'vue'

// GET
// await callApi({
//   endpoint: '/api/users',
// })

// POST
// await callApi({
//   endpoint: '/api/users',
//   method: 'POST',
//   params: { name: 'John' },
// })

// custom header
// await callApi({
//   endpoint: '/api/private',
//   headers: { Authorization: 'Bearer token' }
// })

export function useApi() {
  const loading = ref(false)
  const error = ref(null)

  const callApi = async ({ endpoint, method = 'GET', params = null, headers = {} }) => {
    loading.value = true
    error.value = null

    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }

      if (params) {
        options.body = JSON.stringify(params)
      }

      const res = await fetch(endpoint, options)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      return await res.json()
    } catch (err) {
      error.value = err
      console.error('API error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    callApi,
    loading,
    error,
  }
}
