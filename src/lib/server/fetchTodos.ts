import type { GetServerSidePropsContext } from 'next'
import type { Todo } from '@/types/todo'
import {
  AUTH_ACCESS_TOKEN_COOKIE,
  AUTH_REFRESH_TOKEN_COOKIE,
  buildAccessTokenCookie,
  buildRefreshTokenCookie,
} from '@/lib/auth-cookie'
import { getBackendBase } from '@/lib/server/backend'
import { requestFromServer } from '@/lib/server/httpServer'
import { refreshTokensWithBackend } from '@/lib/server/refreshTokens' 

const BASE = getBackendBase()

export type GetTodoResponse = { data: { items: Todo[] } }

export type FetchTodosForGsspOptions = {
  /** 列表分页大小，默认 15 */
  pageSize?: number
}

/**
 * SSR 拉取 Todo：带 Cookie 中的 access；401 时用 refresh 换新 Cookie（写回响应 Set-Cookie）。
 */
export const fetchTodosForGssp = async (
  ctx: GetServerSidePropsContext,
  options?: FetchTodosForGsspOptions
): Promise<Todo[]> => {
  const pageSize = options?.pageSize ?? 15

  const res = await requestFromServer<GetTodoResponse>('/api/get-list',
    { startIndex: 0, pageSize },
    ctx.req.cookies[AUTH_ACCESS_TOKEN_COOKIE] || ''
  )


  return res.data?.items ?? []
}
