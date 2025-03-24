import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function Home() {
  // Check if user is authenticated
  const session = await auth();
  
  // If authenticated, redirect to user profile
  if (session && session.user) {
    redirect('/user');
  }
  
  return (
    <div className="flex flex-col my-auto py-8">
      <div className="flex flex-col items-center justify-center text-center h-full space-y-10 py-10">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold">Welcome to Todo.App</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple and powerful todo application to help you manage your tasks effectively. 
            Browse public todos or sign in to create and manage your own.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <Button asChild size="lg">
            <Link href="/todos">Browse Todos</Link>
          </Button>
          
          <Button asChild variant="outline" size="lg">
            <Link href="/signin">Sign In / Register</Link>
          </Button>
        </div>
        
        <div className="bg-card rounded-lg p-6 w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Search & Filter</h3>
              <p className="text-muted-foreground">Easily find todos with our powerful search and filter capabilities</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Task Management</h3>
              <p className="text-muted-foreground">Create, edit, and delete your tasks with a beautiful interface</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">User Profiles</h3>
              <p className="text-muted-foreground">Manage your profile and keep track of all your todos in one place</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
