import type { Todo } from '@/types/todo'
import {
  request,
  type HttpRequestInterceptor,
  type HttpRequestOptions,
  type HttpResponseInterceptor,
} from '@/lib/httpClient'

export { request }
export type { HttpRequestInterceptor, HttpRequestOptions, HttpResponseInterceptor }

export const getTodos = async (): Promise<{ data: { items: Todo[] } }> => {
  return request<{ data: { items: Todo[] } }>('/api/get-todo', {
    body: { startIndex: 0, pageSize: 15 },
  })
}

/** 单条详情：经 BFF `POST /api/get-todo/:id` → 后端 `/api/get-todo/:id` */
export const getTodoById = async (id: string): Promise<{ data: Todo }> => {
  return request<{ data: Todo }>(`/api/get-detail/${encodeURIComponent(id)}`, {
    body: {},
  })
}

export const addTodo = async (
  value: string,
  isCompleted = false
): Promise<{ data: Todo }> => {
  return request<{ data: Todo }>('/api/add-todo', {
    body: { value, isCompleted },
  })
}

export const updateTodo = async (id: string | number): Promise<{ data: Todo }> => {
  return request<{ data: Todo }>(`/api/update-todo/${id}`, {
    body: {},
  })
}

export const deleteTodo = async (id: string | number): Promise<unknown> => {
  return request(`/api/del-todo/${id}`, {
    body: {},
  })
}
