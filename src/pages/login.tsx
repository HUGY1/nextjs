import type { FC } from 'react'
import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  useAuthStore,
  selectIsAuthenticated,
  type LoginApiResponse,
  type LoginDataPublic,
} from '@/stores/authStore'
import styles from './login/login.module.css'

const LoginPage: FC = () => {
  const router = useRouter()
  const hydrated = useAuthStore((s) => s._hasHydrated)
  const sessionReady = useAuthStore((s) => s._sessionReady)
  const isAuthed = useAuthStore(selectIsAuthenticated)
  const setUserFromLogin = useAuthStore((s) => s.setUserFromLogin)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hydrated || !sessionReady) return
    if (isAuthed) {
      const next = typeof router.query.next === 'string' ? router.query.next : '/'
      router.replace(next.startsWith('/') ? next : '/')
    }
  }, [hydrated, sessionReady, isAuthed, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const json = (await res.json()) as LoginApiResponse

      if (!res.ok || json.success !== true || !json.data?.user) {
        const msg =
          (typeof json.error === 'string' && json.error) ||
          (typeof json.message === 'string' && json.message) ||
          '登录失败'
        setError(msg)
        return
      }

      setUserFromLogin(json.data as LoginDataPublic)
      const next = typeof router.query.next === 'string' ? router.query.next : '/'
      router.replace(next.startsWith('/') ? next : '/')
    } catch {
      setError('网络错误，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hydrated || !sessionReady) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p className={styles.muted}>加载中…</p>
        </div>
      </div>
    )
  }

  if (isAuthed) {
    return null
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>登录</h1>
        <p className={styles.subtitle}>使用账号密码进入 Todo</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            <span>账号</span>
            <input
              className={styles.input}
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="用户名"
              required
              disabled={submitting}
            />
          </label>
          <label className={styles.label}>
            <span>密码</span>
            <input
              className={styles.input}
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              required
              disabled={submitting}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? '登录中…' : '登录'}
          </button>
        </form>

        <p className={styles.hint}>
          登录请求由 BFF 代理至后端 <code>POST /login</code>；JWT 仅存 HttpOnly Cookie，前端不保存 token。
        </p>

        <Link href="/" className={styles.back}>
          返回首页
        </Link>
      </div>
    </div>
  )
}

export default LoginPage
