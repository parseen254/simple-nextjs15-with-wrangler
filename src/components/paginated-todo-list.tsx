'use client'

import { useState, useEffect, useCallback } from "react"
import { Todo } from "@/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { debounce } from "@/lib/utils"
import { Search, CalendarIcon, Users, Star, CheckCircle2 } from "lucide-react"
import { EnhancedTodoList } from "./enhanced-todo-list"

// Define the enhanced todo type with user information
type EnhancedTodo = {
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

type PaginatedTodoListProps = {
  todos: EnhancedTodo[]
  currentUserId: string | undefined
}

export function PaginatedTodoList({ todos, currentUserId }: PaginatedTodoListProps) {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTodos, setFilteredTodos] = useState<EnhancedTodo[]>(todos)
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [completionFilter, setCompletionFilter] = useState<string>("all")
  const [userFilter, setUserFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTodos.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTodos.length / itemsPerPage)
  
  // Get unique users for the filter
  const uniqueUsers = Array.from(new Set(todos.map(todo => todo.userId)))
    .map(userId => {
      const todo = todos.find(t => t.userId === userId)
      return {
        id: userId,
        name: todo?.userName || todo?.userEmail
      }
    })
  
  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      filterTodos(term, priorityFilter, completionFilter, userFilter, dateFilter)
    }, 300),
    [priorityFilter, completionFilter, userFilter, dateFilter]
  )
  
  // Filter todos based on search term and filters
  const filterTodos = (
    term: string,
    priority: string,
    completion: string,
    user: string,
    date: string
  ) => {
    let filtered = [...todos]
    
    // Search term filter
    if (term) {
      const lowerTerm = term.toLowerCase()
      filtered = filtered.filter(
        todo => 
          todo.title.toLowerCase().includes(lowerTerm) || 
          (todo.description && todo.description.toLowerCase().includes(lowerTerm))
      )
    }
    
    // Priority filter
    if (priority !== "all") {
      filtered = filtered.filter(todo => todo.priority === priority)
    }
    
    // Completion filter
    if (completion !== "all") {
      filtered = filtered.filter(todo => 
        completion === "completed" ? todo.completed : !todo.completed
      )
    }
    
    // User filter
    if (user !== "all") {
      filtered = filtered.filter(todo => todo.userId === parseInt(user))
    }
    
    // Date filter
    if (date !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      if (date === "today") {
        filtered = filtered.filter(todo => {
          const todoDate = new Date(todo.createdAt)
          return todoDate >= today && todoDate < new Date(today.getTime() + 86400000)
        })
      } else if (date === "week") {
        const weekAgo = new Date(today.getTime() - 7 * 86400000)
        filtered = filtered.filter(todo => {
          const todoDate = new Date(todo.createdAt)
          return todoDate >= weekAgo
        })
      } else if (date === "month") {
        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
        filtered = filtered.filter(todo => {
          const todoDate = new Date(todo.createdAt)
          return todoDate >= monthAgo
        })
      }
    }
    
    setFilteredTodos(filtered)
    setCurrentPage(1) // Reset to first page on filter change
  }
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    debouncedSearch(term)
  }
  
  // Effect to update filters
  useEffect(() => {
    filterTodos(searchTerm, priorityFilter, completionFilter, userFilter, dateFilter)
  }, [priorityFilter, completionFilter, userFilter, dateFilter])
  
  return (
    <Card className="w-full min-h-[70vh]">
      <CardHeader className="sticky top-0 bg-card z-10 border-b">
        <CardTitle>All Todos</CardTitle>
        <div className="pt-4">
          {/* Google-like search bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="search"
              placeholder="Search todos by title or description..."
              className="pl-10 pr-4 py-2 rounded-full"
              value={searchTerm}
              onChange={handleSearchChange}
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
                  {uniqueUsers.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
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
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {filteredTodos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No todos match your search criteria. Try adjusting your filters.
          </p>
        ) : (
          <>
            <EnhancedTodoList 
              todos={currentItems} 
              currentUserId={currentUserId} 
            />
            
            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTodos.length)} of {filteredTodos.length} todos
              </div>
              
              <div className="flex items-center gap-2">
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(parseInt(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[100px]">
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
          </>
        )}
      </CardContent>
    </Card>
  )
}