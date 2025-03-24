import { getDB } from "@/db"
import * as schema from "@/db/schema/schema"
import { Toaster } from "@/components/ui/sonner"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AddTodoForm } from "@/components/add-todo-form"
import { TodoList } from "@/components/todo-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { eq } from "drizzle-orm"

export default async function UserProfile() {
  const session = await auth();
  
  // If user is not logged in, redirect to home page
  if (!session || !session.user) {
    redirect('/');
  }
  
  const userId = session.user.id;
  const database = getDB(getCloudflareContext().env.DB);
  
  // Get user information
  const user = await database
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, parseInt(userId || '')))
    .then(users => users[0]);
  
  // Get user's todos
  const todos = await database
    .select()
    .from(schema.todos)
    .where(eq(schema.todos.userId, parseInt(userId || '')))
    .orderBy(schema.todos.createdAt);
  
  return (
    <main className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your account details and todos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:sticky md:top-8 h-fit">
            <AddTodoForm />
          </div>
          <div className="min-h-[50vh]">
            <TodoList todos={todos} />
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  )
}