import axios from 'axios'

const defaultBaseUrl = 'http://localhost:8080/api/v1'
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: configuredBaseUrl || defaultBaseUrl,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response && error.code === 'ERR_NETWORK') {
      const targetBaseUrl = error.config?.baseURL || configuredBaseUrl || defaultBaseUrl
      error.message = `Cannot reach backend API at ${targetBaseUrl}. Start the backend app or update VITE_API_BASE_URL.`
    }
    return Promise.reject(error)
  }
)

export default api
