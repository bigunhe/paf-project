/** API origin (Spring Boot) — OAuth and non-/api routes use this. */
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080'

/** Google OAuth start URL (server-side flow). */
export const OAUTH_GOOGLE_URL = `${API_ORIGIN}/oauth2/authorization/google`

/** Stored JWT for Authorization: Bearer (Member 4). */
export const TOKEN_KEY = 'smartcampus_token'

/** Legacy seeded IDs — only used if VITE_DEV_AUTH_FALLBACK=true (optional). */
export const DEV_USER_ID = '64a1b9d0b2fc8e4b9a000001'
export const DEV_ADMIN_ID = '64a1b9d0b2fc8e4b9a000002'
