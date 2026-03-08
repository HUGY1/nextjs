// app/page.tsx
import TodoApp from '@/components/TodoApp'
import * as api from '@/lib/api'

// 🔑 关键：强制动态渲染
// export const dynamic = 'force-dynamic'
// export const revalidate = 0 

export default async function Home() {


  const { data } = await api.getTodos()

  return <TodoApp initialTodos={data.items || []} />
}