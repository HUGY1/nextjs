export type Todo = {
  id: string
  value: string
  isCompleted: boolean
  /** 毫秒时间戳（若后端为秒需在前端换算） */
  createdAt?: number
  updatedAt?: number
}

export type FilterType = 'all' | 'active' | 'completed'
