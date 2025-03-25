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
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { updateProfile, splitFullName } from "./actions"

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  // Await searchParams before using it
  const isEditing = (await Promise.resolve(searchParams)).edit === 'true';

  const userId = session.user.id;
  const database = getDB(getCloudflareContext().env.DB);

  const user = await database
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, parseInt(userId || '')))
    .then(users => users[0]);

  const { firstName, lastName } = await splitFullName(user?.name);

  return (
    <main className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>View and manage your account details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form action={updateProfile} className="space-y-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-40 h-40 rounded-full overflow-hidden bg-muted group cursor-pointer">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      {/* Placeholder for profile image */}
                      <svg
                        className="w-20 h-20"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    {/* Translucent overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Change Photo</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={firstName}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={lastName}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <p className="text-lg font-medium text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Member since</Label>
                    <p className="text-lg font-medium text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <Link href="/profile">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-40 h-40 rounded-full overflow-hidden bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      {/* Placeholder for profile image */}
                      <svg
                        className="w-20 h-20"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <p className="text-lg font-medium">{user?.name}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <p className="text-lg font-medium">{user?.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Member since</Label>
                      <p className="text-lg font-medium">
                        {new Date(user?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    {!isEditing && (
                      <Link href="/profile?edit=true">
                        <Button variant="outline">Edit Profile</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </main>
  )
}