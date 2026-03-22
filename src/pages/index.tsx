import type { FC } from 'react'
import type { GetServerSideProps } from 'next'
import type { Todo } from '@/types/todo'
import { fetchTodosForGssp } from '@/lib/server/fetchTodos'
import { AuthRequire } from '@/components/AuthRequire'
import TodoApp from '@/components/todo/TodoApp'

export type HomePageProps = {
  initialTodos: Todo[]
  /** SSR 已校验 Cookie 并拉到列表，用于 AuthRequire / 跳过首屏重复请求 */
  serverAuthenticated: boolean
}

const HomePage: FC<HomePageProps> = ({ initialTodos, serverAuthenticated }) => (
  <AuthRequire serverAuthenticated={serverAuthenticated}>
    <TodoApp initialTodos={initialTodos} skipInitialFetch={serverAuthenticated} />
  </AuthRequire>
)

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (ctx) => {
  const nextPath =
    typeof ctx.resolvedUrl === 'string' && ctx.resolvedUrl.length > 0 ? ctx.resolvedUrl : '/'

  try {
    const items = await fetchTodosForGssp(ctx)
    return {
      props: {
        initialTodos: items,
        serverAuthenticated: true,
      },
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg === 'NO_AUTH' || msg === 'UNAUTHORIZED') {
      return {
        redirect: {
          destination: `/login?next=${encodeURIComponent(nextPath)}`,
          permanent: false,
        },
      }
    }
    return {
      redirect: {
        destination: `/login?next=${encodeURIComponent(nextPath)}`,
        permanent: false,
      },
    }
  }
}

export default HomePage
