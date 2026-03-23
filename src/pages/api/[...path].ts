/**
 * BFF：/api/* → 后端 /api/*，从 HttpOnly Cookie 注入 X-Access-Token，401 时刷新 JWT 后重试。
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import { getBackendBase } from '@/lib/server/backend'
import { proxyApiToBackend } from '@/lib/bff/proxyUpstream'

// export const runtime = 'edge'

const BASE = getBackendBase()

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const segments = req.query.path
  const pathArr = Array.isArray(segments) ? segments : segments ? [segments] : []
  const path = pathArr.length ? pathArr.join('/') : ''
  const url = `${BASE}/api/${path}`

  try {
    let body: string | undefined
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (typeof req.body === 'string') body = req.body
      else if (req.body !== undefined && req.body !== null) body = JSON.stringify(req.body)
    }

    const upstream = await proxyApiToBackend(req, res, url, {
      method: req.method || 'GET',
      body,
    })

    const data = await upstream.text()
    const ct = upstream.headers.get('content-type') || 'application/json'
    res.status(upstream.status).setHeader('Content-Type', ct).send(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[BFF]', req.method, url, err)
    res.status(502).json({
      error: msg,
      url,
      hint: '请检查 BACKEND_URL 与后端是否可达',
    })
  }
}

export default handler
