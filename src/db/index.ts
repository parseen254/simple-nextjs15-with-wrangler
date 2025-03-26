import { drizzle } from "drizzle-orm/d1";
import { eq, like } from "drizzle-orm";
import * as schema from "./schema/schema";

// Define the type for our DB
export type DB = ReturnType<typeof getDB>;

// Create a function to initialize the drizzle client with the D1 binding
export function getDB(db: D1Database) {
  return drizzle(db, { schema });
}

// Todo type based on the schema
export type Todo = typeof schema.todos.$inferSelect;
export type NewTodo = typeof schema.todos.$inferInsert;

// Helper type for todo with user info
export type TodoWithUserInfo = {
  id: number;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  completed: boolean;
  createdAt: Date;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  updatedAt: Date;
};

// Helper functions for todo CRUD operations
export async function getTodos(db: DB) {
  return await db.select().from(schema.todos);
}

export async function getTodoById(db: DB, id: number) {
  const [todo] = await db
    .select()
    .from(schema.todos)
    .where(eq(schema.todos.id, id))
    .limit(1);

  return todo;
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

export async function createTodo(
  db: DB,
  data: Pick<Todo, "title" | "description" | "priority" | "userId">,
) {
  const [todo] = await db
    .insert(schema.todos)
    .values({
      ...data,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return todo;
}

export async function getTodoWithUserInfo(
  db: DB,
  id: number,
): Promise<TodoWithUserInfo[]> {
  return await db
    .select({
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
    .where(eq(schema.todos.id, id))
    .limit(1);
}

export async function getUserTodos(db: DB, userId: number) {
  return await db
    .select({
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
    .orderBy(schema.todos.createdAt);
}

export async function updateTodo(
  db: DB,
  todoId: number,
  data: Partial<Pick<Todo, "title" | "description" | "priority" | "completed">>,
) {
  const [todo] = await db
    .update(schema.todos)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.todos.id, todoId))
    .returning();

  return todo;
}

export async function toggleTodoCompleted(
  db: DB,
  id: number,
  completed: boolean,
) {
  await db
    .update(schema.todos)
    .set({ completed, updatedAt: new Date() })
    .where(eq(schema.todos.id, id));

  return getTodoWithUserInfo(db, id);
}

export async function deleteTodo(db: DB, todoId: number) {
  return await db
    .delete(schema.todos)
    .where(eq(schema.todos.id, todoId))
    .returning();
}
