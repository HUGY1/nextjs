'use client'

import type { FC } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { Todo } from '@/types/todo'
import { getTodoById } from '@/lib/api'
import { AuthRequire } from '@/components/AuthRequire'
import styles from './TodoDetail.module.css'

const formatTs = (ts?: number) => {
  if (ts == null || !Number.isFinite(ts)) return '—'
  const ms = ts < 1e12 ? ts * 1000 : ts
  return new Date(ms).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const TodoDetailPage: FC = () => {
  const router = useRouter()
  const todoId = typeof router.query.todoId === 'string' ? router.query.todoId : ''
  const [todo, setTodo] = useState<Todo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!router.isReady) return
    if (!todoId) {
      setLoading(false)
      setTodo(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getTodoById(todoId)
      .then((res) => {
        if (!cancelled) setTodo(res.data ?? null)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : String(e)
        if (msg.includes('404')) {
          setTodo(null)
          setError(null)
        } else {
          setError(msg)
          setTodo(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [router.isReady, todoId])

  const showNotFound = !loading && !error && router.isReady && todo === null

  return (
    <AuthRequire serverAuthenticated={false}>
      <div className={styles.wrap}>
        <div className={styles.container}>
          <Link href="/" prefetch={false} className={styles.back}>
            ← 返回待办列表
          </Link>

          {!router.isReady || loading ? (
            <div className={styles.stateBox}>
              <p className={styles.stateText}>加载中…</p>
            </div>
          ) : showNotFound ? (
            <div className={styles.stateBox}>
              <p className={styles.stateText}>未找到该待办</p>
              <Link href="/" prefetch={false} className={styles.backInline}>
                回到首页
              </Link>
            </div>
          ) : error ? (
            <div className={styles.stateBox}>
              <p className={styles.stateError}>{error}</p>
              <button
                type="button"
                className={styles.retryBtn}
                onClick={() => router.replace(router.asPath)}
              >
                重试
              </button>
            </div>
          ) : todo ? (
            <article className={styles.card}>
              <h1 className={styles.title}>{todo.value}</h1>
              <p className={styles.meta}>ID：{todo.id}</p>
              <div className={styles.row}>
                <span className={styles.label}>状态</span>
                <span className={styles.value}>
                  {todo.isCompleted ? (
                    <span className={styles.statusDone}>已完成</span>
                  ) : (
                    <span className={styles.statusActive}>未完成</span>
                  )}
                </span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>创建时间</span>
                <span className={styles.value}>{formatTs(todo.createdAt)}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>更新时间</span>
                <span className={styles.value}>{formatTs(todo.updatedAt)}</span>
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </AuthRequire>
  )
}

export default TodoDetailPage
