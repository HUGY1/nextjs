import type { NextApiRequest, NextApiResponse } from 'next'
import {
  buildAccessTokenCookie,
  buildRefreshTokenCookie,
} from '@/lib/auth-cookie'
import type { LoginApiResponse, LoginData, LoginDataPublic } from '@/stores/authStore'

type Body = { username?: string; password?: string }

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const BASE = BACKEND_URL.replace(/\/$/, '')

/**
 * 代理 POST /login；成功时写入 access + refresh HttpOnly Cookie；响应体去掉 token，仅给前端 user 等字段。
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ success: false, error: 'Method Not Allowed' })
  }

  const body = req.body as Body
  const username = typeof body.username === 'string' ? body.username.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!username || !password) {
    return res.status(400).json({ success: false, error: '请输入账号和密码' })
  }

  const url = `${BASE}/login`

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    })

    const text = await upstream.text()
    let json: unknown
    try {
      json = text ? JSON.parse(text) : {}
    } catch {
      return res.status(upstream.status).send(text)
    }

    if (upstream.ok && typeof json === 'object' && json !== null) {
      const parsed = json as LoginApiResponse
      if (
        parsed.success &&
        parsed.data &&
        'accessToken' in parsed.data &&
        typeof (parsed.data as LoginData).accessToken === 'string'
      ) {
        const d = parsed.data as LoginData
        const accessMax = Math.max(d.expiresIn ?? 3600, 60)
        const refreshMax = Math.max(d.refreshIn ?? 60 * 60 * 24 * 7, 60)
        const cookies: string[] = [buildAccessTokenCookie(d.accessToken, accessMax)]
        if (d.refreshToken) {
          cookies.push(buildRefreshTokenCookie(d.refreshToken, refreshMax))
        }
        res.setHeader('Set-Cookie', cookies)

        const { accessToken, refreshToken, ...rest } = d
        parsed.data = rest as LoginDataPublic
      }
    }

    return res.status(upstream.status).json(json)
  } catch (err) {
    const msg = err instanceof Error ? err.message : '登录请求失败'
    console.error('[login proxy]', url, err)
    return res.status(502).json({
      success: false,
      error: msg,
      hint: '请检查 BACKEND_URL 与后端 /login 是否可达',
    })
  }
}

export default handler
