'use client'

import type { FC, ReactNode } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore, selectIsAuthenticated } from '@/stores/authStore'

export type AuthRequireProps = {
  children: ReactNode
  /** 校验登录态前、或跳转中时展示（默认简短文案） */
  fallback?: ReactNode
  /**
   * SSR 已通过 HttpOnly Cookie 校验并下发数据时置 true：
   * hydration 前直接渲染 children，避免与 getServerSideProps 闪屏不一致。
   */
  serverAuthenticated?: boolean
}

/**
 * 客户端鉴权：persist + session 完成后再判断；未登录则 replace 到 `/login?next=当前路径`。
 */
export const AuthRequire: FC<AuthRequireProps> = ({
  children,
  fallback,
  serverAuthenticated = false,
}) => {
  const router = useRouter()
  const hydrated = useAuthStore((s) => s._hasHydrated)
  const sessionReady = useAuthStore((s) => s._sessionReady)
  const isAuthed = useAuthStore(selectIsAuthenticated)

  useEffect(() => {
    if (!hydrated || !sessionReady) return
    console.log('isAuthed', isAuthed)
    console.log('serverAuthenticated', serverAuthenticated)
    if (!isAuthed && !serverAuthenticated) {
      const path = router.asPath || '/'
      const next = encodeURIComponent(path.startsWith('/') ? path : `/${path}`)
      console.log('这里？？？')
      router.replace(`/login?next=${next}`)
    }
    // 勿依赖整个 router 对象：其引用常变会导致 effect 反复跑、重复 replace / 拉取 _next/data
  }, [hydrated, sessionReady, isAuthed, serverAuthenticated, router.asPath])

  if (!hydrated || !sessionReady) {
    return serverAuthenticated ? <>{children}</> : <></>
  }

  if (!isAuthed && !serverAuthenticated) {
    return <></>
  }

  return <>{children}</>
}

export default AuthRequire
