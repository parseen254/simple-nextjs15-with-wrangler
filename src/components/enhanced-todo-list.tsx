'use client'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EditTodoForm } from "./edit-todo-form"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { User, Clock } from "lucide-react"
import { Todo } from "@/db"
import { useTodos, EnhancedTodo } from "@/context/todo-context"
import { toast } from "sonner"

type EnhancedTodoListProps = {
  todos: EnhancedTodo[]
  currentUserId: string | undefined
}

export function EnhancedTodoList({ todos, currentUserId }: EnhancedTodoListProps) {
  const { handleToggleTodo, handleDeleteTodo } = useTodos()
  const [open, setOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<EnhancedTodo | null>(null)
  
  // Check if the current user is the owner of a todo
  const isOwner = (todo: EnhancedTodo) => {
    return currentUserId !== undefined && +currentUserId === todo.userId
  }
  
  // Convert EnhancedTodo to regular Todo for EditTodoForm
  const convertToTodo = (enhancedTodo: EnhancedTodo): Todo => {
    return {
      id: enhancedTodo.id,
      title: enhancedTodo.title,
      description: enhancedTodo.description,
      priority: enhancedTodo.priority as "low" | "medium" | "high",
      completed: enhancedTodo.completed,
      userId: enhancedTodo.userId,
      createdAt: enhancedTodo.createdAt,
      updatedAt: new Date() // Using current date as updatedAt since it's not in our enhanced todo
    }
  }
  
  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-start gap-4 mb-2 md:mb-0">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={async (checked) => {
                if (!isOwner(todo)) {
                  toast.error("You can only update your own todos")
                  return
                }
                await handleToggleTodo(todo.id, checked as boolean)
              }}
              disabled={!isOwner(todo)}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className={todo.completed ? "line-through text-muted-foreground" : "font-medium"}>
                  {todo.title}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  todo.priority === 'high' 
                    ? 'bg-red-100 text-red-700' 
                    : todo.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {todo.priority}
                </span>
              </div>
              {todo.description && (
                <p className="text-sm text-muted-foreground">
                  {todo.description}
                </p>
              )}
              <div className="flex items-center text-xs text-muted-foreground gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{todo.userName || todo.userEmail}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(todo.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto">
            <Dialog open={open && selectedTodo?.id === todo.id} onOpenChange={(isOpen) => {
              setOpen(isOpen)
              if (!isOpen) setSelectedTodo(null)
            }}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (!isOwner(todo)) {
                      toast.error("You can only edit your own todos")
                      return
                    }
                    setSelectedTodo(todo)
                    setOpen(true)
                  }}
                  disabled={!isOwner(todo)}
                >
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Todo</DialogTitle>
                </DialogHeader>
                {selectedTodo && (
                  <EditTodoForm 
                    todo={convertToTodo(selectedTodo)} 
                    onClose={() => {
                      setOpen(false)
                      setSelectedTodo(null)
                    }} 
                  />
                )}
              </DialogContent>
            </Dialog>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (!isOwner(todo)) {
                  toast.error("You can only delete your own todos")
                  return
                }
                await handleDeleteTodo(todo.id)
              }}
              disabled={!isOwner(todo)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}