/** HttpOnly Cookie 名，与 BFF / SSR 共用 */
export const AUTH_ACCESS_TOKEN_COOKIE = 'access_token'
export const AUTH_REFRESH_TOKEN_COOKIE = 'refresh_token'

const secureSuffix = () => (process.env.NODE_ENV === 'production' ? '; Secure' : '')

/** 服务端 Set-Cookie 行（HttpOnly + SameSite=Lax） */
export const buildAccessTokenCookie = (token: string, maxAgeSeconds: number) =>
  `${AUTH_ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${Math.max(maxAgeSeconds, 60)}; HttpOnly; SameSite=Lax${secureSuffix()}`

export const buildRefreshTokenCookie = (token: string, maxAgeSeconds: number) =>
  `${AUTH_REFRESH_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${Math.max(maxAgeSeconds, 60)}; HttpOnly; SameSite=Lax${secureSuffix()}`

export const buildClearAuthCookies = (): [string, string] => {
  const base = `Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secureSuffix()}`
  return [
    `${AUTH_ACCESS_TOKEN_COOKIE}=; ${base}`,
    `${AUTH_REFRESH_TOKEN_COOKIE}=; ${base}`,
  ]
}
