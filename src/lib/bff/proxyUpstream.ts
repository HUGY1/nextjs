import type { NextApiRequest, NextApiResponse } from 'next'
import {
  AUTH_ACCESS_TOKEN_COOKIE,
  AUTH_REFRESH_TOKEN_COOKIE,
  buildAccessTokenCookie,
  buildRefreshTokenCookie,
} from '@/lib/auth-cookie'
import { refreshTokensWithBackend } from '@/lib/server/refreshTokens'

// 不转发 content-length：BFF 常重写 body，沿用客户端 Content-Length 会导致上游读正文错位或 pending
const SKIP_HEADERS = new Set(['host', 'connection', 'cookie', 'x-access-token', 'content-length'])

/**
 * 浏览器请求仅带 Cookie；BFF 从 Cookie 取 accessToken 写入 X-Access-Token 再转发后端。
 * 401 时用 refreshToken 刷新后重试一次，并通过 Set-Cookie 写回新 JWT。
 *
 * 注意：入站常为 POST + Content-Length/Content-Type（JSON body），若上游为 GET 则**不得**转发这些头，
 * 也不得带 body，否则部分运行时/后端会一直等正文 → 请求 pending。
 */
export const proxyApiToBackend = async (
  req: NextApiRequest,
  res: NextApiResponse,
  upstreamUrl: string,
  init: { method: string; body?: string }
): Promise<Response> => {
  const upstreamMethod = init.method.toUpperCase()
  const upstreamIsBodyless = upstreamMethod === 'GET' || upstreamMethod === 'HEAD'

  const buildHeaders = (access: string | undefined): Headers => {
    const h = new Headers()
    for (const [k, v] of Object.entries(req.headers)) {
      const lk = k.toLowerCase()
      if (!v || SKIP_HEADERS.has(lk)) continue
      if (
        upstreamIsBodyless &&
        (lk === 'content-length' || lk === 'content-type' || lk === 'transfer-encoding')
      ) {
        continue
      }
      if (Array.isArray(v)) v.forEach((x) => h.append(k, x))
      else h.set(k, v)
    }
    if (access) h.set('X-Access-Token', access)
    return h
  }

  let access = req.cookies[AUTH_ACCESS_TOKEN_COOKIE]
  const refresh = req.cookies[AUTH_REFRESH_TOKEN_COOKIE]

  const doFetch = (token: string | undefined) => {
    const headers = buildHeaders(token)
    if (!upstreamIsBodyless && init.body !== undefined && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    const opts: RequestInit = {
      method: init.method,
      headers,
    }
    if (!upstreamIsBodyless && init.body !== undefined) {
      opts.body = init.body
    }
    return fetch(upstreamUrl, opts)
  }

  let upstream = await doFetch(access)

  if (upstream.status === 401 && refresh) {
    const newTokens = await refreshTokensWithBackend(refresh)
    if (newTokens) {
      res.setHeader('Set-Cookie', [
        buildAccessTokenCookie(newTokens.accessToken, newTokens.expiresIn),
        buildRefreshTokenCookie(newTokens.refreshToken, newTokens.refreshIn),
      ])
      access = newTokens.accessToken
      upstream = await doFetch(access)
    }
  }

  return upstream
}
