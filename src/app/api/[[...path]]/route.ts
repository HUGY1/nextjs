/**
 * API 代理：将 /api/* 转发到后端
 * 后端地址通过 BACKEND_URL 配置，默认 http://localhost:8080
 */
const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const BASE = BACKEND_URL.replace(/\/$/, '')

export async function GET(
  _req: Request,
  { params }: { params: { path?: string[] } }
) {
  return proxy(_req, params.path)
}

export async function POST(
  req: Request,
  { params }: { params: { path?: string[] } }
) {
  return proxy(req, params.path)
}

export async function PUT(
  req: Request,
  { params }: { params: { path?: string[] } }
) {
  return proxy(req, params.path)
}

export async function DELETE(
  req: Request,
  { params }: { params: { path?: string[] } }
) {
  return proxy(req, params.path)
}

async function proxy(req: Request, pathSegments?: string[]) {
  const path = pathSegments?.length ? pathSegments.join('/') : ''
  const url = `${BASE}/api/${path}`
  const method = req.method

  try {
    const headers = new Headers()
    req.headers.forEach((v, k) => {
      if (
        k.toLowerCase() !== 'host' &&
        k.toLowerCase() !== 'connection'
      ) {
        headers.set(k, v)
      }
    })

    const body = method !== 'GET' && method !== 'HEAD' ? await req.text() : undefined
    const res = await fetch(url, {
      method,
      headers,
      body,
    })

    const data = await res.text()
    const contentType = res.headers.get('content-type') || 'application/json'

    return new Response(data, {
      status: res.status,
      statusText: res.statusText,
      headers: {
        'Content-Type': contentType,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const cause = err instanceof Error && err.cause ? String(err.cause) : ''
    console.error('[API Proxy]', method, url, msg, cause || err)
    return new Response(
      JSON.stringify({
        error: msg,
        url,
        hint:
          'Next 与后端可能不在同一网络。若在容器/Devbox 中运行，请尝试 .env 设置 BACKEND_URL=http://host.docker.internal:8080 或宿主机 IP',
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
