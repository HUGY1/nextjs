/**
 * BFF：POST /api/performance/collect → 后端性能上报接口（仅透传，Cookie 注入与刷新由 proxyApiToBackend 处理）
 */
import type { NextApiRequest, NextApiResponse } from 'next'
import { getBackendBase } from '@/lib/server/backend'
import { proxyApiToBackend } from '@/lib/bff/proxyUpstream'

const BASE = getBackendBase()

/** 后端路径，默认与 Next 路由对齐为 /api/performance/collect */
const UPSTREAM_PATH =
  process.env.BACKEND_PERF_COLLECT_PATH || '/performance-collect'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ success: false, error: 'Method Not Allowed' })
  }

  const url = `${BASE}${UPSTREAM_PATH.startsWith('/') ? '' : '/'}${UPSTREAM_PATH}`

  try {
    let body: string | undefined
    if (typeof req.body === 'string') body = req.body
    else if (req.body !== undefined && req.body !== null) body = JSON.stringify(req.body)

    const upstream = await proxyApiToBackend(req, res, url, {
      method: 'POST',
      body,
    })

    const data = await upstream.text()
    const ct = upstream.headers.get('content-type') || 'application/json'
    res.status(upstream.status).setHeader('Content-Type', ct).send(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[performance/collect]', url, err)
    res.status(502).json({
      error: msg,
      url,
      hint: '请检查 BACKEND_URL 与后端性能上报接口是否可达',
    })
  }
}

export default handler
