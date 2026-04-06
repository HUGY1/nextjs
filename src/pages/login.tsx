import type { FC } from 'react'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  useAuthStore,
  type LoginDataPublic,
} from '@/stores/authStore'
import styles from './login/login.module.css'
import { request } from '@/lib/httpClient'
import { useBroadcastChannel } from '@/hooks/useBroadCastChannel'     

const LoginPage: FC = () => {
  const router = useRouter()
  const hydrated = useAuthStore((s) => s._hasHydrated)
  const sessionReady = useAuthStore((s) => s._sessionReady)
  const setUserFromLogin = useAuthStore((s) => s.setUserFromLogin)

  const { postMessage } = useBroadcastChannel()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)



  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await request<{ data: LoginDataPublic }>('/api/auth/login', {
        body: { username: username.trim(), password }
      })

      console.log('res', res)
      setUserFromLogin(res.data as LoginDataPublic)
      router.push('/')

      postMessage({ type: 'login' });
     

    } catch {
      setError('登录失败')
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

        <Link href="/" prefetch={false} className={styles.back}>
          返回首页
        </Link>
      </div>
    </div>
  )
}

export default LoginPage
