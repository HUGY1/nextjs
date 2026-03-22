import type { PerfReportBatch } from './types'

/**
 * 使用 sendBeacon 发送 JSON（Blob 可带上 application/json，便于服务端解析）
 * @returns 是否成功加入浏览器发送队列（false 表示不支持或异常）
 */
export const sendWithBeacon = (endpoint: string, payload: PerfReportBatch): boolean => {
  if (!endpoint || typeof navigator === 'undefined' || !navigator.sendBeacon) {
    return false
  }
  try {
    const body = JSON.stringify(payload)
    const blob = new Blob([body], { type: 'application/json' })
    return navigator.sendBeacon(endpoint, blob)
  } catch {
    return false
  }
}
