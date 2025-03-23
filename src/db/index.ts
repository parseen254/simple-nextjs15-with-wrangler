import { drizzle } from "drizzle-orm/d1";
import { eq, like } from "drizzle-orm";
import * as schema from "./schema/schema";

// Define the type for our DB
export type DB = ReturnType<typeof createDB>;

// Create a function to initialize the drizzle client with the D1 binding
export function createDB(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Todo type based on the schema
export type Todo = typeof schema.todos.$inferSelect;
export type NewTodo = typeof schema.todos.$inferInsert;

// Helper functions for todo CRUD operations
export async function getTodos(db: DB) {
  return await db.select().from(schema.todos);
}

export async function getTodoById(db: DB, id: number) {
  return await db.select().from(schema.todos).where(eq(schema.todos.id, id));
}

export async function searchTodos(db: DB, searchTerm: string) {
  return await db
    .select()
    .from(schema.todos)
    .where(like(schema.todos.title, `%${searchTerm}%`));
}

export async function getCompletedTodos(db: DB) {
  return await db
    .select()
    .from(schema.todos)
    .where(eq(schema.todos.completed, true));
}

export async function createTodo(db: DB, data: NewTodo) {
  return await db.insert(schema.todos).values(data).returning();
}

export async function updateTodo(db: DB, id: number, data: Partial<NewTodo>) {
  return await db
    .update(schema.todos)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.todos.id, id))
    .returning();
}

export async function toggleTodoCompleted(db: DB, id: number, completed: boolean) {
  return await db
    .update(schema.todos)
    .set({ completed, updatedAt: new Date() })
    .where(eq(schema.todos.id, id))
    .returning();
}

export async function deleteTodo(db: DB, id: number) {
  return await db
    .delete(schema.todos)
    .where(eq(schema.todos.id, id))
    .returning();
}