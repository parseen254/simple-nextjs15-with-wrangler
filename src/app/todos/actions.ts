'use server'

import { getDB, getTodoWithUserInfo, updateTodo as updateTodoInDb } from '@/db'
import { eq, desc } from 'drizzle-orm'
import * as schema from '@/db/schema/schema'
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { auth } from '@/lib/auth'
import { todoSchema, todoUpdateSchema, todoToggleSchema } from '@/lib/zod'
import { revalidatePath } from 'next/cache'

/**
 * Revalidate multiple paths at once
 */
export async function revalidateMultiplePaths(paths: string[]) {
  paths.forEach(path => revalidatePath(path))
}

/**
 * Revalidate todo-related paths
 */
export async function revalidateTodoPaths() {
  revalidatePath('/')
  revalidatePath('/todos')
}

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

  const data = {
    title: formData.get('title'),
    description: formData.get('description'),
    priority: formData.get('priority'),
  }

  // Validate input
  const validated = todoSchema.parse(data)

  const database = getDB(getCloudflareContext().env.DB)
  const todo = await database.insert(schema.todos)
    .values({
      ...validated,
      userId: +session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

  const EnhancedTodo = await getTodoWithUserInfo(database, todo[0].id)

  revalidateTodoPaths()
  return EnhancedTodo[0]
}

export async function toggleTodo(id: number, completed: boolean) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized: You must be signed in to update todos')
  }

  // Validate input
  todoToggleSchema.parse({ completed })

  // Verify ownership
  await checkTodoOwnership(id, +session.user.id)

  const database = getDB(getCloudflareContext().env.DB)
  await database.update(schema.todos)
    .set({ completed, updatedAt: new Date() })
    .where(eq(schema.todos.id, id))

  // Get the updated todo with user information
  const todo = await getTodoWithUserInfo(database, id)

  revalidateTodoPaths()
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

  revalidateTodoPaths()
}

export async function updateTodo(id: number, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized: You must be signed in to update todos')
  }

  // Verify ownership
  await checkTodoOwnership(id, +session.user.id)

  const data = {
    title: formData.get('title'),
    description: formData.get('description'),
    priority: formData.get('priority'),
  }

  // Validate input
  const validated = todoUpdateSchema.parse(data)

  const database = getDB(getCloudflareContext().env.DB)
  await database.update(schema.todos)
    .set({
      ...validated,
      updatedAt: new Date()
    })
    .where(eq(schema.todos.id, id))

  // Get the updated todo with user information
  const todo = await getTodoWithUserInfo(database, id)

  revalidateTodoPaths()
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
    updatedAt: schema.todos.updatedAt,
    userId: schema.todos.userId,
    userName: schema.users.name,
    userEmail: schema.users.email,
  })
  .from(schema.todos)
  .innerJoin(schema.users, eq(schema.users.id, schema.todos.userId))
  .where(eq(schema.todos.userId, userId))
  .orderBy(desc(schema.todos.createdAt))
}