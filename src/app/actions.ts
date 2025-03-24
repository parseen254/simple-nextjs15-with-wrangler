'use server'

import { getDB } from '@/db'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import * as schema from '@/db/schema/schema'
import { getCloudflareContext } from "@opennextjs/cloudflare"

export async function addTodo(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as 'low' | 'medium' | 'high'

  const database = getDB(getCloudflareContext().env.DB)
  
  await database.insert(schema.todos).values({
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