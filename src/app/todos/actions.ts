'use server'

import { getDB } from '@/db'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import * as schema from '@/db/schema/schema'
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { auth } from '@/lib/auth'

// Helper function to check if a user owns a todo
async function checkTodoOwnership(todoId: number, userId: number) {
  const database = getDB(getCloudflareContext().env.DB)
  const todos = await database.select()
    .from(schema.todos)
    .where(eq(schema.todos.id, todoId))
    .limit(1)

  if (todos.length === 0) {
    throw new Error('Todo not found')
  }

  if (todos[0].userId !== userId) {
    throw new Error('You do not have permission to access this todo')
  }

  return todos[0]
}

export async function addTodo(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized: You must be signed in to create todos')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as 'low' | 'medium' | 'high'
  
  if (!title) {
    throw new Error('Title is required')
  }

  const database = getDB(getCloudflareContext().env.DB)
  const result = await database.insert(schema.todos)
    .values({
      title,
      description,
      priority: priority || 'medium',
      completed: false,
      userId: +session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  // Get the created todo with user information
  const todo = await database.select({
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
  .innerJoin(schema.users, eq(schema.users.id, schema.todos.userId))
  .where(eq(schema.todos.id, result[0].id))
  .limit(1)

  revalidatePath('/')
  revalidatePath('/todos')
  return todo[0]
}

export async function toggleTodo(id: number, completed: boolean) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized: You must be signed in to update todos')
  }

  // Verify ownership
  await checkTodoOwnership(id, +session.user.id)

  const database = getDB(getCloudflareContext().env.DB)
  await database.update(schema.todos)
    .set({ completed, updatedAt: new Date() })
    .where(eq(schema.todos.id, id))
  
  // Get the updated todo with user information
  const todo = await database.select({
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
  .innerJoin(schema.users, eq(schema.users.id, schema.todos.userId))
  .where(eq(schema.todos.id, id))
  .limit(1)
  
  return todo[0]
}

export async function deleteTodo(id: number) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized: You must be signed in to delete todos')
  }

  // Verify ownership
  await checkTodoOwnership(id, +session.user.id)

  const database = getDB(getCloudflareContext().env.DB)
  await database.delete(schema.todos)
    .where(eq(schema.todos.id, id))
  
  revalidatePath('/')
  revalidatePath('/todos')
}

export async function updateTodo(id: number, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized: You must be signed in to update todos')
  }

  // Verify ownership
  await checkTodoOwnership(id, +session.user.id)

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as 'low' | 'medium' | 'high'
  
  if (!title) {
    throw new Error('Title is required')
  }

  const database = getDB(getCloudflareContext().env.DB)
  await database.update(schema.todos)
    .set({ 
      title, 
      description, 
      priority: priority || 'medium', 
      updatedAt: new Date() 
    })
    .where(eq(schema.todos.id, id))

  // Get the updated todo with user information
  const todo = await database.select({
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
  .innerJoin(schema.users, eq(schema.users.id, schema.todos.userId))
  .where(eq(schema.todos.id, id))
  .limit(1)
  
  revalidatePath('/')
  revalidatePath('/todos')
  return todo[0]
}

export async function getTodos(userId: number) {
  const database = getDB(getCloudflareContext().env.DB)
  return await database.select({
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
  .innerJoin(schema.users, eq(schema.users.id, schema.todos.userId))
  .where(eq(schema.todos.userId, userId))
  .orderBy(schema.todos.createdAt)
}