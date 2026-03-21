export const getBackendBase = (): string => {
  const u = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  return u.replace(/\/$/, '')
}

/** 后端刷新接口路径，默认 POST body `{ refreshToken }` */
export const getBackendRefreshPath = (): string =>
  process.env.BACKEND_REFRESH_PATH || '/refresh'

/** POST body `{ userId }`，见 BFF pages/api/user/get.ts */
export const getBackendUserPath = (): string =>
  process.env.BACKEND_USER_PATH || '/api/get-user'
