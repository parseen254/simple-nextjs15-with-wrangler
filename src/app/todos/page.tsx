import { getDB } from "@/db"
import * as schema from "@/db/schema/schema"
import { Toaster } from "@/components/ui/sonner"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { PaginatedTodoList } from "@/components/paginated-todo-list"
import { desc, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { AddTodoForm } from "@/components/add-todo-form"

export default async function TodosPage() {
    const database = getDB(getCloudflareContext().env.DB)

    // Get all todos with author info ordered by creation date (newest first)
    const todos = await database
        .select({
            id: schema.todos.id,
            title: schema.todos.title,
            description: schema.todos.description,
            priority: schema.todos.priority,
            completed: schema.todos.completed,
            createdAt: schema.todos.createdAt,
            userId: schema.todos.userId,
            userName: schema.users.name,
            userEmail: schema.users.email,
        })
        .from(schema.todos)
        .innerJoin(schema.users, eq(schema.todos.userId, schema.users.id))
        .orderBy(desc(schema.todos.createdAt));

    // Get current user for permission checks
    const session = await auth();
    const currentUserId = session?.user?.id;

    return (
        <main className="container mx-auto py-8">
            <div className="flex flex-col md:flex-row items-between justify-between gap-4">
                <div className="flex-3 min-h-[80vh] w-full">
                    <PaginatedTodoList todos={todos} currentUserId={currentUserId} />
                </div>
                <div className="flex-1 md:sticky md:top-8 h-fit w-full">
                    <AddTodoForm />
                </div>
            </div>
            <Toaster />
        </main>
    )
}