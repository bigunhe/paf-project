import axios from 'axios'
import { TOKEN_KEY, API_ORIGIN } from './constants'

const api = axios.create({
  baseURL: `${API_ORIGIN}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const t = sessionStorage.getItem(TOKEN_KEY)
  if (t) {
    config.headers.Authorization = `Bearer ${t}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname
      if (!path.startsWith('/login') && path !== '/' && !path.startsWith('/auth/callback')) {
        sessionStorage.removeItem(TOKEN_KEY)
        window.location.assign('/login')
      }
    }
    return Promise.reject(err)
  },
)

export default api
