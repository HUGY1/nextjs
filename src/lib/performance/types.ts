/** 单条性能指标（随批次上报） */
export type PerfMetricPayload = {
  /** 指标名：如 first-paint、first-contentful-paint、LCP、CLS、FID */
  name: string
  /** 数值：耗时用毫秒（ms），CLS 为累计分数 */
  value: number
  /** 可选：Web Vitals 风格评级 good / needs-improvement / poor */
  rating?: string
  /** 可选：资源或元素标识（如 LCP 对应 url / id） */
  id?: string
}

/** 单次 sendBeacon 上报的完整载荷 */
export type PerfReportBatch = {
  v: 1
  kind: 'performance'
  page: string
  collectedAt: string
  ua: string
  metrics: PerfMetricPayload[]
  navigation?: {
    domContentLoaded?: number
    loadEventEnd?: number
    transferSize?: number
    responseStart?: number
  }
}

/** initPerformanceReporting 的可选参数 */
export type InitPerformanceOptions = {
  /** 上报完整 URL；不传则使用 NEXT_PUBLIC_PERF_REPORT_URL */
  endpoint?: string
  /** 是否在 load 后附带 navigation 摘要；默认 true */
  includeNavigation?: boolean
}
