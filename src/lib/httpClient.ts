/** 在发起 fetch 前修改 url / init */
export type HttpRequestInterceptor = (
  url: string,
  init: RequestInit
) => RequestInit | Promise<RequestInit>

/** 在收到 Response 后、解析 body 前处理（如统一 401） */
export type HttpResponseInterceptor = (
  response: Response,
  url: string,
  init: RequestInit
) => Response | Promise<Response>

/** 统一 POST：body 为对象，内部 JSON.stringify；不可传 method */
export type HttpRequestOptions = Omit<RequestInit, 'method' | 'body'> & {
  body: object
}

const getApiBase = (): string => {
  if (typeof window === 'undefined') {
    return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || ''
  }
  return process.env.NODE_ENV === 'development' ? '/' : process.env.NEXT_PUBLIC_API_URL || ''
}

/**
 * 统一 POST：走同源 BFF（/api/*），鉴权由 BFF 从 HttpOnly Cookie 注入 X-Access-Token。
 * `body` 传对象，内部 `JSON.stringify`；浏览器 `credentials: 'include'` 带 Cookie。
 */
export const request = async <T,>(path: string, options: HttpRequestOptions): Promise<T> => {
  const base = getApiBase()
  const url = base ? `${base.replace(/\/$/, '')}${path}` : path

  const { body, headers: headersInit, ...rest } = options
  const headers = new Headers(headersInit as HeadersInit)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const init: RequestInit = {
    ...rest,
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
  }

  const res = await fetch(url, init)

  if (!res.ok) {
    throw new Error(`API 请求失败: ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as T
}
