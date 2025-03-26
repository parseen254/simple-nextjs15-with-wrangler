'use client'

import { createContext, useContext, useReducer, type ReactNode } from 'react'
import { addTodo, deleteTodo, toggleTodo, updateTodo } from '@/app/todos/actions'
import { toast } from 'sonner'
import type { Todo } from '@/db'

export type EnhancedTodo = Todo & {
  userName: string | null
  userEmail: string | null
}

type TodoState = {
  todos: EnhancedTodo[]
}

type TodoAction =
  | { type: 'SET_TODOS'; payload: EnhancedTodo[] }
  | { type: 'ADD_TODO'; payload: EnhancedTodo }
  | { type: 'UPDATE_TODO'; payload: EnhancedTodo }
  | { type: 'DELETE_TODO'; payload: number }
  | { type: 'TOGGLE_TODO'; payload: { id: number; completed: boolean } }

type TodoContextType = {
  todos: EnhancedTodo[]
  setInitialTodos: (todos: EnhancedTodo[]) => void
  handleAddTodo: (formData: FormData) => Promise<void>
  handleUpdateTodo: (id: number, formData: FormData) => Promise<void>
  handleToggleTodo: (id: number, completed: boolean) => Promise<void>
  handleDeleteTodo: (id: number) => Promise<void>
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'SET_TODOS':
      return {
        ...state,
        todos: action.payload,
      }
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, action.payload],
      }
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id ? action.payload : todo
        ),
      }
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      }
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, completed: action.payload.completed }
            : todo
        ),
      }
    default:
      return state
  }
}

export function TodoProvider({ children, initialTodos = [] }: { 
  children: ReactNode
  initialTodos?: EnhancedTodo[]
}) {
  const [state, dispatch] = useReducer(todoReducer, { todos: initialTodos })

  const setInitialTodos = (todos: EnhancedTodo[]) => {
    dispatch({ type: 'SET_TODOS', payload: todos })
  }

  const handleAddTodo = async (formData: FormData) => {
    try {
      const response = await addTodo(formData)
      if (response) {
        dispatch({ type: 'ADD_TODO', payload: response })
        toast.success('Todo added successfully')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add todo')
      throw error
    }
  }

  const handleUpdateTodo = async (id: number, formData: FormData) => {
    try {
      // Optimistically update the todo
      const title = formData.get('title') as string
      const description = formData.get('description') as string
      const priority = formData.get('priority') as Todo['priority']
      const optimisticTodo = state.todos.find(t => t.id === id)
      
      if (optimisticTodo) {
        const updatedTodo = { 
          ...optimisticTodo, 
          title, 
          description, 
          priority,
          updatedAt: new Date()
        }
        dispatch({ type: 'UPDATE_TODO', payload: updatedTodo })
      }

      const response = await updateTodo(id, formData)
      if (response) {
        dispatch({ type: 'UPDATE_TODO', payload: response })
        toast.success('Todo updated successfully')
      }
    } catch (error) {
      // Revert optimistic update on error
      const originalTodo = state.todos.find(t => t.id === id)
      if (originalTodo) {
        dispatch({ type: 'UPDATE_TODO', payload: originalTodo })
      }
      toast.error(error instanceof Error ? error.message : 'Failed to update todo')
      throw error
    }
  }

  const handleToggleTodo = async (id: number, completed: boolean) => {
    try {
      // Optimistically update the todo
      dispatch({ type: 'TOGGLE_TODO', payload: { id, completed } })

      const response = await toggleTodo(id, completed)
      if (response) {
        dispatch({ type: 'UPDATE_TODO', payload: response })
        toast.success('Todo updated successfully')
      }
    } catch (error) {
      // Revert optimistic update on error
      dispatch({ type: 'TOGGLE_TODO', payload: { id, completed: !completed } })
      toast.error(error instanceof Error ? error.message : 'Failed to update todo')
      throw error
    }
  }

  const handleDeleteTodo = async (id: number) => {
    try {
      // Optimistically remove the todo
      dispatch({ type: 'DELETE_TODO', payload: id })

      await deleteTodo(id)
      toast.success('Todo deleted successfully')
    } catch (error) {
      // Recover the todo on error
      const todoToRecover = state.todos.find(t => t.id === id)
      if (todoToRecover) {
        dispatch({ type: 'ADD_TODO', payload: todoToRecover })
      }
      toast.error(error instanceof Error ? error.message : 'Failed to delete todo')
      throw error
    }
  }

  return (
    <TodoContext.Provider
      value={{
        todos: state.todos,
        setInitialTodos,
        handleAddTodo,
        handleUpdateTodo,
        handleToggleTodo,
        handleDeleteTodo,
      }}
    >
      {children}
    </TodoContext.Provider>
  )
}

export function useTodos() {
  const context = useContext(TodoContext)
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider')
  }
  return context
}