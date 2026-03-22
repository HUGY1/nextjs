import { LOG_PREFIX } from './constants'

/** 控制台日志前缀，可在 DevTools 中过滤 `[perf]` */
export const logPerf = (message: string, data?: unknown) => {
  if (typeof console === 'undefined' || !console.log) return
  if (data !== undefined) {
    console.log(LOG_PREFIX, message, data)
  } else {
    console.log(LOG_PREFIX, message)
  }
}
