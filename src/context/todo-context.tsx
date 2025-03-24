'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { Todo } from '@/db'
import { addTodo, deleteTodo, toggleTodo, updateTodo } from '@/app/todos/actions'
import { toast } from 'sonner'

// Enhanced Todo type with user information
export type EnhancedTodo = {
  id: number
  title: string
  description: string | null
  priority: string
  completed: boolean
  createdAt: Date
  userId: number
  userName: string | null
  userEmail: string
}

type TodoState = {
  todos: EnhancedTodo[]
}

type TodoAction = 
  | { type: 'SET_TODOS'; payload: EnhancedTodo[] }
  | { type: 'ADD_TODO'; payload: EnhancedTodo }
  | { type: 'UPDATE_TODO'; payload: EnhancedTodo }
  | { type: 'TOGGLE_TODO'; payload: { id: number; completed: boolean } }
  | { type: 'DELETE_TODO'; payload: number }

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
      return { todos: action.payload }
    case 'ADD_TODO':
      return { todos: [...state.todos, action.payload] }
    case 'UPDATE_TODO':
      return {
        todos: state.todos.map(todo => 
          todo.id === action.payload.id ? action.payload : todo
        )
      }
    case 'TOGGLE_TODO':
      return {
        todos: state.todos.map(todo => 
          todo.id === action.payload.id 
            ? { ...todo, completed: action.payload.completed }
            : todo
        )
      }
    case 'DELETE_TODO':
      return {
        todos: state.todos.filter(todo => todo.id !== action.payload)
      }
    default:
      return state
  }
}

export function TodoProvider({ children, initialTodos = [] }: { 
  children: React.ReactNode
  initialTodos?: EnhancedTodo[]
}) {
  const [state, dispatch] = useReducer(todoReducer, { todos: initialTodos })

  const setInitialTodos = useCallback((todos: EnhancedTodo[]) => {
    dispatch({ type: 'SET_TODOS', payload: todos })
  }, [])

  const handleAddTodo = async (formData: FormData) => {
    try {
      const response = await addTodo(formData)
      if (response) {
        dispatch({ type: 'ADD_TODO', payload: response })
        toast.success('Todo added successfully')
      }
    } catch (error) {
      toast.error('Failed to add todo')
    }
  }

  const handleUpdateTodo = async (id: number, formData: FormData) => {
    try {
      const response = await updateTodo(id, formData)
      if (response) {
        dispatch({ type: 'UPDATE_TODO', payload: response })
        toast.success('Todo updated successfully')
      }
    } catch (error) {
      toast.error('Failed to update todo')
    }
  }

  const handleToggleTodo = async (id: number, completed: boolean) => {
    try {
      const response = await toggleTodo(id, completed)
      if (response) {
        dispatch({ type: 'TOGGLE_TODO', payload: { id, completed } })
        toast.success('Todo updated successfully')
      }
    } catch (error) {
      toast.error('Failed to update todo')
    }
  }

  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodo(id)
      dispatch({ type: 'DELETE_TODO', payload: id })
      toast.success('Todo deleted successfully')
    } catch (error) {
      toast.error('Failed to delete todo')
    }
  }

  const value = {
    todos: state.todos,
    setInitialTodos,
    handleAddTodo,
    handleUpdateTodo,
    handleToggleTodo,
    handleDeleteTodo
  }

  return (
    <TodoContext.Provider value={value}>
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