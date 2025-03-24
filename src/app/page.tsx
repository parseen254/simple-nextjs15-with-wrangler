import { getDB } from "@/db"
import * as schema from "@/db/schema/schema"
import { AddTodoForm } from "@/components/add-todo-form"
import { TodoList } from "@/components/todo-list"
import { Toaster } from "@/components/ui/sonner"
import { getCloudflareContext } from "@opennextjs/cloudflare"

export default async function Home() {
  const database = getDB(getCloudflareContext().env.DB)
  const todos = await database.select().from(schema.todos)

  return (
    <main className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:sticky md:top-8 h-fit">
          <AddTodoForm />
        </div>
        <div className="min-h-[50vh]">
          <TodoList todos={todos} />
        </div>
      </div>
      <Toaster />
    </main>
  )
}
