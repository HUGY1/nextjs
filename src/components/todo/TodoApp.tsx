'use client'

import type { FC } from 'react'
import { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { useTheme } from '@/components/ThemeProvider'
import { useAuthStore } from '@/stores/authStore'
import { useTodos } from '@/hooks/useTodos'
import type { Todo, FilterType } from '@/types/todo'
import TodoItem from './TodoItem'
import { IconPlus, IconSun, IconMoon, IconList } from '@/components/todo/icons'
import styles from './TodoApp.module.css'

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '未完成' },
  { key: 'completed', label: '已完成' },
]
interface TodoAppProps {
  initialTodos: Todo[]
  /** SSR 已拉取列表时跳过 useTodos 首次请求 */
  skipInitialFetch?: boolean
}

const TodoApp: FC<TodoAppProps> = ({ initialTodos, skipInitialFetch = false }) => {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const userName = useAuthStore((s) => s.user?.userName)
  const { theme, setTheme } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [inputValue, setInputValue] = useState('')

  const {
    addTodo,
    toggleTodo,
    deleteTodo,
    filtered,
    completedCount,
    totalCount,
    progress,
    loading,
    error,
    refetch,
  } = useTodos({
    initialTodos,
    skipInitialFetch,
  })

  const displayList = filtered(filter)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = inputValue.trim()
    if (value) {
      addTodo(value)
      setInputValue('')
      inputRef.current?.focus()
    }
  }

  if (loading && displayList.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Todo List</h1>
          </div>
          <div className={styles.statsCard}>
            <div className={styles.statsRow}>
              <span className={styles.statsLabel}>加载中…</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Todo List</h1>
          <div className={styles.headerActions}>
            {userName && (
              <span className={styles.userLabel} title={userName}>
                {userName}
              </span>
            )}
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                } finally {
                  logout()
                  router.replace('/login')
                }
              }}
            >
              退出
            </button>
            <button
              type="button"
              className={styles.themeBtn}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? '切换到夜间模式' : '切换到亮色模式'}
            >
              {theme === 'light' ? <IconSun /> : <IconMoon />}
            </button>
          </div>
        </header>

        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
            <button type="button" className={styles.retryBtn} onClick={() => refetch()}>
              重试
            </button>
          </div>
        )}

        <section className={styles.statsCard}>
          <div className={styles.statsRow}>
            <span className={styles.statsLabel}>完成度</span>
            <span className={styles.statsValue}>
              {completedCount} / {totalCount} · {progress}%
            </span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
          </div>
        </section>

        <div className={styles.filters}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`${styles.filterBtn} ${filter === f.key ? styles.active : ''}`}
              onClick={() => setFilter(f.key)}
            >
              <IconList />
              {f.label}
            </button>
          ))}
        </div>

        <div className={styles.inputCard}>
          <form onSubmit={handleSubmit} className={styles.inputRow}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder="添加新的待办…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              maxLength={200}
              autoFocus
            />
            <button type="submit" className={styles.addBtn}>
              <IconPlus />
              添加
            </button>
          </form>
        </div>

        <ul className={styles.list}>
          {displayList.length === 0 ? (
            <li className={styles.empty}>
              <IconList className={styles.emptyIcon} />
              {filter === 'all'
                ? '还没有待办，添加一条吧'
                : filter === 'active'
                  ? '没有未完成的项'
                  : '没有已完成的项'}
            </li>
          ) : (
            displayList.map((todo, i) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                style={{
                  animation: `slideIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.04}s both`,
                }}
              />
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

export default TodoApp
