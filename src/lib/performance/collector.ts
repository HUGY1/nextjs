import { sendWithBeacon } from './beacon'
import { FLUSH_INTERVAL_MS } from './constants'
import { logPerf } from './logger'
import type { PerfMetricPayload, PerfReportBatch } from './types'

const buffer: PerfMetricPayload[] = []
let navigationSnapshot: PerfReportBatch['navigation'] | undefined
let flushTimer: ReturnType<typeof setTimeout> | null = null
let latestLcp: PerfMetricPayload | null = null
let clsScore = 0

const buildBatch = (): PerfReportBatch => {
  const metrics = [...buffer]
  if (latestLcp) metrics.push(latestLcp)
  if (clsScore > 0) {
    metrics.push({
      name: 'CLS',
      value: Math.round(clsScore * 1000) / 1000,
      rating:
        clsScore < 0.1 ? 'good' : clsScore < 0.25 ? 'needs-improvement' : 'poor',
    })
  }
  return {
    v: 1,
    kind: 'performance',
    page: typeof window !== 'undefined' ? window.location.href : '',
    collectedAt: new Date().toISOString(),
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    metrics,
    navigation: navigationSnapshot,
  }
}

const clearBufferState = () => {
  buffer.length = 0
  navigationSnapshot = undefined
  latestLcp = null
  clsScore = 0
}

export const readNavigationTiming = () => {
  if (typeof performance === 'undefined') return
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (!nav) return
  navigationSnapshot = {
    domContentLoaded: nav.domContentLoadedEventEnd,
    loadEventEnd: nav.loadEventEnd,
    transferSize: nav.transferSize,
    responseStart: nav.responseStart,
  }
  logPerf('采集 Navigation', navigationSnapshot)
}

export const flush = (endpoint: string) => {
  const hasBuffered = buffer.length > 0 || latestLcp !== null || clsScore > 0
  if (!hasBuffered && !navigationSnapshot) return
  const batch = buildBatch()
  const ok = sendWithBeacon(endpoint, batch)
  logPerf('上报批次', {
    reason: 'flush',
    endpoint,
    metricsCount: batch.metrics.length,
    metrics: batch.metrics,
    navigation: batch.navigation,
    sendBeacon: ok,
  })
  clearBufferState()
}

export const scheduleFlush = (endpoint: string) => {
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(() => {
    flushTimer = null
    flush(endpoint)
  }, FLUSH_INTERVAL_MS)
}

export const pushMetric = (endpoint: string, m: PerfMetricPayload) => {
  buffer.push(m)
  logPerf('采集指标', m)
  scheduleFlush(endpoint)
}

/** LCP：同一页面多次上报时只保留最后一次 */
export const setLatestLcpFromEntry = (entry: PerformanceEntry) => {
  const e = entry as PerformanceEntry & { element?: Element; id?: string; url?: string }
  latestLcp = {
    name: 'LCP',
    value: e.startTime,
    id: e.id ?? e.url,
    rating:
      e.startTime < 2500 ? 'good' : e.startTime < 4000 ? 'needs-improvement' : 'poor',
  }
  logPerf('采集 LCP（保留最后一次）', latestLcp)
}

/** layout-shift 累计（hadRecentInput 为 true 的条目不计入） */
export const accumulateLayoutShift = (endpoint: string, entry: PerformanceEntry) => {
  const e = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean }
  if (e.hadRecentInput) return
  if (typeof e.value !== 'number') return
  clsScore += e.value
  logPerf('采集 layout-shift（累计 CLS）', {
    delta: e.value,
    cls累计: Math.round(clsScore * 1000) / 1000,
  })
  scheduleFlush(endpoint)
}

export const clearFlushTimer = () => {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
}
