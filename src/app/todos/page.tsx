import { AddTodoForm } from "@/components/todos/add-todo-form"
import { PaginatedTodoList } from "@/components/todos/paginated-todo-list"
import { getTodos } from "./actions"
import { auth } from "@/lib/auth"
import { TodoProvider } from "@/components/todos/context/todo-context"

export default async function TodosPage() {
    const session = await auth()
    const currentUserId = session?.user?.id
    const todos = currentUserId ? await getTodos(+currentUserId) : []

    return (
        <main className="container py-8 mx-auto">
            <TodoProvider initialTodos={todos}>
                <div className="flex flex-col md:flex-row items-between justify-between gap-4">
                    <div className="flex-[2]">
                        <PaginatedTodoList currentUserId={currentUserId} />
                    </div>
                    <div className="flex-1 md:sticky md:top-8 h-fit w-full">
                        <AddTodoForm />
                    </div>
                </div>
            </TodoProvider>
        </main>
    )
}