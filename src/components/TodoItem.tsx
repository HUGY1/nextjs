'use client'

import type { Todo } from '@/types/todo'
import { IconCheck, IconTrash, IconCircle, IconCheckCircle } from './icons'
import styles from './TodoItem.module.css'

type Props = {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  style?: React.CSSProperties
}

export default function TodoItem({ todo, onToggle, onDelete, style }: Props) {
  return (
    <li
      className={`${styles.item} ${todo.isCompleted ? styles.completed : ''}`}
      style={style}
      key={todo.id}
    >
      <button
        type="button"
        className={styles.checkBtn}
        onClick={() => onToggle(todo.id)}
        aria-label={todo.isCompleted ? '标记未完成' : '标记完成'}
      >
        {todo.isCompleted ? (
          <IconCheckCircle className={styles.checkIconDone} />
        ) : (
          <IconCircle className={styles.checkIcon} />
        )}
      </button>
      <span className={styles.title}>{todo.value}</span>
      <button
        type="button"
        className={styles.deleteBtn}
        onClick={() => onDelete(todo.id)}
        aria-label="删除"
      >
        <IconTrash />
      </button>
    </li>
  )
}
