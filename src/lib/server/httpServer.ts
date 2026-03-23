import { getBackendBase } from "./backend"

/** 在发起 fetch 前修改 url / init */
export type HttpRequestInterceptor = (
  url: string,
  init: RequestInit
) => RequestInit | Promise<RequestInit>


/** 统一 POST：body 为对象，内部 JSON.stringify；不可传 method */
export type HttpRequestOptions = Omit<RequestInit, 'method' | 'body'> & {
  body?: object
}


const BASE = getBackendBase()


export const requestFromServer = async <T,>(path: string, params: Object,token:string): Promise<T> => {
  const url = `${BASE}${path}`

  const headers = new Headers()
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  headers.set('X-Access-Token', token)

  const init: RequestInit = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(params),
    credentials: 'include',
  }

  const res = await fetch(url, init)

  if (!res.ok) {
    throw new Error(`API 请求失败: ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as T
}
