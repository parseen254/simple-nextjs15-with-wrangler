'use client'

import { deleteTodo, toggleTodo } from "@/app/todos/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Todo } from "@/db"
import { toast } from "sonner"
import { EditTodoForm } from "./edit-todo-form"
import { useState } from "react"

type TodoListProps = {
  todos: Todo[]
}

export function TodoList({ todos }: TodoListProps) {
  const [open, setOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)

  return (
    <Card className="w-full h-full">
      <CardHeader className="sticky top-0 bg-card z-10 border-b">
        <CardTitle>Todo List</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
        {todos.length === 0 ? (
          <p className="text-center text-muted-foreground">No todos yet. Add one using the form.</p>
        ) : (
          <div className="space-y-4">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={async (checked) => {
                      try {
                        await toggleTodo(todo.id, checked as boolean)
                        toast.success('Todo updated')
                      } catch (error) {
                        toast.error('Failed to update todo')
                      }
                    }}
                  />
                  <div>
                    <p className={todo.completed ? "line-through text-muted-foreground" : ""}>
                      {todo.title}
                    </p>
                    {todo.description && (
                      <p className="text-sm text-muted-foreground">
                        {todo.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm px-2 py-1 rounded ${
                    todo.priority === 'high' 
                      ? 'bg-red-100 text-red-700' 
                      : todo.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {todo.priority}
                  </span>
                  <Dialog open={open && selectedTodo?.id === todo.id} onOpenChange={(isOpen) => {
                    setOpen(isOpen)
                    if (!isOpen) setSelectedTodo(null)
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedTodo(todo)
                          setOpen(true)
                        }}
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
                          todo={selectedTodo} 
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
                      try {
                        await deleteTodo(todo.id)
                        toast.success('Todo deleted')
                      } catch (error) {
                        toast.error('Failed to delete todo')
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}