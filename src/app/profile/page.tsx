import { getDB } from "@/db"
import * as schema from "@/db/schema/schema"
import { Toaster } from "@/components/ui/sonner"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { eq } from "drizzle-orm"
import { Label } from '@/components/ui/label'
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ProfilePage() {
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
  
  return (
    <main className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>View and manage your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-lg">{user.name || 'Not provided'}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <Label>Member since</Label>
                  <p className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p className="text-lg">
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Link href="/todos">
                  <Button variant="default">
                    Go to My Todos
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </main>
  )
}