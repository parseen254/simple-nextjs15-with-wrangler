'use server'

import { getDB } from '@/db'
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { auth } from '@/lib/auth'
import * as schema from '@/db/schema/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string(),
})

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized: You must be signed in to update your profile')
  }

  const data = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
  }

  // Validate input
  const validated = profileUpdateSchema.parse(data)
  
  // Combine first and last name
  const fullName = [validated.firstName, validated.lastName].filter(Boolean).join(' ')

  const database = getDB(getCloudflareContext().env.DB)
  await database.update(schema.users)
    .set({ 
      name: fullName,
      updatedAt: new Date()
    })
    .where(eq(schema.users.id, +session.user.id))

  revalidatePath('/profile')
}

export async function splitFullName(fullName: string | null) {
  if (!fullName) return { firstName: '', lastName: '' }
  
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ')
  return { firstName, lastName }
}