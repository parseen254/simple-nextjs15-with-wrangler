'use client'

import { useState, useCallback } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { EditTodoForm } from "./edit-todo-form"
import { formatDistanceToNow } from "date-fns"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { debounce } from "@/lib/utils"
import { 
  Search, 
  CalendarIcon, 
  Users, 
  Star, 
  CheckCircle2, 
  FilterX, 
  UserX, 
  StickerIcon,
  User,
  Clock,
  Pencil,
  Trash2
} from "lucide-react"
import { useTodos } from "@/context/todo-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Todo } from "@/db"

type PaginatedTodoListProps = {
  currentUserId: string | undefined
}

export function PaginatedTodoList({ currentUserId }: PaginatedTodoListProps) {
  const { todos, handleToggleTodo, handleDeleteTodo } = useTodos()
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [completionFilter, setCompletionFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState("10")
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const debouncedSearch = debounce(handleSearchChange, 300)

  // Check if the current user is the owner of a todo
  const isOwner = (todo: Todo) => {
    return currentUserId !== undefined && +currentUserId === todo.userId
  }

  // Generate unique users from todos using a Map to ensure uniqueness by userId
  const uniqueUsers = Array.from(
    todos.reduce((map, todo) => {
      if (!map.has(todo.userId)) {
        map.set(todo.userId, {
          id: todo.userId,
          name: todo.userName || todo.userEmail
        })
      }
      return map
    }, new Map()).values()
  )

  // Filter todos based on search term and filters
  const filteredTodos = todos.filter(todo => {
    const matchesSearch = 
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (todo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesDate = dateFilter === "all" ? true :
      dateFilter === "today" ? new Date(todo.createdAt).toDateString() === new Date().toDateString() :
      dateFilter === "week" ? new Date(todo.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) :
      dateFilter === "month" ? new Date(todo.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) :
      true

    const matchesUser = userFilter === "all" ? true : todo.userId === Number(userFilter)
    const matchesPriority = priorityFilter === "all" ? true : todo.priority === priorityFilter
    const matchesCompletion = completionFilter === "all" ? true :
      completionFilter === "completed" ? todo.completed :
      !todo.completed

    return matchesSearch && matchesDate && matchesUser && matchesPriority && matchesCompletion
  })

  // Pagination
  const totalItems = filteredTodos.length
  const totalPages = Math.ceil(totalItems / Number(pageSize))
  const startIndex = (currentPage - 1) * Number(pageSize)
  const endIndex = startIndex + Number(pageSize)
  const currentTodos = filteredTodos.slice(startIndex, endIndex)

  // Check if any filters are active
  const hasActiveFilters = dateFilter !== "all" || userFilter !== "all" || 
    priorityFilter !== "all" || completionFilter !== "all" || searchTerm !== ""

  if (todos.length === 0) {
    return (
      <Card className="w-full h-full">
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <StickerIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No todos yet</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first todo using the form on the right
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              onChange={debouncedSearch}
              placeholder="Search todos by title or description..."
              className="pl-10 pr-4 py-2 rounded-full"
              defaultValue={searchTerm}
            />
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <Select
                value={dateFilter}
                onValueChange={setDateFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <Select
                value={userFilter}
                onValueChange={setUserFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {uniqueUsers.length > 0 ? (
                    uniqueUsers.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 px-2 py-4 text-muted-foreground">
                      <UserX className="h-4 w-4" />
                      <span>No users found</span>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <Select
                value={priorityFilter}
                onValueChange={setPriorityFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <Select
                value={completionFilter}
                onValueChange={setCompletionFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset filters button */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateFilter("all")
                  setUserFilter("all")
                  setPriorityFilter("all")
                  setCompletionFilter("all")
                  setSearchTerm("")
                  setCurrentPage(1)
                }}
                className="gap-2"
              >
                <FilterX className="h-4 w-4" />
                Reset filters
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FilterX className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No matching todos</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-start gap-4 mb-2 md:mb-0">
                  <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={async (checked) => {
                      if (!isOwner(todo)) {
                        toast.error("You can only update your own todos")
                        return
                      }
                      try {
                        setIsUpdating(todo.id)
                        await handleToggleTodo(todo.id, checked as boolean)
                      } catch (error) {
                        // Error is handled in the context
                      } finally {
                        setIsUpdating(null)
                      }
                    }}
                    disabled={!isOwner(todo) || isUpdating === todo.id}
                    aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={cn(
                          todo.completed ? "line-through text-muted-foreground" : "font-medium",
                          "cursor-pointer"
                        )}
                      >
                        {todo.title}
                      </label>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        {
                          'bg-red-100 text-red-700': todo.priority === 'high',
                          'bg-yellow-100 text-yellow-700': todo.priority === 'medium',
                          'bg-green-100 text-green-700': todo.priority === 'low'
                        }
                      )}>
                        {todo.priority}
                      </span>
                    </div>
                    {todo.description && (
                      <p className="text-sm text-muted-foreground">
                        {todo.description}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground gap-3 mt-1">
                      <div className="flex items-center gap-1" title="Created by">
                        <User className="h-3 w-3" />
                        <span>{todo.userName || todo.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Created">
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
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit Todo</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Todo</DialogTitle>
                        <DialogDescription>
                          Make changes to your todo item below. Click save when you're done.
                        </DialogDescription>
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
                    variant="outline"
                    size="sm"
                    disabled={!isOwner(todo) || isDeleting === todo.id}
                    onClick={async () => {
                      if (!isOwner(todo)) {
                        toast.error("You can only delete your own todos")
                        return
                      }
                      try {
                        setIsDeleting(todo.id)
                        await handleDeleteTodo(todo.id)
                        toast.success("Todo deleted successfully")
                      } catch (error) {
                        toast.error("Failed to delete todo")
                      } finally {
                        setIsDeleting(null)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {filteredTodos.length > 0 && (
        <CardFooter>
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min(startIndex + 1, totalItems)} to {Math.min(endIndex, totalItems)} of {totalItems} todos
            </p>
            
            <div className="flex items-center gap-4">
              <Select
                value={pageSize}
                onValueChange={(value) => {
                  setPageSize(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-fit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}