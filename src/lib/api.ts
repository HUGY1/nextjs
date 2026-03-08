/**
 * Todo 后端 API 客户端
 */
import type { Todo,  } from '@/types/todo'

function getApiBase(): string {
  // 服务端环境
  if (typeof window === 'undefined') {
    return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || ''
  }
  // 客户端环境
  return process.env.NODE_ENV === 'development' ? '/' : process.env.NEXT_PUBLIC_API_URL || ''
}
const API_BASE =getApiBase()

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = API_BASE ? `${API_BASE.replace(/\/$/, '')}${path}` : path
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    throw new Error(`API 请求失败: ${res.status} ${res.statusText}`)
  }
  const data = await res.json()
  return data as T
}

export async function getTodos(): Promise<{ data: { items: Todo[] } }> {
  return request<{ data: { items: Todo[] } }>('/api/get-todo', {
    method: 'POST',
    body: JSON.stringify({ startIndex: 0, pageSize: 15 }),
    
  })

}

export async function addTodo(value: string, isCompleted = false): Promise<{ data: Todo }> {
  return request<{ data: Todo }>('/api/add-todo', {
    method: 'POST',
    body: JSON.stringify({ value, isCompleted }),
  })
}

export async function updateTodo(id: string | number): Promise<{ data: Todo }> {
  return request<{ data: Todo }>(`/api/update-todo/${id}`, {
    method: 'POST',
  })
}

export async function deleteTodo(id: string | number): Promise<unknown> {
  return request(`/api/del-todo/${id}`, {
    method: 'POST',
  })
}
