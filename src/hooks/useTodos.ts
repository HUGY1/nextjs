'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Todo, FilterType } from '@/types/todo'
import * as api from '@/lib/api'

interface UseTodosParams {
  initialTodos?: Todo[]
  /** SSR 已拉取列表时跳过首次客户端请求，避免重复 */
  skipInitialFetch?: boolean
}

export const useTodos = (params: UseTodosParams) => {
  const { initialTodos = [], skipInitialFetch = false } = params
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [loading, setLoading] = useState(!skipInitialFetch)
  const [error, setError] = useState<string | null>(null)

  const fetchTodos = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await api.getTodos()
      const res = data.items
      setTodos(res)

      return res
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
      setTodos([])
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (skipInitialFetch) return
    fetchTodos()
  }, [fetchTodos, skipInitialFetch])

  const addTodo = useCallback(async (title: string) => {
    if (!title.trim()) return
    setError(null)
    try {
      const { data: created } = await api.addTodo(title.trim(), false)
      setTodos((prev) => [...prev, created])
    } catch (e) {
      setError(e instanceof Error ? e.message : '添加失败')
    }
  }, [])

  const toggleTodo = useCallback(async (id: string) => {
    setError(null)
    try {
      const { data: updated } = await api.updateTodo(id)

      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (e) {
      setError(e instanceof Error ? e.message : '更新失败')
    }
  }, [])

  const deleteTodo = useCallback(async (id: string) => {
    setError(null)
    try {
      await api.deleteTodo(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除失败')
    }
  }, [])

  const filtered = useCallback(
    (filter: FilterType): Todo[] => {
      switch (filter) {
        case 'active':
          return todos.filter((t) => !t.isCompleted)
        case 'completed':
          return todos.filter((t) => t.isCompleted)
        default:
          return todos
      }
    },
    [todos]
  )

  const completedCount = todos.filter((t) => t.isCompleted).length
  const totalCount = todos.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    fetchTodos,
    filtered,
    completedCount,
    totalCount,
    progress,
    loading,
    error,
    refetch: fetchTodos,
  }
}
