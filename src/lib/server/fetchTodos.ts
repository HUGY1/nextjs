import type { GetServerSidePropsContext } from 'next'
import type { Todo } from '@/types/todo'
import {
  AUTH_ACCESS_TOKEN_COOKIE,
  AUTH_REFRESH_TOKEN_COOKIE,
  buildAccessTokenCookie,
  buildRefreshTokenCookie,
} from '@/lib/auth-cookie'
import { getBackendBase } from '@/lib/server/backend'
import { refreshTokensWithBackend } from '@/lib/server/refreshTokens'

const BASE = getBackendBase()

export type GetTodoResponse = { data: { items: Todo[] } }

/**
 * SSR 拉取 Todo：带 Cookie 中的 access；401 时用 refresh 换新 Cookie（写回响应 Set-Cookie）。
 */
export const fetchTodosForGssp = async (ctx: GetServerSidePropsContext): Promise<Todo[]> => {
  const { req, res } = ctx
  let access = req.cookies[AUTH_ACCESS_TOKEN_COOKIE]
  const refresh = req.cookies[AUTH_REFRESH_TOKEN_COOKIE]

  if (!access && !refresh) {
    throw new Error('NO_AUTH')
  }

  const fetchOnce = async (token: string) => {
    const url = `${BASE}/api/get-todo`
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': token,
      },
      body: JSON.stringify({ startIndex: 0, pageSize: 15 }),
      cache: 'no-store',
    })
  }

  let token = access || ''
  let r = token ? await fetchOnce(token) : ({ status: 401 } as Response)

  if (r.status === 401 && refresh) {
    const newTokens = await refreshTokensWithBackend(refresh)
    if (newTokens) {
      res.setHeader('Set-Cookie', [
        buildAccessTokenCookie(newTokens.accessToken, newTokens.expiresIn),
        buildRefreshTokenCookie(newTokens.refreshToken, newTokens.refreshIn),
      ])
      token = newTokens.accessToken
      r = await fetchOnce(token)
    }
  }

  if (r.status === 401 || r.status === 403) {
    throw new Error('UNAUTHORIZED')
  }

  if (!r.ok) {
    throw new Error(`get-todo failed: ${r.status}`)
  }

  const json = (await r.json()) as GetTodoResponse
  return json.data?.items ?? []
}
