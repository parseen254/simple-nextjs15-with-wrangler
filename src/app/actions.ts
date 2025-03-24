'use server'

import { getDB } from '@/db'
import { revalidatePath } from 'next/cache'
import { eq, desc } from 'drizzle-orm'
import * as schema from '@/db/schema/schema'
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { sendEmail } from '@/lib/aws-ses'
import bcrypt from 'bcryptjs'
import { generateOtp } from '@/lib/utils'
import { User } from 'lucide-react'

export async function addTodo(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as 'low' | 'medium' | 'high'

  const database = getDB(getCloudflareContext().env.DB)
  const userId = 1

  await database.insert(schema.todos).values({
    userId,
    title,
    description,
    priority,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning()

  revalidatePath('/')
}

export async function toggleTodo(id: number, completed: boolean) {
  const database = getDB(getCloudflareContext().env.DB)

  await database.update(schema.todos)
    .set({ completed, updatedAt: new Date() })
    .where(eq(schema.todos.id, id))
    .returning()

  revalidatePath('/')
}

export async function deleteTodo(id: number) {
  const database = getDB(getCloudflareContext().env.DB)

  await database.delete(schema.todos)
    .where(eq(schema.todos.id, id))
    .returning()

  revalidatePath('/')
}

export async function updateTodo(id: number, formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as 'low' | 'medium' | 'high'

  const database = getDB(getCloudflareContext().env.DB)

  await database.update(schema.todos)
    .set({
      title,
      description,
      priority,
      updatedAt: new Date()
    })
    .where(eq(schema.todos.id, id))
    .returning()

  revalidatePath('/')
}

export async function getTodos(userId: number) {
  const database = getDB(getCloudflareContext().env.DB)

  const todos = await database
    .select()
    .from(schema.todos)
    .where(eq(schema.todos.userId, userId))
    .orderBy(desc(schema.todos.createdAt))

  return todos
}

export async function requestOtp(email: string) {
  const database = getDB(getCloudflareContext().env.DB)
  const otp = generateOtp()
  const hashedOtp = await bcrypt.hash(otp, 10)

  await database.insert(schema.otps).values({
    email,
    otp: hashedOtp,
    createdAt: new Date()
  }).returning()

  await sendEmail({
    to: email,
    subject: 'Your Login Verification Code',
    props: {
      otp,
      recipientName: email.split('@')[0] // Use the part before @ as the name
    }
  })

  return { success: true }
}

export async function verifyOtp(email: string, otp: string) {
  const database = getDB(getCloudflareContext().env.DB)

  // Get the latest OTP for the email
  const [otpRecord] = await database
    .select()
    .from(schema.otps)
    .where(eq(schema.otps.email, email))
    .orderBy(desc(schema.otps.createdAt))
    .limit(1)

  if (!otpRecord) {
    throw new Error('OTP not found or expired')
  }

  // Check if OTP is expired (10 minutes)
  const now = new Date()
  const otpCreatedAt = new Date(otpRecord.createdAt)
  if (now.getTime() - otpCreatedAt.getTime() > 10 * 60 * 1000) {
    throw new Error('OTP expired')
  }

  // Verify OTP
  const isValid = await bcrypt.compare(otp, otpRecord.otp)
  if (!isValid) {
    throw new Error('Invalid OTP')
  }

  // Delete used OTP
  await database.delete(schema.otps).where(eq(schema.otps.id, otpRecord.id))

  return { success: true }
}

export async function getUserByEmail(email: string) {
  const database = getDB(getCloudflareContext().env.DB)

  const [user] = await database
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))

  if (user) {
    return {
      id: user.id.toString(), // Convert numeric ID to string
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    }
  }

  return null
}