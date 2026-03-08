export type Todo = {
  id: string
  value: string
  isCompleted: boolean
  createdAt?: number
}

export type FilterType = 'all' | 'active' | 'completed'
