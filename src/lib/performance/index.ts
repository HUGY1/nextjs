/**
 * 全局 Web 性能采集
 *
 * - PerformanceObserver：paint / LCP / CLS / FID
 * - navigator.sendBeacon 上报（页面关闭时仍尽量发出）
 * - 默认同源 `/api/performance/collect`（BFF 透传后端）
 * - 覆盖：`NEXT_PUBLIC_PERF_REPORT_URL` 或 `initPerformanceReporting({ endpoint })`
 * - `NEXT_PUBLIC_PERF_REPORT_URL` 设为空字符串则不注册 Observer
 */

import { DEFAULT_ENDPOINT } from './constants'
import {
  accumulateLayoutShift,
  clearFlushTimer,
  flush,
  pushMetric,
  readNavigationTiming,
  scheduleFlush,
  setLatestLcpFromEntry,
} from './collector'
import { logPerf } from './logger'
import type { InitPerformanceOptions } from './types'

export type { InitPerformanceOptions, PerfMetricPayload, PerfReportBatch } from './types'

/**
 * 初始化全局性能采集：注册各类 PerformanceObserver 与页面生命周期，通过 sendBeacon 上报。
 *
 * @returns 卸载函数：断开 Observer、移除监听、最后一次 flush
 */
export const initPerformanceReporting = (options?: InitPerformanceOptions): (() => void) => {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return () => {}
  }

  const endpoint = options?.endpoint ?? DEFAULT_ENDPOINT
  if (!endpoint) {
    logPerf(
      '上报地址为空（可设置 NEXT_PUBLIC_PERF_REPORT_URL，默认 /api/performance/collect），性能采集未启用',
    )
    return () => {}
  }

  logPerf('性能采集已启用', { endpoint })

  const observers: PerformanceObserver[] = []

  const safeObserve = (type: string, onEntry: (entry: PerformanceEntry) => void) => {
    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          onEntry(entry)
        }
      })
      po.observe({ type, buffered: true } as PerformanceObserverInit)
      observers.push(po)
    } catch {
      /* 不支持该 type 时跳过 */
    }
  }

  safeObserve('paint', (entry) => {
    logPerf('采集 paint', entry)
    pushMetric(endpoint, {
      name: entry.name,
      value: entry.startTime,
    })
  })

  safeObserve('navigation', (entry) => {
    logPerf('采集 navigation', entry)
    // pushMetric(endpoint, {
    //   name: entry.name,
    //   value: entry.startTime,
    // })
  })

  // safeObserve('resource', (entry) => {

  //   logPerf('采集 resource', entry)
  //   pushMetric(endpoint, {
  //     name: entry.name,
  //     value: entry.startTime,
  //   })
  // })

  safeObserve('largest-contentful-paint', (entry) => {
    setLatestLcpFromEntry(entry)
    scheduleFlush(endpoint)
  })

  safeObserve('layout-shift', (entry) => {
    accumulateLayoutShift(endpoint, entry)
  })

  safeObserve('first-input', (entry) => {
    const e = entry as PerformanceEventTiming
    const delay = e.processingStart - e.startTime
    pushMetric(endpoint, {
      name: 'FID',
      value: delay,
      rating: delay < 100 ? 'good' : delay < 300 ? 'needs-improvement' : 'poor',
    })
  })

  const onVisibilityOrPageHide = () => {
    flush(endpoint)
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      flush(endpoint)
    }
  }

  window.addEventListener('pagehide', onVisibilityOrPageHide)
  document.addEventListener('visibilitychange', onVisibilityChange)

  const onLoad = () => {
    if (options?.includeNavigation !== false) {
      readNavigationTiming()
      flush(endpoint)
    }
  }

  if (document.readyState === 'complete') {
    onLoad()
  } else {
    window.addEventListener('load', onLoad, { once: true })
  }

  return () => {
    observers.forEach((o) => {
      try {
        o.disconnect()
      } catch {
        /* ignore */
      }
    })
    window.removeEventListener('pagehide', onVisibilityOrPageHide)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    clearFlushTimer()
    flush(endpoint)
  }
}
