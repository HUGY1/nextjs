import { getBackendBase, getBackendRefreshPath } from '@/lib/server/backend'

export type RefreshedTokens = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  refreshIn: number
}

/**
 * 调用后端刷新 accessToken（refreshToken 仅服务端使用）。
 */
export const refreshTokensWithBackend = async (
  refreshToken: string
): Promise<RefreshedTokens | null> => {
  const BASE = getBackendBase()
  const path = getBackendRefreshPath().replace(/^\//, '')
  const url = `${BASE}/${path}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  })

  if (!res.ok) return null

  let json: unknown
  try {
    json = await res.json()
  } catch {
    return null
  }

  if (typeof json !== 'object' || json === null) return null
  const body = json as { success?: boolean; data?: Partial<RefreshedTokens> }
  const d = body.data
  if (!d?.accessToken) return null

  return {
    accessToken: d.accessToken,
    refreshToken: typeof d.refreshToken === 'string' ? d.refreshToken : refreshToken,
    expiresIn: typeof d.expiresIn === 'number' ? d.expiresIn : 3600,
    refreshIn: typeof d.refreshIn === 'number' ? d.refreshIn : 60 * 60 * 24 * 7,
  }
}
