/** 默认同源 BFF，与 pages/api/performance/collect 一致 */
export const DEFAULT_ENDPOINT =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_PERF_REPORT_URL ?? '/api/performance/collect'
    : ''

/** 定时合并上报间隔（毫秒） */
export const FLUSH_INTERVAL_MS = 15_000

export const LOG_PREFIX = '[perf]'
